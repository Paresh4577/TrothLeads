import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleSubModelComponent } from './vehicle-sub-model.component';

describe('VehicleSubModelComponent', () => {
  let component: VehicleSubModelComponent;
  let fixture: ComponentFixture<VehicleSubModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VehicleSubModelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleSubModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
