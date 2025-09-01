import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WcRaiseComponent } from './wc-raise.component';

describe('WcRaiseComponent', () => {
  let component: WcRaiseComponent;
  let fixture: ComponentFixture<WcRaiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WcRaiseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WcRaiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
