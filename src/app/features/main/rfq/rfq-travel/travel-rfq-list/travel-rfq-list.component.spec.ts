import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelRfqListComponent } from './travel-rfq-list.component';

describe('TravelRfqListComponent', () => {
  let component: TravelRfqListComponent;
  let fixture: ComponentFixture<TravelRfqListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TravelRfqListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelRfqListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
