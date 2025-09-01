import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EngineeringQnByUwComponent } from './engineering-qn-by-uw.component';

describe('EngineeringQnByUwComponent', () => {
  let component: EngineeringQnByUwComponent;
  let fixture: ComponentFixture<EngineeringQnByUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EngineeringQnByUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EngineeringQnByUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
