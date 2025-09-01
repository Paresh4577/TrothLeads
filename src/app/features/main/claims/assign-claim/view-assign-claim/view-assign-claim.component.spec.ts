import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAssignClaimComponent } from './view-assign-claim.component';

describe('ViewAssignClaimComponent', () => {
  let component: ViewAssignClaimComponent;
  let fixture: ComponentFixture<ViewAssignClaimComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewAssignClaimComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAssignClaimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
