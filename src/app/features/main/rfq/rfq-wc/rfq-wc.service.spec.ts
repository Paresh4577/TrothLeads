import { TestBed } from '@angular/core/testing';

import { RfqWcService } from './rfq-wc.service';

describe('RfqWcService', () => {
  let service: RfqWcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RfqWcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
