import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleBrandListComponent } from './vehicle-brand-list.component';

describe('VehicleBrandListComponent', () => {
  let component: VehicleBrandListComponent;
  let fixture: ComponentFixture<VehicleBrandListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VehicleBrandListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleBrandListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
