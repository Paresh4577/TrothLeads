import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanListingComponent } from './plan-listing.component';

describe('PlanListingComponent', () => {
  let component: PlanListingComponent;
  let fixture: ComponentFixture<PlanListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanListingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
