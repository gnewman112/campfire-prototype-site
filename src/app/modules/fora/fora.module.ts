import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForaRoutingModule } from './fora-routing.module';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { ForaComponent } from './fora.component';
import { AddEmberComponent } from './components/add-ember-menu/add-ember.component';
import { EmberComponent } from './components/ember/ember.component';
import { SparkComponent } from './components/spark/spark.component';
import { FullPageSparkComponent } from './components/fullpagespark/fullpagespark.component';
import { CommentComponent } from './components/comment/comment.component';

import { EmberHeightDirective } from './directives/emberHeight/height-ember.directive';
import { EmberPaginationComponent } from './components/ember-pagination/ember-pagination.component'
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    ForaComponent,
    AddEmberComponent,
    EmberComponent,
    SparkComponent,
    FullPageSparkComponent,
    CommentComponent,
    EmberPaginationComponent,

    EmberHeightDirective
  ],
  imports: [
    CommonModule,
    ForaRoutingModule,
    SharedModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatButtonToggleModule,
    MatSliderModule,
    MatTooltipModule,
    MatBottomSheetModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatDialogModule,
    ClipboardModule,
    InfiniteScrollModule
  ]
})
export class ForaModule {}
