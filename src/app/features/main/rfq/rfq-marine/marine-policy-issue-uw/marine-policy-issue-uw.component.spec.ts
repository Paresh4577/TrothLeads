import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarinePolicyIssueUwComponent } from './marine-policy-issue-uw.component';

describe('MarinePolicyIssueUwComponent', () => {
  let component: MarinePolicyIssueUwComponent;
  let fixture: ComponentFixture<MarinePolicyIssueUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarinePolicyIssueUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarinePolicyIssueUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
