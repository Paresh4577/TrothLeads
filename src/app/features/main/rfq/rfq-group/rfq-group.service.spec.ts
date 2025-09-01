import { TestBed } from '@angular/core/testing';

import { RfqGroupService } from './rfq-group.service';

describe('RfqGroupService', () => {
  let service: RfqGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RfqGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
