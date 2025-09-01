import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicydetailComponent } from './policydetail.component';

describe('PolicydetailComponent', () => {
  let component: PolicydetailComponent;
  let fixture: ComponentFixture<PolicydetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PolicydetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolicydetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
