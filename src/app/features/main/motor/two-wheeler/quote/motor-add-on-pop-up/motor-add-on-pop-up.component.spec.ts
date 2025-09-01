import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorAddOnPopUpComponent } from './motor-add-on-pop-up.component';

describe('MotorAddOnPopUpComponent', () => {
  let component: MotorAddOnPopUpComponent;
  let fixture: ComponentFixture<MotorAddOnPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MotorAddOnPopUpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MotorAddOnPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
