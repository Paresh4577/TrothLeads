import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WcQnSelectionSpComponent } from './wc-qn-selection-sp.component';

describe('WcQnSelectionSpComponent', () => {
  let component: WcQnSelectionSpComponent;
  let fixture: ComponentFixture<WcQnSelectionSpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WcQnSelectionSpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WcQnSelectionSpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
