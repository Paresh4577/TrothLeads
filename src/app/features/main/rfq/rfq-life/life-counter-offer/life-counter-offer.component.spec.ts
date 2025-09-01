import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LifeCounterOfferComponent } from './life-counter-offer.component';

describe('LifeCounterOfferComponent', () => {
  let component: LifeCounterOfferComponent;
  let fixture: ComponentFixture<LifeCounterOfferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LifeCounterOfferComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LifeCounterOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
