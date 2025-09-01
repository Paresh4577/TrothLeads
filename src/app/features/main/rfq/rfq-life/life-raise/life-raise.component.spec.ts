import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LifeRaiseComponent } from './life-raise.component';

describe('LifeRaiseComponent', () => {
  let component: LifeRaiseComponent;
  let fixture: ComponentFixture<LifeRaiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LifeRaiseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LifeRaiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
