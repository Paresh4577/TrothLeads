import { TestBed } from '@angular/core/testing';

import { GoDigitService } from './go-digit.service';

describe('GoDigitService', () => {
  let service: GoDigitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoDigitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
