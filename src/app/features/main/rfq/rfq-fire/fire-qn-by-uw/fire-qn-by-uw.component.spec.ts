import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FireQnByUwComponent } from './fire-qn-by-uw.component';

describe('FireQnByUwComponent', () => {
  let component: FireQnByUwComponent;
  let fixture: ComponentFixture<FireQnByUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FireQnByUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FireQnByUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
