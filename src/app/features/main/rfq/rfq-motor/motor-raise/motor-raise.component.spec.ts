import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorRaiseComponent } from './motor-raise.component';

describe('MotorRaiseComponent', () => {
  let component: MotorRaiseComponent;
  let fixture: ComponentFixture<MotorRaiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MotorRaiseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MotorRaiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
