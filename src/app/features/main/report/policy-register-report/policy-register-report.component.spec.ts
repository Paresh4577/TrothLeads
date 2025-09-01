import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyRegisterReportComponent } from './policy-register-report.component';

describe('PolicyRegisterReportComponent', () => {
  let component: PolicyRegisterReportComponent;
  let fixture: ComponentFixture<PolicyRegisterReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PolicyRegisterReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolicyRegisterReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
