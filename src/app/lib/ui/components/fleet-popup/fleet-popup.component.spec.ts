import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FleetPopupComponent } from './fleet-popup.component';

describe('FleetPopupComponent', () => {
  let component: FleetPopupComponent;
  let fixture: ComponentFixture<FleetPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FleetPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FleetPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
