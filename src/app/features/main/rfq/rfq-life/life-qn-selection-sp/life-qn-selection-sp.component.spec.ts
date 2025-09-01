import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LifeQnSelectionSpComponent } from './life-qn-selection-sp.component';

describe('LifeQnSelectionSpComponent', () => {
  let component: LifeQnSelectionSpComponent;
  let fixture: ComponentFixture<LifeQnSelectionSpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LifeQnSelectionSpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LifeQnSelectionSpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
