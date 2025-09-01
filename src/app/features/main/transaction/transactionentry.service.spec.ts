import { TestBed } from '@angular/core/testing';

import { TransactionentryService } from './transactionentry.service';

describe('TransactionentryService', () => {
  let service: TransactionentryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransactionentryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
