import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignGroupPolicyComponent } from './assign-group-policy.component';

describe('AssignGroupPolicyComponent', () => {
  let component: AssignGroupPolicyComponent;
  let fixture: ComponentFixture<AssignGroupPolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssignGroupPolicyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignGroupPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
