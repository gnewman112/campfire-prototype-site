import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Subject, combineLatest, fromEvent, interval, merge } from 'rxjs';
import { withLatestFrom, buffer, debounce, map, startWith } from 'rxjs/operators';
import { EmberService } from '../../services/ember/ember.service';
import { HeightService } from '../../services/height/height.service';

@Component({
  selector: 'app-ember-pagination',
  templateUrl: './ember-pagination.component.html',
  styleUrls: ['./ember-pagination.component.scss']
})
export class EmberPaginationComponent implements OnInit {
  public buttonsHidden: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public upDisabled: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public downDisabled: BehaviorSubject<boolean> = new BehaviorSubject(true);
  private positionIndex: number = 0;

  private range: {top: number, bottom: number} = {top: 0, bottom: 1};

  constructor(private HeightService: HeightService, private EmberService: EmberService) { }

  ngOnInit(): void {
    let pageUp$ = fromEvent(document.getElementById('emberPageUp'), 'click');
    let pageDown$ = fromEvent(document.getElementById('emberPageDown'), 'click');

    combineLatest([this.HeightService.embersPerPage, this.EmberService.emberQuantity]).subscribe( ([embersPerPage, emberQuantity]) => {
      if (emberQuantity > embersPerPage) {
        this.buttonsHidden.next(false);
        this.range = {top: 0, bottom: emberQuantity - embersPerPage};
      } else {
        this.buttonsHidden.next(true);
      }
      
      if (embersPerPage == emberQuantity) { this.positionIndex = 0; }

      this.checkButtons();
    });
    
    let up$ = pageUp$.pipe(
      buffer( pageUp$.pipe( debounce( () => interval(300)) ) ),
      map(() => { return -1})
    );

    let down$ = pageDown$.pipe(
      buffer( pageDown$.pipe( debounce( () => interval(300)) ) ),
      map(() => { return 1})
    );

    merge(up$, down$).pipe(
      withLatestFrom(this.HeightService.embersPerPage, this.EmberService.emberQuantity),
      map(([change, embersPerPage, emberQuantity]) => this.paging(change, embersPerPage, emberQuantity)),
      withLatestFrom(this.buttonsHidden)
    ).subscribe( ([index, buttonsHidden]) => {
      if (buttonsHidden) { return }

      let element = document.getElementById(`ember${index}`);
      if (element) { element.scrollIntoView({behavior: 'smooth'}); }
      else { console.error(`Unable to scroll to ember ${index}`); }
    });
  }

  private paging(change: number, embersPerPage: number, emberQuantity: number): number {
    let newIndex = this.positionIndex + change;
    
    if (newIndex < this.range.top) {
      newIndex = this.range.top;
    } else if (newIndex > this.range.bottom) {
      newIndex = this.range.bottom;
    } 

    this.positionIndex = newIndex;
    this.checkButtons();
    
    return newIndex;
  }

  private checkButtons() {
    if (this.positionIndex >= this.range.bottom) { this.downDisabled.next(true); }
    else { this.downDisabled.next(false); }

    if (this.positionIndex <= this.range.top) { this.upDisabled.next(true); }
    else { this.upDisabled.next(false); }
  }
}
