import { TestBed } from '@angular/core/testing';

import { ProposalSubmissionInfoService } from './proposal-submission-info.service';

describe('ProposalSubmissionInfoService', () => {
  let service: ProposalSubmissionInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProposalSubmissionInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
