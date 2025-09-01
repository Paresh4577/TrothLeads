import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EngineeringPolicyIssueUwComponent } from './engineering-policy-issue-uw.component';

describe('EngineeringPolicyIssueUwComponent', () => {
  let component: EngineeringPolicyIssueUwComponent;
  let fixture: ComponentFixture<EngineeringPolicyIssueUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EngineeringPolicyIssueUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EngineeringPolicyIssueUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
