import { ComponentFixture, TestBed } from '@angular/core/testing';

import { authComponent } from './auth.component';

describe('authComponent', () => {
  let component: authComponent;
  let fixture: ComponentFixture<authComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [authComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(authComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
