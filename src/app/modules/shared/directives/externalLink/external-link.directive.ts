import { Directive, HostBinding, Input, OnChanges } from '@angular/core';

@Directive({
  selector: 'a[href]'
})
export class ExternalLinkDirective implements OnChanges{
  @HostBinding('attr.rel') relAttr = '';
  @HostBinding('attr.target') targetAttr = '';
  @HostBinding('attr.href') hrefAttr = '';
  @Input() href: string;

  ngOnChanges(): void {
    this.hrefAttr = this.href;

    if ( this.href && !this.href.includes(location.hostname) ) {
      this.relAttr = 'noopener';
      this.targetAttr = '_blank';
    }
  }
}