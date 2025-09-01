import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TpPremiumListComponent } from './tp-premium-list.component';

describe('TpPremiumListComponent', () => {
  let component: TpPremiumListComponent;
  let fixture: ComponentFixture<TpPremiumListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TpPremiumListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TpPremiumListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
