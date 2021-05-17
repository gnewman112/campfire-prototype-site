import { Component, OnInit } from '@angular/core';
import { AddEmberComponent } from './components/add-ember-menu/add-ember.component';
import { EmberService } from './services/ember/ember.service';
import { RedditService } from './services/reddit/reddit.service';
import { HeightService } from './services/height/height.service';
import { ContentHelper } from './utility-classes/content_helper';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-fora',
  templateUrl: './fora.component.html',
  styleUrls: ['./fora.component.scss']
})
export class ForaComponent implements OnInit {
  public optionsVisible: boolean = false;
  public optionsIcon: string = "more_vert";

  public suggestions: Array<{subPlatform: string, sort: string, time: string, displayTime: string}>;

  constructor( public EmberService: EmberService, public RedditService: RedditService, public HeightService: HeightService,
    private _dialog: MatDialog, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    if (this.route.snapshot.data.account_exists) {
      this.RedditService.redditAccountExists.next(this.route.snapshot.data.account_exists);
      this.router.navigate(['/fora']);
    } else if (this.RedditService.redditAccountExists.value || this.RedditService.redditAccountExists.value == null) {
      this.RedditService.getSubreddits().subscribe( subredditNames => {
        if (subredditNames?.length) {
          this.generateSuggestions(subredditNames);
        }
      });
    }

    //add code to load last open embers (send config to server on change and load it on init)
  }

  toggleIcon(): void {
    if (this.optionsIcon == "more_vert") {
      this.optionsIcon = "done";
    }
    else { this.optionsIcon = "more_vert"}
  }

  openCloseOptions(): void {
    this.optionsVisible = !this.optionsVisible;
    this.toggleIcon();
  }

  openBottomSheet(): void {
    this._dialog.open(AddEmberComponent);
  }

  generateSuggestions(subredditNames: string[]):void {
    let options: Array<{sort: string, time: string}> = new Array();
    options.push(
      {sort: "new", time: undefined}, {sort: "new", time: undefined},
      {sort: "rising", time: undefined}, {sort: "rising", time: undefined},
      {sort: "hot", time: undefined}, {sort: "hot", time: undefined},
      {sort: "top", time: "all"}, {sort: "top", time: "all"},
      {sort: "top", time: "year"}, {sort: "top", time: "year"},
      {sort: "top", time: "month"}, {sort: "top", time: "month"},
      {sort: "top", time: "week"}, {sort: "top", time: "week"},
      {sort: "top", time: "day"}, {sort: "top", time: "day"},
      {sort: "top", time: "hour"}, {sort: "top", time: "hour"}
    );
    options.sort(() => Math.random() - 0.5);
    options.sort(() => Math.random() - 0.5);
    options = options.slice(0, 6);
    
    this.suggestions = new Array();
    let lengthS = subredditNames.length;
    
    let suggestionIndicies: Array<number> = new Array();
    for (let i = 0; i < 6; i++) {
      let position = Math.floor(Math.random() * lengthS);
      let count: number = 0;
    
      while (suggestionIndicies.includes(position) && count < 30) {
        position = Math.floor(Math.random() * lengthS);
        count++;
      }
      suggestionIndicies.push(position);
    }

    suggestionIndicies.forEach( (suggestionIndex, optionIndex) => {
      this.suggestions.push({
        subPlatform: subredditNames[suggestionIndex],
        sort: options[optionIndex].sort,
        time: options[optionIndex].time,
        displayTime: ContentHelper.redditTimeConversion(options[optionIndex].time)
      });
    });
  }
}