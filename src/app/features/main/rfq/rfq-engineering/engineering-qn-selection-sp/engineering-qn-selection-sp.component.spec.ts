import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EngineeringQnSelectionSpComponent } from './engineering-qn-selection-sp.component';

describe('EngineeringQnSelectionSpComponent', () => {
  let component: EngineeringQnSelectionSpComponent;
  let fixture: ComponentFixture<EngineeringQnSelectionSpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EngineeringQnSelectionSpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EngineeringQnSelectionSpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
