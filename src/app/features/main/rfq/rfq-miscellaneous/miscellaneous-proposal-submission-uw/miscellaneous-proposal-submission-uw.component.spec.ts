import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiscellaneousProposalSubmissionUwComponent } from './miscellaneous-proposal-submission-uw.component';

describe('MiscellaneousProposalSubmissionUwComponent', () => {
  let component: MiscellaneousProposalSubmissionUwComponent;
  let fixture: ComponentFixture<MiscellaneousProposalSubmissionUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MiscellaneousProposalSubmissionUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiscellaneousProposalSubmissionUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
