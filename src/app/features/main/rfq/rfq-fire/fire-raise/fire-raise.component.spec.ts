import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FireRaiseComponent } from './fire-raise.component';

describe('FireRaiseComponent', () => {
  let component: FireRaiseComponent;
  let fixture: ComponentFixture<FireRaiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FireRaiseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FireRaiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
