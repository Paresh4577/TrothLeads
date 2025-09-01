import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FireProposalSubmissionUwComponent } from './fire-proposal-submission-uw.component';

describe('FireProposalSubmissionUwComponent', () => {
  let component: FireProposalSubmissionUwComponent;
  let fixture: ComponentFixture<FireProposalSubmissionUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FireProposalSubmissionUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FireProposalSubmissionUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
