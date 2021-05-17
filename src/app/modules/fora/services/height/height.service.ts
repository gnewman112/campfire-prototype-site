import { Injectable, HostListener } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
import { EmberService } from '../ember/ember.service';

@Injectable({
  providedIn: 'root'
})

/**
 * Updates the (per page) allowable # of embers, current number of embers, and disabled button status.
 * This is done whenever the number of embers changes, the number of embers per page changes, or the window is resized.
 */
export class HeightService {
  public minHeight: number = 186;
  private maxEmbersPerPage: number;
  private currentQuantityEmbers: number = 0;

  private _embersPerPage: BehaviorSubject<number> = new BehaviorSubject(1);
  private _letBigger: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private _letSmaller: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private _emberHeight: BehaviorSubject<number>;

  public readonly embersPerPage: Observable<number> = this._embersPerPage.asObservable();
  public readonly letBigger: Observable<boolean> = this._letBigger.asObservable();
  public readonly letSmaller: Observable<boolean> = this._letSmaller.asObservable();
  public readonly emberHeight: Observable<number>;

  constructor(private EmberService: EmberService) { 
    this.maxEmbersPerPage = this.emberAllowanceCalc();

    let height = this.emberHeightCalc(this._embersPerPage.value);
    this._emberHeight = new BehaviorSubject(height);
    this.emberHeight = this._emberHeight.asObservable();
    
    this.EmberService.emberQuantity.subscribe(length => {
      this.currentQuantityEmbers = length;
      let currentEmbersPerPage = this._embersPerPage.value;
      if (this.currentQuantityEmbers < currentEmbersPerPage && this.currentQuantityEmbers > 0) {
        this._embersPerPage.next(this.currentQuantityEmbers);
        currentEmbersPerPage = this.currentQuantityEmbers;
      }
      this.updateButtons(currentEmbersPerPage);
      this.updateHeight(currentEmbersPerPage);
    });

    fromEvent(window, 'resize').subscribe( () => {
      this.maxEmbersPerPage = this.emberAllowanceCalc();

      let currentEmbersPerPage = this._embersPerPage.value;
      if (currentEmbersPerPage > this.maxEmbersPerPage) {
        currentEmbersPerPage = this.maxEmbersPerPage;
        this._embersPerPage.next(this.maxEmbersPerPage)
      }

      this.updateButtons(currentEmbersPerPage);
      this.updateHeight(currentEmbersPerPage);
    })
  }

  zoomIn(In: boolean) {
    let currentEmbersPerPage = this._embersPerPage.value;
    if (In) { currentEmbersPerPage-- } 
    else { currentEmbersPerPage++ }

    if (this.currentQuantityEmbers < currentEmbersPerPage && this.currentQuantityEmbers > 0) {
      this._embersPerPage.next(this.currentQuantityEmbers);
      currentEmbersPerPage = this.currentQuantityEmbers;
    } else {
      this._embersPerPage.next(currentEmbersPerPage);
    }

    this.updateButtons(currentEmbersPerPage);
    this.updateHeight(currentEmbersPerPage);
  }

  private updateButtons(cEPP?: number): void {
    let currentEmbersPerPage = cEPP ? cEPP : this._embersPerPage.value;

    if (currentEmbersPerPage <= 1) {
      this._letBigger.next(false);
    } else if (this.currentQuantityEmbers > 1) {
      this._letBigger.next(true);
    }
    
    if (currentEmbersPerPage >= this.maxEmbersPerPage || currentEmbersPerPage >= this.currentQuantityEmbers) {
      this._letSmaller.next(false);
    } else if (currentEmbersPerPage < this.currentQuantityEmbers) {
      this._letSmaller.next(true);
    }
  }
  
  private updateHeight(currentEmbersPerPage: number): void {
    let height = this.emberHeightCalc(currentEmbersPerPage);
    this._emberHeight.next(height);
  }

  /**   * Divides the available window height by the input value.   */
  private emberHeightCalc(value: number): number {
    let toolbar = document.getElementById("toolbar").offsetHeight;
    return (window.innerHeight - toolbar) / value;
  }

  private emberAllowanceCalc(): number {
    let maxEmbers = Math.floor( this.emberHeightCalc(this.minHeight) );

    if (maxEmbers < 1) { maxEmbers = 1 }
    
    return maxEmbers;
  }
}