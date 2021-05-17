import { Component, OnInit, Inject } from '@angular/core';
import { RedditService } from '../../services/reddit/reddit.service';
import { EmberService } from '../../services/ember/ember.service';
import { RedditStream } from '../../utility-classes/account_classes';
import { KeyValue } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-add-ember',
  templateUrl: './add-ember.component.html',
  styleUrls: ['./add-ember.component.scss']
})
export class AddEmberComponent implements OnInit {

  constructor(public RedditService: RedditService,
    private EmberService: EmberService,
    private dialogRef: MatDialogRef<AddEmberComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {streamsInEmber: Array<RedditStream>}) { }

  ngOnInit(): void {
    if (this.data && this.data.streamsInEmber.length > 0) {
      this.subPlatforms = Array.from(this.data.streamsInEmber.map(value => {return value.subPlatform}));
    }
  }

  public subPlatforms: Array<string>;

  keyAscOrder(a: KeyValue<string,Object>, b: KeyValue<string,Object>): number {
    return a.key.toLowerCase().localeCompare(b.key.toLowerCase());
  }

  addStream(platform: string, subPlatform: string, sort: string, time?: string) {
    if (!time) { time = undefined };

    if (this.data) { 
      this.dialogRef.close({platform, subPlatform, sort, time})
    }
    else {
      this.EmberService.addEmber(platform, subPlatform, sort, time);
      this.dialogRef.close();
    }
  }

  disableButton(subreddit: string): boolean {
    if (this.subPlatforms && this.subPlatforms.includes(subreddit)) {
      return true;
    }
    return false;
  }
}