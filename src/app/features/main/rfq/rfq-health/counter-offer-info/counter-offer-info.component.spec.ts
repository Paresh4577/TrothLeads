import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CounterOfferInfoComponent } from './counter-offer-info.component';

describe('CounterOfferInfoComponent', () => {
  let component: CounterOfferInfoComponent;
  let fixture: ComponentFixture<CounterOfferInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CounterOfferInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CounterOfferInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
