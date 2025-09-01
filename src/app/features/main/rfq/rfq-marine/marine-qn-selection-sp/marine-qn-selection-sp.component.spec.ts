import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarineQnSelectionSpComponent } from './marine-qn-selection-sp.component';

describe('MarineQnSelectionSpComponent', () => {
  let component: MarineQnSelectionSpComponent;
  let fixture: ComponentFixture<MarineQnSelectionSpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarineQnSelectionSpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarineQnSelectionSpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
