import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleTypeListComponent } from './vehicle-type-list.component';

describe('VehicleTypeListComponent', () => {
  let component: VehicleTypeListComponent;
  let fixture: ComponentFixture<VehicleTypeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VehicleTypeListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleTypeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
