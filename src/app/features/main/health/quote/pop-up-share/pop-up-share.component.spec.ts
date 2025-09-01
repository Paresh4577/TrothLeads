import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpShareComponent } from './pop-up-share.component';

describe('PopUpShareComponent', () => {
  let component: PopUpShareComponent;
  let fixture: ComponentFixture<PopUpShareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopUpShareComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopUpShareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
