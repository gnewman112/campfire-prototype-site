import { Directive, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { HeightService } from '../../services/height/height.service';
import { Subscription, combineLatest } from 'rxjs';

@Directive({
  selector: '[EmberHeight]'
})
export class EmberHeightDirective implements OnInit, OnDestroy {

  constructor(private element: ElementRef, private HeightService: HeightService) {
    this.nativeElement = this.element.nativeElement;
  }

  private nativeElement: HTMLElement;
  private sub: Subscription;

  ngOnInit(): void {
    this.sub = combineLatest([this.HeightService.embersPerPage, this.HeightService.emberHeight])
      .subscribe(([_, height]) => {
        this.nativeElement.style.height = `${height}px`;
      });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
