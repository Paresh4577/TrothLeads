import { TestBed } from '@angular/core/testing';

import { TataAiaService } from './tata-aia.service';

describe('TataAiaService', () => {
  let service: TataAiaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TataAiaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
