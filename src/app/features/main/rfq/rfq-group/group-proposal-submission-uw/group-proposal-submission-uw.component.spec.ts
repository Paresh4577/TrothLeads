import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupProposalSubmissionUwComponent } from './group-proposal-submission-uw.component';

describe('GroupProposalSubmissionUwComponent', () => {
  let component: GroupProposalSubmissionUwComponent;
  let fixture: ComponentFixture<GroupProposalSubmissionUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupProposalSubmissionUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupProposalSubmissionUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
