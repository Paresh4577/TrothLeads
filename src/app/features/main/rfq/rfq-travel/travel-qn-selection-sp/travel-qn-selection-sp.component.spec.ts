import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelQnSelectionSPComponent } from './travel-qn-selection-sp.component';

describe('TravelQnSelectionSPComponent', () => {
  let component: TravelQnSelectionSPComponent;
  let fixture: ComponentFixture<TravelQnSelectionSPComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TravelQnSelectionSPComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelQnSelectionSPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
