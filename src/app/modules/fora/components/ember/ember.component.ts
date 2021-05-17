import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AddEmberComponent } from '../add-ember-menu/add-ember.component';
import { RedditService } from '../../services/reddit/reddit.service';
import { RedditStream } from '../../utility-classes/account_classes';
import { Link } from '../../utility-classes/reddit_classes';
import { HeightService } from '../../services/height/height.service';
import { BehaviorSubject, from, merge, Subject } from 'rxjs';
import { map, flatMap, concatMap, skipWhile } from 'rxjs/operators';
import { ContentHelper } from '../../utility-classes/content_helper';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-ember',
  templateUrl: './ember.component.html',
  styleUrls: ['./ember.component.scss']
})
export class EmberComponent implements OnInit {

  @Input() startStream: RedditStream;
  @Output() destroy = new EventEmitter<RedditStream>();

  public loading: boolean;
  public streams: Map<string, RedditStream>;
  public sparks: Array<Link | string> = new Array();
  private sparkStorageMap:  Map<string, Array<Link | string>>;
  private accumulatedNormalizedSliderValues:  Map<string, number>;
  private totalSliders: number = 10;

  public scrolledRight$: BehaviorSubject<null> = new BehaviorSubject(null);
  private renderFinished$: Subject<null> = new Subject();
  private changeSortFinished$: Subject<null> = new Subject();
  private addEmberFinished$: Subject<null> = new Subject();

  constructor(private RedditService: RedditService, public HeightService: HeightService,
    private _dialog: MatDialog) { }

  ngOnInit(): void {
    this.streams = new Map().set(this.startStream.subPlatform, this.startStream);
    this.sparkStorageMap = new Map().set(this.startStream.subPlatform, new Array());
    this.accumulatedNormalizedSliderValues = new Map().set(this.startStream.subPlatform, 1);
    this.accumulateNormalizedSliders();

    let minStoredBeforeRefill = 50;
    let quantityToRender = 10;
    let maxSparksRendered = 500;

    let streamToRefill$ = merge(this.scrolledRight$, this.changeSortFinished$, this.addEmberFinished$).pipe(
      skipWhile(() => this.sparks.length >= maxSparksRendered),
      map( () => {
        let refillKeys: Array<string> = new Array();
        this.sparkStorageMap.forEach((storageArray, key) => {
          if (storageArray.length > minStoredBeforeRefill) { return }
          if (storageArray.includes(this.streams.get(key).subPlatform )) { return }
          if (this.sparks.includes(key)) { return }
          refillKeys.push(key);
        });
        return refillKeys;
      }),
      concatMap(keys => from(keys)),
      map((key) => this.streams.get(key))
    );
    
    let refillResponse$ = streamToRefill$.pipe(
      flatMap( (stream) => {
        this.loading = true;
        return this.RedditService.sparkStream(stream)
      })
    );

    let refillComplete$ = refillResponse$.pipe(
      map(([refillSparks, newAfter, refilledStream]) => {
        this.loading = false;

        let subPlatform = refilledStream.subPlatform;
        let storageArray = this.sparkStorageMap.get(subPlatform).concat(refillSparks);

        if (newAfter) {
          let newStream = this.streams.get(subPlatform);
          newStream.after = newAfter;
          this.streams.set(subPlatform, newStream);
        } else {
          storageArray.push(subPlatform);
        }

        this.sparkStorageMap.set(subPlatform, storageArray);

        return null;
      })
    );

    let renderSparksEvent$ = merge(this.scrolledRight$, refillComplete$).pipe(
      skipWhile(() => this.sparks.length >= maxSparksRendered),
      skipWhile(() => {
        let finished = this.sparks.filter( value => {return (typeof value == 'string')} ).length;
        return finished >= this.streams.size;
      })
    );

    renderSparksEvent$.subscribe(
      () => {
        let sparksStored = 0, sparksStoredBySubPlatform: Map<string, number> = new Map();
        this.sparkStorageMap.forEach( (storageArray, subPlatform) => {
          sparksStored += storageArray.length;
          sparksStoredBySubPlatform.set(subPlatform, storageArray.length);
        })

        let quantityToRenderThisTime = quantityToRender < sparksStored ? quantityToRender : sparksStored;

        for (let i = 0; i < quantityToRenderThisTime; i ++) {
          let position = Math.random();
    
          this.accumulatedNormalizedSliderValues.forEach((accumulatedValue, subPlatform) => {
            let storageArray = this.sparkStorageMap.get(subPlatform);
            
            if (position <= accumulatedValue && storageArray.length > 0) {
              this.sparks.push(storageArray.shift());
              this.sparkStorageMap.set(subPlatform, storageArray);
            }
          });
        }
        this.renderFinished$.next(null);
      },
      err => {
        this.loading = false;
        console.error(err);
      },
      () => {
        this.sparkStorageMap.clear();
      }
    );
  }

  openBottomSheet(): void {
    let streamsInEmber: Array<RedditStream> = Array.from(this.streams.values());
    const dialogRef = this._dialog.open(AddEmberComponent, {data: {streamsInEmber: streamsInEmber} });
    dialogRef.afterClosed().subscribe( (outputData: {platform: string, subPlatform: string, sort: string, time: string | undefined}) => {
      this.addToEmber(outputData.platform, outputData.subPlatform, outputData.sort, outputData.time);
    });
  }

  addToEmber(platform: string, subPlatform: string, sort: string, time?: string): void {
    if (!time) { time = undefined}

    if (platform == 'reddit') {
      let addStream = new RedditStream(subPlatform, sort, time, undefined);
      this.streams.set(addStream.subPlatform, addStream);

      this.sparkStorageMap.set(addStream.subPlatform, new Array());

      this.totalSliders += 10;
      this.accumulateNormalizedSliders();
      this.addEmberFinished$.next(null);
    } else {throw new Error('Unable to add stream to selected ember.')}
  }

  removeFromEmber(removeStream: RedditStream, index: number): void {
    if (this.streams.has(removeStream.subPlatform)) {
      this.streams.delete(removeStream.subPlatform);

      if (this.streams.size < 1) {
        this.destroy.emit(this.startStream);
      }

      this.sparkStorageMap.delete(removeStream.subPlatform);

      this.accumulatedNormalizedSliderValues.delete(removeStream.subPlatform);
      this.totalSliders -= removeStream.count;
      this.accumulateNormalizedSliders();

      this.filterSparks(removeStream.subPlatform);
    } else { throw new Error(`Unable to remove stream #${index} (${removeStream.subPlatform})`)}
  }

  changeEmberSort(changeStream: RedditStream, index: number, newSort: string, newTime?: string) {
    if (!newTime) { newTime = undefined };

    if (this.streams.has(changeStream.subPlatform)) {
      changeStream.sort = newSort;
      changeStream.time = newTime;
      changeStream.after = undefined;
      this.streams.set(changeStream.subPlatform, changeStream);
      this.sparkStorageMap.set(changeStream.subPlatform, new Array());
      
      this.filterSparks(changeStream.subPlatform);

      this.changeSortFinished$.next(null);
    } else { throw new Error(`Unable to edit stream #${index} (${changeStream.subPlatform})`)}
  }

  onSliderChange(sliderChangeStream: RedditStream, newSliderValue: number, index: number) {
    if (this.streams.has(sliderChangeStream.subPlatform)) {
      sliderChangeStream.count = newSliderValue;
      this.streams.set(sliderChangeStream.subPlatform, sliderChangeStream);

      this.totalSliders = this.totalSliders + newSliderValue - sliderChangeStream.count;
      this.accumulateNormalizedSliders();
    } else { throw new Error(`Unable to change slider value to ${newSliderValue} for stream #${index} (${sliderChangeStream.subPlatform})`)}
  }

  isString(value: any): boolean {
    return typeof value == 'string';
  }

  getValues(streams: Map<string, RedditStream>): Array<RedditStream> {
    return Array.from(streams.values());
  }

  private filterSparks(removeSubPlatform: string): void {
    this.sparks = this.sparks.filter(sparkORsubPlatform => {
      if (sparkORsubPlatform instanceof Link) {
        return sparkORsubPlatform.subreddit != removeSubPlatform
      } else { return sparkORsubPlatform != (removeSubPlatform) }
    });
  }

  private accumulateNormalizedSliders(): void {
    let newValue: number = 0;
    this.streams.forEach((stream) => {
      newValue += (stream.count / this.totalSliders)
      this.accumulatedNormalizedSliderValues.set(stream.subPlatform, newValue);
    });
  }

  /**
   * Returns a mixed case string matching reddit's Time names
   * @param time Must be one of RedditService.possibleTimes()
   */
  timeConversion = ContentHelper.redditTimeConversion;
}