import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarineQnByUwComponent } from './marine-qn-by-uw.component';

describe('MarineQnByUwComponent', () => {
  let component: MarineQnByUwComponent;
  let fixture: ComponentFixture<MarineQnByUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarineQnByUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarineQnByUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
