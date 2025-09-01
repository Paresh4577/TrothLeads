import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarineCounterOfferComponent } from './marine-counter-offer.component';

describe('MarineCounterOfferComponent', () => {
  let component: MarineCounterOfferComponent;
  let fixture: ComponentFixture<MarineCounterOfferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarineCounterOfferComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarineCounterOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
