import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaRaiseComponent } from './pa-raise.component';

describe('PaRaiseComponent', () => {
  let component: PaRaiseComponent;
  let fixture: ComponentFixture<PaRaiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaRaiseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaRaiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
