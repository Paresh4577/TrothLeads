import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadReportsComponent } from './lead-reports.component';

describe('LeadReportsComponent', () => {
  let component: LeadReportsComponent;
  let fixture: ComponentFixture<LeadReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LeadReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeadReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
