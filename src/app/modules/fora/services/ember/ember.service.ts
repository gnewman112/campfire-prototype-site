import { Injectable } from '@angular/core';
import { RedditService } from '../reddit/reddit.service';
import { RedditStream } from '../../utility-classes/account_classes'
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmberService {

  constructor(private RedditService: RedditService) {
    this.embers = new Array();
  }

  public embers: Array<RedditStream>;

  //This is for the height service to subscribe to and adjust height if the number of embers drops below the embers per page.
  private _emberQuantity: BehaviorSubject<number> = new BehaviorSubject(0);
  public readonly emberQuantity: Observable<number> = this._emberQuantity.asObservable();

  addEmber(platform: string, subPlatform: string, sort: string, time: string | null) {
    if (platform == 'reddit' && (this.RedditService.subredditNames.includes(subPlatform) || this.RedditService.baseSubreddits.includes(subPlatform))) {
      let stream = new RedditStream(subPlatform, sort, time, undefined);
      this.embers.push(stream);
    } else { console.error(`Unexpected error adding ${platform} - ${subPlatform}.`); }

    this._emberQuantity.next(this.embers.length);
  }

  removeEmber(stream: RedditStream, i: number) {
    if (this.embers[i] = stream) {
      this.embers.splice(i, 1);
    } else { throw new Error(`Unable to remove ember #${i} (${stream.subPlatform})`);}

    this._emberQuantity.next(this.embers.length);
  }
}
