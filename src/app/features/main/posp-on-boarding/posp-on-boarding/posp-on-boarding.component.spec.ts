import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PospOnBoardingComponent } from './posp-on-boarding.component';

describe('PospOnBoardingComponent', () => {
  let component: PospOnBoardingComponent;
  let fixture: ComponentFixture<PospOnBoardingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PospOnBoardingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PospOnBoardingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
