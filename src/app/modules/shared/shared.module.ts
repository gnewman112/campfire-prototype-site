import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HorizontalScrollDirective } from './directives/horizontalscroll/horizontalscroll.directive';
import { ExternalLinkDirective } from './directives/externalLink/external-link.directive';

@NgModule({
  declarations: [
    ExternalLinkDirective,
    HorizontalScrollDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ExternalLinkDirective,
    HorizontalScrollDirective
  ]
})
export class SharedModule { }
