import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorQnSelectionSpComponent } from './motor-qn-selection-sp.component';

describe('MotorQnSelectionSpComponent', () => {
  let component: MotorQnSelectionSpComponent;
  let fixture: ComponentFixture<MotorQnSelectionSpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MotorQnSelectionSpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MotorQnSelectionSpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
