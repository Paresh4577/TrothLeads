import { TestBed } from '@angular/core/testing';

import { CommonFunctionsService } from './common-functions.service';

describe('CommonFunctionsService', () => {
  let service: CommonFunctionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommonFunctionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
