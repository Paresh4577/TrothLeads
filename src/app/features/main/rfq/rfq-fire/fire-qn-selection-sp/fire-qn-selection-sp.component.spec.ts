import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FireQnSelectionSpComponent } from './fire-qn-selection-sp.component';

describe('FireQnSelectionSpComponent', () => {
  let component: FireQnSelectionSpComponent;
  let fixture: ComponentFixture<FireQnSelectionSpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FireQnSelectionSpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FireQnSelectionSpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
