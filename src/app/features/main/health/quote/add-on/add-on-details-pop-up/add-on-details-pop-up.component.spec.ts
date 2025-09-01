import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOnDetailsPopUpComponent } from './add-on-details-pop-up.component';

describe('AddOnDetailsPopUpComponent', () => {
  let component: AddOnDetailsPopUpComponent;
  let fixture: ComponentFixture<AddOnDetailsPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddOnDetailsPopUpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddOnDetailsPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
