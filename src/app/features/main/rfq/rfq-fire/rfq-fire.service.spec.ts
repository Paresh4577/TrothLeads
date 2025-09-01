import { TestBed } from '@angular/core/testing';

import { RfqFireService } from './rfq-fire.service';

describe('RfqFireService', () => {
  let service: RfqFireService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RfqFireService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
