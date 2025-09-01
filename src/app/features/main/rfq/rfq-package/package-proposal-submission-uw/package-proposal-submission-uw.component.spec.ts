import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageProposalSubmissionUwComponent } from './package-proposal-submission-uw.component';

describe('PackageProposalSubmissionUwComponent', () => {
  let component: PackageProposalSubmissionUwComponent;
  let fixture: ComponentFixture<PackageProposalSubmissionUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PackageProposalSubmissionUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PackageProposalSubmissionUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
