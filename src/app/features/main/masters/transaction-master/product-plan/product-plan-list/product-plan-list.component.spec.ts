import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductPlanListComponent } from './product-plan-list.component';

describe('ProductPlanListComponent', () => {
  let component: ProductPlanListComponent;
  let fixture: ComponentFixture<ProductPlanListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductPlanListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductPlanListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
