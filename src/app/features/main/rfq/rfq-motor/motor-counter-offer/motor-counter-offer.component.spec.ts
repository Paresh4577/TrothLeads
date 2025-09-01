import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorCounterOfferComponent } from './motor-counter-offer.component';

describe('MotorCounterOfferComponent', () => {
  let component: MotorCounterOfferComponent;
  let fixture: ComponentFixture<MotorCounterOfferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MotorCounterOfferComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MotorCounterOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
