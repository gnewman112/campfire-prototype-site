import { Component, OnInit, Inject, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { Clipboard } from '@angular/cdk/clipboard';
import { Subscription, interval, fromEvent } from 'rxjs';
import { take, buffer, filter, debounce } from 'rxjs/operators';
import { RedditComment, Link } from '../../utility-classes/reddit_classes';
import { ContentHelper } from '../../utility-classes/content_helper';
import { RedditService } from '../../services/reddit/reddit.service';
import { SafeHtml, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-fullpagespark',
  templateUrl: './fullpagespark.component.html',
  styleUrls: ['./fullpagespark.component.scss']
})
export class FullPageSparkComponent implements OnInit, AfterViewInit, OnDestroy {

  public includeThumbnail: boolean;
  public score: string;
  public num_comments: string;
  public loadedComments: Array<RedditComment> = new Array();
  public galleryIndex: number = 0;
  public loadingComments: boolean;
  public errorComments: boolean = false;
  public allowToggle: boolean = false;
  
  private statusSub: Subscription;
  private element: HTMLElement;

  constructor(private _bottomSheetRef: MatBottomSheetRef<FullPageSparkComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) 
      public data: {
        spark: Link,
        contentHTML: SafeHtml,
        contentURL: SafeUrl,
        galleryImgArray: Array<{src: string; x: number; y: number; caption: string}>,
        postType: string,
        blur: boolean,
        originalHeight: number,
        originalWidth: number,
        scrollToComments: boolean
      },
    private RedditService: RedditService, private clipboard: Clipboard, private changeDetection: ChangeDetectorRef) { }

  ngOnInit(): void {
    if (this.data.spark.num_comments > 0) {
      this.loadingComments = true;
      this.errorComments = false;
      this.RedditService.commentStream(this.data.spark.name).pipe(take(1)).subscribe( 
        comments => {
          Array.from(comments).forEach(comment => this.loadedComments.push(comment));
          this.loadingComments = false;
          this.changeDetection.detectChanges();
        },
        err => {
          this.loadingComments = false;
          this.errorComments = true;
          this.changeDetection.detectChanges();
          throw err;
        }
      )
    }

    if (this.data.blur) {
      let nsfwClick$ = fromEvent(document.getElementById(`${this.data.spark.name}fp_nsfw`), 'click');
      this.statusSub = nsfwClick$.pipe(
        buffer( nsfwClick$.pipe( debounce( () => interval(500)) ) ),
        filter(list => { return list.length >= 2}),
        take(1)
      ).subscribe( () => {
        if (this.data.spark.over_18 && this.data.blur) {
          this.data.blur = !this.data.blur;
        }
      });
    }

    if (this.data.postType == 'externallink') {
      if (this.data.spark.thumbnail.includes('thumbs.redditmedia')) {
        this.includeThumbnail = true;
      } else {
        this.includeThumbnail = false;
      }
    }

    if (this.data.originalHeight > window.innerHeight * 0.95 && this.data.postType != 'gallery') {
      this.allowToggle = true;
    }

    this.score = ContentHelper.CreatePseudoNumber(this.data.spark.score);
    this.num_comments = ContentHelper.CreatePseudoNumber(this.data.spark.num_comments);
  }

  ngAfterViewInit(): void {
    let name = this.data.spark.name + 'fp_' + this.data.postType;
    this.element = document.getElementById(name);

    if (this.element) {
      ContentHelper.SafeAllATags(this.element);
    } else { console.log(`No element found for fullpage spark: ${this.data.spark.name}`) }

    if (this.element && this.allowToggle) {
      this.element.style.maxHeight = '92vh';
    }

    if (this.data.postType == 'gallery') {
      const galleryWidth = (window.innerWidth * 0.80) - 52;
      const galleryHeight = (this.data.originalHeight / this.data.originalWidth) * galleryWidth;
      let gallery = document.getElementById(this.data.spark.name + 'fp_fullGallery');
      gallery.style.height = `${galleryHeight}px`;
      /* gallery.style.width = `${this.data.originalWidth}px`; */
    }

    if (this.data.scrollToComments) {
      document.getElementById('comments').scrollIntoView();
    }
  }

  ngOnDestroy(): void {
    if (this.statusSub) {
      this.statusSub.unsubscribe();
    }
  }

  dismiss() {
    this._bottomSheetRef.dismiss();
    //pass back if the post was upvoted or the blur was bypassed
  }

  vote(like: boolean) {
    this.data.spark.likes = this.RedditService.vote(like, this.data.spark.likes, this.data.spark.name);
  }

  copyLinkToClipboard(): void {
    let success = this.clipboard.copy('https://www.reddit.com' + this.data.spark.permalink);

    if (!success) {
      alert(`Clipboard access denied. \n Link: https://www.reddit.com${this.data.spark.permalink}`);
    }
  }

  changeGalleryImage(next: boolean) {
    this.galleryIndex = next ? ++this.galleryIndex : --this.galleryIndex;

    let lastIndex = this.data.galleryImgArray.length - 1;
    if (this.galleryIndex > lastIndex) {
      this.galleryIndex = 0;
    } else if (this.galleryIndex < 0) {
      this.galleryIndex = lastIndex;
    }
  }

  toggleFitContent(isChecked: boolean): void {
    if (!this.element) { return }

    if (isChecked) {
      this.element.style.maxHeight = '92vh';
      this.element.scrollIntoView({behavior: 'smooth', block: 'center'});
    } else {
      this.element.style.maxHeight = '100%';
    }
  }
}
