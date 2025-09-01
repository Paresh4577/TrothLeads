import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LifePolicyIssueUwComponent } from './life-policy-issue-uw.component';

describe('LifePolicyIssueUwComponent', () => {
  let component: LifePolicyIssueUwComponent;
  let fixture: ComponentFixture<LifePolicyIssueUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LifePolicyIssueUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LifePolicyIssueUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
