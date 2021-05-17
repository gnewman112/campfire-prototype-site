import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEmberComponent } from './add-ember.component';

describe('ForaBottomSheetComponent', () => {
  let component: AddEmberComponent;
  let fixture: ComponentFixture<AddEmberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEmberComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEmberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
