import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirePolicyIssueUwComponent } from './fire-policy-issue-uw.component';

describe('FirePolicyIssueUwComponent', () => {
  let component: FirePolicyIssueUwComponent;
  let fixture: ComponentFixture<FirePolicyIssueUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FirePolicyIssueUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FirePolicyIssueUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
