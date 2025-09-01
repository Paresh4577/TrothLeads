import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoDigitComponent } from './go-digit.component';

describe('GoDigitComponent', () => {
  let component: GoDigitComponent;
  let fixture: ComponentFixture<GoDigitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoDigitComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoDigitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
