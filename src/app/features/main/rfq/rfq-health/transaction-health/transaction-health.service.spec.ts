import { TestBed } from '@angular/core/testing';

import { TransactionHealthService } from './transaction-health.service';

describe('TransactionHealthService', () => {
  let service: TransactionHealthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransactionHealthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
