import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignClaimComponent } from './assign-claim.component';

describe('AssignClaimComponent', () => {
  let component: AssignClaimComponent;
  let fixture: ComponentFixture<AssignClaimComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssignClaimComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignClaimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
