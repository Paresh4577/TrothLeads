import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelProposalSubmissionUWComponent } from './travel-proposal-submission-uw.component';

describe('TravelProposalSubmissionUWComponent', () => {
  let component: TravelProposalSubmissionUWComponent;
  let fixture: ComponentFixture<TravelProposalSubmissionUWComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TravelProposalSubmissionUWComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelProposalSubmissionUWComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
