import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LifeQnByUwComponent } from './life-qn-by-uw.component';

describe('LifeQnByUwComponent', () => {
  let component: LifeQnByUwComponent;
  let fixture: ComponentFixture<LifeQnByUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LifeQnByUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LifeQnByUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
