import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorQnByUwComponent } from './motor-qn-by-uw.component';

describe('MotorQnByUwComponent', () => {
  let component: MotorQnByUwComponent;
  let fixture: ComponentFixture<MotorQnByUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MotorQnByUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MotorQnByUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
