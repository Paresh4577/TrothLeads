import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyIssueInfoComponent } from './policy-issue-info.component';

describe('PolicyIssueInfoComponent', () => {
  let component: PolicyIssueInfoComponent;
  let fixture: ComponentFixture<PolicyIssueInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PolicyIssueInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolicyIssueInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
