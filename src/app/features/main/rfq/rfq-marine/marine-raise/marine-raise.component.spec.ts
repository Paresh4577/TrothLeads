import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarineRaiseComponent } from './marine-raise.component';

describe('MarineRaiseComponent', () => {
  let component: MarineRaiseComponent;
  let fixture: ComponentFixture<MarineRaiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarineRaiseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarineRaiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
