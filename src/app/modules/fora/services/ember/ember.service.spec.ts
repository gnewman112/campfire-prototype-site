import { TestBed } from '@angular/core/testing';

import { EmberService } from './ember.service';

describe('BottomsheetService', () => {
  let service: EmberService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmberService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
