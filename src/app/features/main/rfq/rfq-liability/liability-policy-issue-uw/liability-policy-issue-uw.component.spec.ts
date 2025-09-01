import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiabilityPolicyIssueUwComponent } from './liability-policy-issue-uw.component';

describe('LiabilityPolicyIssueUwComponent', () => {
  let component: LiabilityPolicyIssueUwComponent;
  let fixture: ComponentFixture<LiabilityPolicyIssueUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiabilityPolicyIssueUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiabilityPolicyIssueUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
