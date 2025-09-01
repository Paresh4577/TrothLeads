import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductPlanPopupComponent } from './product-plan-popup.component';

describe('ProductPlanPopupComponent', () => {
  let component: ProductPlanPopupComponent;
  let fixture: ComponentFixture<ProductPlanPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductPlanPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductPlanPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
