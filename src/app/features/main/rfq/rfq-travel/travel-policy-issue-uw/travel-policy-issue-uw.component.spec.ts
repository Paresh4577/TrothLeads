import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelPolicyIssueUWComponent } from './travel-policy-issue-uw.component';

describe('TravelPolicyIssueUWComponent', () => {
  let component: TravelPolicyIssueUWComponent;
  let fixture: ComponentFixture<TravelPolicyIssueUWComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TravelPolicyIssueUWComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelPolicyIssueUWComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
