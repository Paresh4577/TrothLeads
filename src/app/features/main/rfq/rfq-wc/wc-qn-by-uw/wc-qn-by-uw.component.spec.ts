import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WcQnByUwComponent } from './wc-qn-by-uw.component';

describe('WcQnByUwComponent', () => {
  let component: WcQnByUwComponent;
  let fixture: ComponentFixture<WcQnByUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WcQnByUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WcQnByUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
