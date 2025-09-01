import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleTypeImportComponent } from './vehicle-type-import.component';

describe('VehicleTypeImportComponent', () => {
  let component: VehicleTypeImportComponent;
  let fixture: ComponentFixture<VehicleTypeImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VehicleTypeImportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleTypeImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
