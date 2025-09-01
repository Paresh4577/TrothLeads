import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WcCounterOfferComponent } from './wc-counter-offer.component';

describe('WcCounterOfferComponent', () => {
  let component: WcCounterOfferComponent;
  let fixture: ComponentFixture<WcCounterOfferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WcCounterOfferComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WcCounterOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
