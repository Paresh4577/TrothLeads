import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarineProposalSubmissionUwComponent } from './marine-proposal-submission-uw.component';

describe('MarineProposalSubmissionUwComponent', () => {
  let component: MarineProposalSubmissionUwComponent;
  let fixture: ComponentFixture<MarineProposalSubmissionUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarineProposalSubmissionUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarineProposalSubmissionUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
