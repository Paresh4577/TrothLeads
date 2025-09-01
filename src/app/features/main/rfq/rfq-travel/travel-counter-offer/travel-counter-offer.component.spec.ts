import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelCounterOfferComponent } from './travel-counter-offer.component';

describe('TravelCounterOfferComponent', () => {
  let component: TravelCounterOfferComponent;
  let fixture: ComponentFixture<TravelCounterOfferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TravelCounterOfferComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelCounterOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
