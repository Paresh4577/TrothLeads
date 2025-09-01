import { TestBed } from '@angular/core/testing';

import { GroupPolicyService } from './group-policy.service';

describe('GroupPolicyService', () => {
  let service: GroupPolicyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GroupPolicyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
