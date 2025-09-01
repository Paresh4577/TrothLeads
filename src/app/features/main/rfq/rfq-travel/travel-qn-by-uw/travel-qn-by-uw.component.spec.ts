import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelQnByUwComponent } from './travel-qn-by-uw.component';

describe('TravelQnByUwComponent', () => {
  let component: TravelQnByUwComponent;
  let fixture: ComponentFixture<TravelQnByUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TravelQnByUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelQnByUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
