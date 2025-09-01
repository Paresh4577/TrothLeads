import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiscellaneousQnByUwComponent } from './miscellaneous-qn-by-uw.component';

describe('MiscellaneousQnByUwComponent', () => {
  let component: MiscellaneousQnByUwComponent;
  let fixture: ComponentFixture<MiscellaneousQnByUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MiscellaneousQnByUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiscellaneousQnByUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
