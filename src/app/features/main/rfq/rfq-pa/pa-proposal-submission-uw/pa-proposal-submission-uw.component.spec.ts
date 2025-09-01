import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaProposalSubmissionUwComponent } from './pa-proposal-submission-uw.component';

describe('PaProposalSubmissionUwComponent', () => {
  let component: PaProposalSubmissionUwComponent;
  let fixture: ComponentFixture<PaProposalSubmissionUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaProposalSubmissionUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaProposalSubmissionUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
