import { Component, OnInit, Input, Output, AfterViewInit, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeUrl, SafeHtml } from '@angular/platform-browser';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Clipboard } from '@angular/cdk/clipboard';
import { Subscription, interval, fromEvent } from 'rxjs';
import { take, buffer, filter, debounce } from 'rxjs/operators';
import { Link } from '../../utility-classes/reddit_classes';
import { ContentHelper } from '../../utility-classes/content_helper';
import { RedditService } from '../../services/reddit/reddit.service';
import { HeightService } from '../../services/height/height.service';
import { FullPageSparkComponent } from '../fullpagespark/fullpagespark.component';


@Component({
  selector: 'app-spark',
  templateUrl: './spark.component.html',
  styleUrls: ['./spark.component.scss']
})
export class SparkComponent implements OnInit, AfterViewInit {

  @Input() spark: Link;
  @Input() isCrosspostChild: boolean;
  @Output() crosspostWidth = new EventEmitter<number>();
  
  private rem: number;
  private heightSub: Subscription;
  private statusSub: Subscription;
  private element: HTMLElement;
  private originalImgHeight: number;
  private originalImgWidth: number;

  public scaledImgHeight: number;
  public contentHTML: SafeHtml;
  public contentURL: SafeUrl;
  public galleryImgArray: Array<{src: string; x: number; y: number; caption: string}> = new Array();
  public galleryIndex: number = 0;

  public blurContent: boolean;
  public postType: string;
  public includeThumbnail: boolean;
  public selftextOverflows: boolean = false;

  public score: string;
  public num_comments: string;

  constructor(private RedditService: RedditService, private HeightService: HeightService,
    private sanitizer: DomSanitizer, private _bottomSheet: MatBottomSheet, private clipboard: Clipboard, private changeDetection: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.rem = Number(  window.getComputedStyle(document.body).getPropertyValue('font-size').replace(/\D/g,'')  );

    this.HeightService.emberHeight.pipe(take(1)).subscribe( height => {
      let crosspostHeaderHeight: number = this.isCrosspostChild ? 47 : 0;
      let containerHeight = height - (171 + 1.6 * this.rem + crosspostHeaderHeight);
      this.scaledImgHeight = containerHeight;
    })    
    
    switch (this.spark.post_hint) {
      case 'rich:video': {
        this.contentHTML = this.sanitizer.bypassSecurityTrustHtml(this.spark.secure_media_embed.content);
        this.originalImgHeight = this.spark.secure_media_embed.height;
        this.originalImgWidth = this.spark.secure_media_embed.width;
        this.postType = 'richvideo';
        break;
      }
      case 'hosted:video': {
        this.contentURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.spark.secure_media.reddit_video.fallback_url);
        this.originalImgHeight = this.spark.secure_media.reddit_video.height;
        this.originalImgWidth = this.spark.secure_media.reddit_video.width;
        this.postType = 'hostedvideo';
        break;
      }
      case 'image': {
        if (this.spark.preview.enabled) {
          this.originalImgHeight = this.spark.preview.images[0].source.height;
          this.originalImgWidth = this.spark.preview.images[0].source.width;
          this.postType = 'image';
        }
        break;
      }
      case 'link': {
        if (this.spark.crosspost_parent_list) {
          this.postType = 'crosspost';
        } else if (this.spark.preview?.reddit_video_preview?.fallback_url && this.spark.preview.reddit_video_preview.transcoding_status == 'completed') {
          this.postType = 'videopreview';
          let preview = this.spark.preview.reddit_video_preview;
          this.originalImgHeight = preview.height;
          this.originalImgWidth = preview.width;
          this.contentURL = this.sanitizer.bypassSecurityTrustUrl(preview.fallback_url);
        } else { 
          this.postType = 'externallink';
        }
        break;
      }
      case undefined: {
        if (this.spark.gallery_data && this.spark.media_metadata) {
          this.postType = 'gallery';

          this.spark.gallery_data.items.forEach( item => {
            let media = this.spark.media_metadata.get(item.media_id).s;
            this.galleryImgArray.push({src: media.u, x: media.x, y: media.y, caption: item.caption});
            this.originalImgHeight = (media.y < this.originalImgHeight) ? this.originalImgHeight : media.y;
            this.originalImgWidth = (media.x < this.originalImgWidth) ? this.originalImgWidth : media.x;
          })
        } else if (this.spark.poll_data) {
          this.postType = 'poll';
          if (this.spark.selftext_html) { this.contentHTML = ContentHelper.UnescapeHTML(this.spark.selftext_html); }
        } else if (this.spark.selftext_html){
          this.postType = 'selftext';
          this.contentHTML = ContentHelper.UnescapeHTML(this.spark.selftext_html);
        } else if (this.spark.url.includes('i.redd.it')) {
          this.postType = 'hostedimage';
        } else if (this.spark.secure_media?.reddit_video) {
          this.contentURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.spark.secure_media.reddit_video.fallback_url);
          this.originalImgHeight = this.spark.secure_media.reddit_video.height;
          this.originalImgWidth = this.spark.secure_media.reddit_video.width;
          this.postType = 'hostedvideo';
        } else {
          this.postType = 'externallink';
        }
        break;
      }
      case 'self': {
        if(this.spark.selftext_html){
          this.postType = 'selftext';
          this.contentHTML = ContentHelper.UnescapeHTML(this.spark.selftext_html);
        }
        break;
      }
    }

    if (this.postType == 'externallink') {
      if (this.spark.thumbnail.includes('thumbs.redditmedia')) {
        this.includeThumbnail = true;
      } else {
        this.includeThumbnail = false;
      }
    }

    this.blurContent = this.postType == 'crosspost' ? false : this.spark.over_18;
    this.score = ContentHelper.CreatePseudoNumber(this.spark.score);
    this.num_comments = ContentHelper.CreatePseudoNumber(this.spark.num_comments);
  }

  ngAfterViewInit(): void {
    let name = this.spark.name + this.postType;
    this.element = document.getElementById(name);

    if (this.element) {
      ContentHelper.SafeAllATags(this.element);

      this.subscribeToContentScaling();
    } else { console.log(`No element found for spark: ${this.spark.name}`) }

    if (this.blurContent) {
      this.subscribeToNSFWBypass();
    }
  }

  ngOnDestroy(): void {
    if (this.heightSub) {
      this.heightSub.unsubscribe();
    }
    if (this.statusSub) {
      this.statusSub.unsubscribe();
    }
  }

  openfullspark(scrollToComments: boolean) {
    this._bottomSheet.open(FullPageSparkComponent, 
      {data: 
        {
          spark: this.spark,
          contentHTML: this.contentHTML,
          contentURL: this.contentURL,
          galleryImgArray: this.galleryImgArray,
          postType: this.postType,
          blur: this.blurContent,
          originalHeight: this.originalImgHeight,
          originalWidth: this.originalImgWidth,
          scrollToComments: scrollToComments
        }
      }
    );
  }

  copyLinkToClipboard(): void {
    let success = this.clipboard.copy('https://www.reddit.com' + this.spark.permalink);

    if (!success) {
      alert(`Clipboard access denied. \n Link: https://www.reddit.com${this.spark.permalink}`);
    }
  }

  vote(like: boolean) {
    this.spark.likes = this.RedditService.vote(like, this.spark.likes, this.spark.name);
  }

  changeGalleryImage(next: boolean) {
    this.galleryIndex = next ? ++this.galleryIndex : --this.galleryIndex;

    let lastIndex = this.galleryImgArray.length - 1;
    if (this.galleryIndex > lastIndex) {
      this.galleryIndex = 0;
    } else if (this.galleryIndex < 0) {
      this.galleryIndex = lastIndex;
    }
  }

  scaleCard(width: number, max?: boolean) {
    let cardElement = document.getElementById(this.spark.name + 'card').parentNode as HTMLElement;
    let crosspostMargin: number = this.postType == 'crosspost' ? 14 : 0;
    if (max) {
      cardElement.style.maxWidth = `${width + crosspostMargin}px`
      cardElement.style.width = 'unset';
    } else {
      cardElement.style.width = `${width + crosspostMargin}px`;
    }
  }

  private subscribeToContentScaling(): void {
    let crosspostHeaderHeight: number = this.isCrosspostChild ? 47 : 0;
    let crosspostMargin: number = this.postType == 'crosspost' ? 14 : 0;

    let exceptionPostTypes = ['selftext', 'externallink', null, 'hostedimage', 'poll'];
    if (exceptionPostTypes.includes(this.postType)) {
      this.heightSub = this.HeightService.emberHeight.subscribe(height => {
        let maxHeight = height - 171 - (1.6 * this.rem) - crosspostHeaderHeight;
        this.element.style.maxHeight = `${maxHeight}px`;
        
        if (this.postType == 'hostedimage') {
          this.element.style.maxWidth = `${window.innerWidth/2 + 1 * this.rem}px`;
          this.element.style.width = 'auto';
          this.element.style.height = 'auto';
        }
        let setMaxWidth: boolean;
        if (this.postType == 'externallink') { setMaxWidth = true; }
        let cardWidth = window.innerWidth/2 + 1 * this.rem;
        this.scaleCard(cardWidth, setMaxWidth);

        this.selftextOverflows = (this.postType == 'selftext' && this.element.firstElementChild && this.element.firstElementChild.scrollHeight > this.element.firstElementChild.clientHeight);
        this.changeDetection.detectChanges();
      });
    } else {
      this.heightSub = this.HeightService.emberHeight.subscribe(height => {
        let containerHeight = height - (171 + 1.6 * this.rem + crosspostHeaderHeight);
        let halfContainerHeight = height/2 - (171 + 1.2 * this.rem + crosspostHeaderHeight);
        let containerWidth = 0.95 * (window.innerWidth - (5 * this.rem + crosspostMargin));

        this.scaleElement(containerHeight, containerWidth, halfContainerHeight);
      });
    }
  }

  private subscribeToNSFWBypass(): void {
    let nsfwClick$ = fromEvent(document.getElementById(`${this.spark.name}nsfw`), 'click');
    this.statusSub = nsfwClick$.pipe(
      buffer( nsfwClick$.pipe( debounce( () => interval(500)) ) ),
      filter(list => { return list.length >= 2}),
      take(1)
    ).subscribe( () => {
      if (this.spark.over_18 && this.blurContent) {
        this.blurContent = !this.blurContent;
      }
    });
  }

  private scaleElement(containerHeight: number, containerWidth: number, halfContainerHeight: number): number {
    if (containerHeight <= 100) {
      this.element.style.display = 'none';
      this.scaleCard(window.innerWidth/2 + 1 * this.rem);
    }

    if (this.element.style.display == 'none' && containerHeight > 100) {
      this.element.style.display = '';
    }

    if (this.postType == 'richvideo') {
      containerHeight -= 44;
      halfContainerHeight -= 44;
    }

    if (!this.originalImgHeight || !this.originalImgWidth) { return }
    
    let ratio: number = this.originalImgWidth / this.originalImgHeight;
    let setWidth: number;
    let allowableStretch: number = 1.5;

    if (this.originalImgHeight * allowableStretch > containerHeight || this.originalImgWidth * allowableStretch > containerWidth) {
      if (containerHeight * ratio < containerWidth) {
        setWidth = this.scaleByVertical(containerHeight, ratio);
      } else if (containerWidth / ratio < containerHeight) {
        setWidth = this.scaleByHorizontal(containerWidth, ratio);
      } 
    } else if ( this.originalImgHeight * allowableStretch > halfContainerHeight ) {
      if (halfContainerHeight * ratio < containerWidth) {
        setWidth = this.scaleByVertical(halfContainerHeight, ratio);
      } else if (containerWidth / ratio < halfContainerHeight) {
        setWidth = this.scaleByHorizontal(containerWidth, ratio);
      }
    } else {
      this.element.style.height = `${this.originalImgHeight}px`;
      this.element.style.width = `${this.originalImgWidth}px`;

      setWidth = this.originalImgWidth;
    }

    this.scaleCard(setWidth);

    if (this.isCrosspostChild) { this.crosspostWidth.emit(setWidth); }

    if (this.postType == 'richvideo') {
      this.finishScalingRichVideo(setWidth, ratio);
    }
  }

  private scaleByHorizontal(allowableWidth: number, ratio:number): number {
    this.element.style.height = `${allowableWidth / ratio}px`;
    this.element.style.width = `${allowableWidth}px`;
    
    return allowableWidth;
  }

  private scaleByVertical(allowableHeight: number, ratio:number): number{
    this.element.style.height = `${allowableHeight}px`;
    this.element.style.width = `${ratio * allowableHeight}px`;

    return allowableHeight * ratio;
  }

  private finishScalingRichVideo(width: number, ratio: number): void {
    let height = width / ratio;
    this.element.style.height = `${height + 44}px`;
    try {
      let childElement = this.element.childNodes[0] as HTMLIFrameElement;
      childElement.height = this.element.style.height;
      childElement.width = this.element.style.width;
    } catch (err) {console.error(err);}
  }
}