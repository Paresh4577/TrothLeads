import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaQnByUwComponent } from './pa-qn-by-uw.component';

describe('PaQnByUwComponent', () => {
  let component: PaQnByUwComponent;
  let fixture: ComponentFixture<PaQnByUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaQnByUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaQnByUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
