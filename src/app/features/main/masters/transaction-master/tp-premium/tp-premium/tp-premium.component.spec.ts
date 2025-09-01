import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TpPremiumComponent } from './tp-premium.component';

describe('TpPremiumComponent', () => {
  let component: TpPremiumComponent;
  let fixture: ComponentFixture<TpPremiumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TpPremiumComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TpPremiumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
