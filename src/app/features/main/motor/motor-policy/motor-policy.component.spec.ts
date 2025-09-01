import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorPolicyComponent } from './motor-policy.component';

describe('MotorPolicyComponent', () => {
  let component: MotorPolicyComponent;
  let fixture: ComponentFixture<MotorPolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MotorPolicyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MotorPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
