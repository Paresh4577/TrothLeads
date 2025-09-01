import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorProposalSubmissionUwComponent } from './motor-proposal-submission-uw.component';

describe('MotorProposalSubmissionUwComponent', () => {
  let component: MotorProposalSubmissionUwComponent;
  let fixture: ComponentFixture<MotorProposalSubmissionUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MotorProposalSubmissionUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MotorProposalSubmissionUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
