import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleModelListComponent } from './vehicle-model-list.component';

describe('VehicleModelListComponent', () => {
  let component: VehicleModelListComponent;
  let fixture: ComponentFixture<VehicleModelListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VehicleModelListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleModelListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
