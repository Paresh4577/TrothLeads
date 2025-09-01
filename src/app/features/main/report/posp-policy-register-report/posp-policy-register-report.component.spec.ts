import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PospPolicyRegisterReportComponent } from './posp-policy-register-report.component';

describe('PospPolicyRegisterReportComponent', () => {
  let component: PospPolicyRegisterReportComponent;
  let fixture: ComponentFixture<PospPolicyRegisterReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PospPolicyRegisterReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PospPolicyRegisterReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
