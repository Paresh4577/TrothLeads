import { TestBed } from '@angular/core/testing';

import { RfqLifeService } from './rfq-life.service';

describe('RfqLifeService', () => {
  let service: RfqLifeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RfqLifeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
