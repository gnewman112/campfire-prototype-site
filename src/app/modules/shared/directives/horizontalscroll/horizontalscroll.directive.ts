import { Directive, HostBinding, Host, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[HorizontalScroll]'
})
export class HorizontalScrollDirective {
  private nativeElement: HTMLElement;

  @HostBinding('scrollLeft') private scrollLeft;

  @HostListener('wheel', ['$event']) wheelTurned(wheelEvent: WheelEvent) {
    if (wheelEvent.deltaY && wheelEvent.y && wheelEvent.screenY) {
      this.scrollLeft = this.nativeElement.scrollLeft + Math.sign(wheelEvent.deltaY)*(wheelEvent.screenY-wheelEvent.y);
      wheelEvent.preventDefault();
    } else if (wheelEvent.deltaY) {
      this.scrollLeft = this.nativeElement.scrollLeft + wheelEvent.deltaY;
      wheelEvent.preventDefault();
    } 
  }

  constructor(@Host() element: ElementRef) {
    this.nativeElement = element.nativeElement;
  }
}
