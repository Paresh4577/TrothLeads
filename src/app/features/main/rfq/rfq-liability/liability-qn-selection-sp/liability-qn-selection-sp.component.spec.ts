import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiabilityQnSelectionSpComponent } from './liability-qn-selection-sp.component';

describe('LiabilityQnSelectionSpComponent', () => {
  let component: LiabilityQnSelectionSpComponent;
  let fixture: ComponentFixture<LiabilityQnSelectionSpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiabilityQnSelectionSpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiabilityQnSelectionSpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
