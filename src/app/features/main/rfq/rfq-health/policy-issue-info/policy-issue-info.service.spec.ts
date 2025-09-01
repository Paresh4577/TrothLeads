import { TestBed } from '@angular/core/testing';

import { PolicyIssueInfoService } from './policy-issue-info.service';

describe('PolicyIssueInfoService', () => {
  let service: PolicyIssueInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PolicyIssueInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
