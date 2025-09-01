import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EngineeringProposalSubmissionUwComponent } from './engineering-proposal-submission-uw.component';

describe('EngineeringProposalSubmissionUwComponent', () => {
  let component: EngineeringProposalSubmissionUwComponent;
  let fixture: ComponentFixture<EngineeringProposalSubmissionUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EngineeringProposalSubmissionUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EngineeringProposalSubmissionUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
