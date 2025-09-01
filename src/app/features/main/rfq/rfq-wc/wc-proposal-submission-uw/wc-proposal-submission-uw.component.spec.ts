import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WcProposalSubmissionUwComponent } from './wc-proposal-submission-uw.component';

describe('WcProposalSubmissionUwComponent', () => {
  let component: WcProposalSubmissionUwComponent;
  let fixture: ComponentFixture<WcProposalSubmissionUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WcProposalSubmissionUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WcProposalSubmissionUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
