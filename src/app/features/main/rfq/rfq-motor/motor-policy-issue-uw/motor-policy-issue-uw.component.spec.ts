import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorPolicyIssueUwComponent } from './motor-policy-issue-uw.component';

describe('MotorPolicyIssueUwComponent', () => {
  let component: MotorPolicyIssueUwComponent;
  let fixture: ComponentFixture<MotorPolicyIssueUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MotorPolicyIssueUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MotorPolicyIssueUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
