import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenPopupComponent } from './gen-popup.component';

describe('GenPopupComponent', () => {
  let component: GenPopupComponent;
  let fixture: ComponentFixture<GenPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
