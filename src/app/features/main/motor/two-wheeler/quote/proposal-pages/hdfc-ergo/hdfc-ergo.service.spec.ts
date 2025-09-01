import { TestBed } from '@angular/core/testing';

import { HdfcErgoService } from './hdfc-ergo.service';

describe('HdfcErgoService', () => {
  let service: HdfcErgoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HdfcErgoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
