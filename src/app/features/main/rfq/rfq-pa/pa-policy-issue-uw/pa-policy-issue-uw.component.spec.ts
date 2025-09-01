import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaPolicyIssueUwComponent } from './pa-policy-issue-uw.component';

describe('PaPolicyIssueUwComponent', () => {
  let component: PaPolicyIssueUwComponent;
  let fixture: ComponentFixture<PaPolicyIssueUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaPolicyIssueUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaPolicyIssueUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
