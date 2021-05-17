import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmberPaginationComponent } from './ember-pagination.component';

describe('EmberPaginationComponent', () => {
  let component: EmberPaginationComponent;
  let fixture: ComponentFixture<EmberPaginationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmberPaginationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmberPaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
