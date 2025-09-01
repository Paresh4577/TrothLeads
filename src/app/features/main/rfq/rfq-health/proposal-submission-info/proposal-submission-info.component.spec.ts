import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProposalSubmissionInfoComponent } from './proposal-submission-info.component';

describe('ProposalSubmissionInfoComponent', () => {
  let component: ProposalSubmissionInfoComponent;
  let fixture: ComponentFixture<ProposalSubmissionInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProposalSubmissionInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProposalSubmissionInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
