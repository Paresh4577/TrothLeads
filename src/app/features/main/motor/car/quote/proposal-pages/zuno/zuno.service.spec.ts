import { TestBed } from '@angular/core/testing';

import { ZunoService } from './zuno.service';

describe('ZunoService', () => {
  let service: ZunoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ZunoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
