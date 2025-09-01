import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleSubModelListComponent } from './vehicle-sub-model-list.component';

describe('VehicleSubModelListComponent', () => {
  let component: VehicleSubModelListComponent;
  let fixture: ComponentFixture<VehicleSubModelListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VehicleSubModelListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleSubModelListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
