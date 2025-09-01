import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ODPremiumComponent } from './odpremium.component';

describe('ODPremiumComponent', () => {
  let component: ODPremiumComponent;
  let fixture: ComponentFixture<ODPremiumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ODPremiumComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ODPremiumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
