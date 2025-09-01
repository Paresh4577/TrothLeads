import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WcPolicyIssueUwComponent } from './wc-policy-issue-uw.component';

describe('WcPolicyIssueUwComponent', () => {
  let component: WcPolicyIssueUwComponent;
  let fixture: ComponentFixture<WcPolicyIssueUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WcPolicyIssueUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WcPolicyIssueUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
