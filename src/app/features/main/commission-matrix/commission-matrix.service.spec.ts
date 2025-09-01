import { TestBed } from '@angular/core/testing';

import { CommissionMatrixService } from './commission-matrix.service';

describe('CommissionMatrixService', () => {
  let service: CommissionMatrixService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommissionMatrixService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
