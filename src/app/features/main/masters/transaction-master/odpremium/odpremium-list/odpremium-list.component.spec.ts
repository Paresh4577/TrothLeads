import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ODPremiumListComponent } from './odpremium-list.component';

describe('ODPremiumListComponent', () => {
  let component: ODPremiumListComponent;
  let fixture: ComponentFixture<ODPremiumListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ODPremiumListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ODPremiumListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
