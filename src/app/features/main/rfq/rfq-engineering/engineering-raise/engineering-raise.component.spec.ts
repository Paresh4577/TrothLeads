import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EngineeringRaiseComponent } from './engineering-raise.component';

describe('EngineeringRaiseComponent', () => {
  let component: EngineeringRaiseComponent;
  let fixture: ComponentFixture<EngineeringRaiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EngineeringRaiseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EngineeringRaiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
