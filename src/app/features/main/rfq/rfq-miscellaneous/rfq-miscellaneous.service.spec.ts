import { TestBed } from '@angular/core/testing';

import { RfqMiscellaneousService } from './rfq-miscellaneous.service';

describe('RfqMiscellaneousService', () => {
  let service: RfqMiscellaneousService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RfqMiscellaneousService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
