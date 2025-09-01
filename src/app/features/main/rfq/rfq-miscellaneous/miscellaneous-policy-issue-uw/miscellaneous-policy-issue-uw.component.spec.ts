import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiscellaneousPolicyIssueUwComponent } from './miscellaneous-policy-issue-uw.component';

describe('MiscellaneousPolicyIssueUwComponent', () => {
  let component: MiscellaneousPolicyIssueUwComponent;
  let fixture: ComponentFixture<MiscellaneousPolicyIssueUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MiscellaneousPolicyIssueUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiscellaneousPolicyIssueUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
