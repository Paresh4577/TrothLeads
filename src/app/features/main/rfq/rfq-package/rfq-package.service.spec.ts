import { TestBed } from '@angular/core/testing';

import { RfqPackageService } from './rfq-package.service';

describe('RfqPackageService', () => {
  let service: RfqPackageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RfqPackageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
