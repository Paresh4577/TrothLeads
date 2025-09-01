import { TestBed } from '@angular/core/testing';

import { RfqPaService } from './rfq-pa.service';

describe('RfqPaService', () => {
  let service: RfqPaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RfqPaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
