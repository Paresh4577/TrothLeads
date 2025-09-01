import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ICICIHealthComponent } from './icicihealth.component';

describe('ICICIHealthComponent', () => {
  let component: ICICIHealthComponent;
  let fixture: ComponentFixture<ICICIHealthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ICICIHealthComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ICICIHealthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
