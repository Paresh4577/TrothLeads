import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackagePolicyIssueUwComponent } from './package-policy-issue-uw.component';

describe('PackagePolicyIssueUwComponent', () => {
  let component: PackagePolicyIssueUwComponent;
  let fixture: ComponentFixture<PackagePolicyIssueUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PackagePolicyIssueUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PackagePolicyIssueUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
