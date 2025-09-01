import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiscellaneousQnSelectionSpComponent } from './miscellaneous-qn-selection-sp.component';

describe('MiscellaneousQnSelectionSpComponent', () => {
  let component: MiscellaneousQnSelectionSpComponent;
  let fixture: ComponentFixture<MiscellaneousQnSelectionSpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MiscellaneousQnSelectionSpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiscellaneousQnSelectionSpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
