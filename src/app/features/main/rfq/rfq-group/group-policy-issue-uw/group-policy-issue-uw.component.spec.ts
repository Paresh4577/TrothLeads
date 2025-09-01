import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupPolicyIssueUwComponent } from './group-policy-issue-uw.component';

describe('GroupPolicyIssueUwComponent', () => {
  let component: GroupPolicyIssueUwComponent;
  let fixture: ComponentFixture<GroupPolicyIssueUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupPolicyIssueUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupPolicyIssueUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
