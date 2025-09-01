import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaQnSelectionSpComponent } from './pa-qn-selection-sp.component';

describe('PaQnSelectionSpComponent', () => {
  let component: PaQnSelectionSpComponent;
  let fixture: ComponentFixture<PaQnSelectionSpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaQnSelectionSpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaQnSelectionSpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
