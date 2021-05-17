import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FullPageSparkComponent } from './fullpagespark.component';

describe('FullpagesparkComponent', () => {
  let component: FullPageSparkComponent;
  let fixture: ComponentFixture<FullPageSparkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FullPageSparkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FullPageSparkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
