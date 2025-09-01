import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiabilityProposalSubmissionUwComponent } from './liability-proposal-submission-uw.component';

describe('LiabilityProposalSubmissionUwComponent', () => {
  let component: LiabilityProposalSubmissionUwComponent;
  let fixture: ComponentFixture<LiabilityProposalSubmissionUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiabilityProposalSubmissionUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiabilityProposalSubmissionUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
