import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { RedditService } from '../../services/reddit/reddit.service';
import { ContentHelper } from '../../utility-classes/content_helper';
import { RedditComment } from '../../utility-classes/reddit_classes';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit, AfterViewInit {

  @Input() comment: RedditComment;

  public score: string;
  public ups: string;
  public downs: string;
  public num_replies: string;
  public bodyText: string;
  public hideComment: boolean = false;
  public displayedReplies: Array<RedditComment> = new Array();
  public remainingReplies: Array<RedditComment> = new Array();

  constructor(private RedditService: RedditService, private clipboard: Clipboard) { }

  ngOnInit(): void {
    this.score = ContentHelper.CreatePseudoNumber(this.comment.score);
    this.ups = ContentHelper.CreatePseudoNumber(this.comment.ups);
    this.downs = ContentHelper.CreatePseudoNumber(this.comment.downs);
    this.num_replies = ContentHelper.CreatePseudoNumber(this.comment.replies.length);
    this.bodyText = ContentHelper.UnescapeHTML(this.comment.body_html);

    this.comment.replies.forEach(reply => {
      if (!reply.collapsed) {
        this.displayedReplies.push(reply);
      } else {
        this.remainingReplies.push(reply);
      }
    })
  }

  ngAfterViewInit(): void {
    let element = document.getElementById(this.comment.name);

    if (element) {
      ContentHelper.SafeAllATags(element);
    } else { console.log(`No element found for comment: ${this.comment.name}`) }
  }

  vote(like: boolean) {
    this.comment.likes = this.RedditService.vote(like, this.comment.likes, this.comment.link_id);
  }

  copyLinkToClipboard(): void {
    let success = this.clipboard.copy('https://www.reddit.com' + this.comment.permalink);

    if (!success) {
      alert(`Clipboard access denied. \n Link: https://www.reddit.com${this.comment.permalink}`);
    }
  }

  showRemainingComments() {
    if (this.remainingReplies.length) {
      this.displayedReplies.push(...this.remainingReplies);
      this.remainingReplies = [];
    }
  }
}