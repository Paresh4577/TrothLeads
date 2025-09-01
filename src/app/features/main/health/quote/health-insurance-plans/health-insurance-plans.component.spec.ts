import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthInsurancePlansComponent } from './health-insurance-plans.component';

describe('HealthInsurancePlansComponent', () => {
  let component: HealthInsurancePlansComponent;
  let fixture: ComponentFixture<HealthInsurancePlansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HealthInsurancePlansComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HealthInsurancePlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
