import { TestBed } from '@angular/core/testing';

import { BajajService } from './bajaj.service';

describe('BajajService', () => {
  let service: BajajService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BajajService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
