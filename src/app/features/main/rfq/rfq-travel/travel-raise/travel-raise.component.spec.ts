import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelRaiseComponent } from './travel-raise.component';

describe('TravelRaiseComponent', () => {
  let component: TravelRaiseComponent;
  let fixture: ComponentFixture<TravelRaiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TravelRaiseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelRaiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
