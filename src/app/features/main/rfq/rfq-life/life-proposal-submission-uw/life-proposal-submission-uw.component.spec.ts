import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LifeProposalSubmissionUwComponent } from './life-proposal-submission-uw.component';

describe('LifeProposalSubmissionUwComponent', () => {
  let component: LifeProposalSubmissionUwComponent;
  let fixture: ComponentFixture<LifeProposalSubmissionUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LifeProposalSubmissionUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LifeProposalSubmissionUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
