import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PospOnBoardingListComponent } from './posp-on-boarding-list.component';

describe('PospOnBoardingListComponent', () => {
  let component: PospOnBoardingListComponent;
  let fixture: ComponentFixture<PospOnBoardingListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PospOnBoardingListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PospOnBoardingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
