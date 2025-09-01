import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddClaimDecisionComponent } from './add-claim-decision.component';

describe('AddClaimDecisionComponent', () => {
  let component: AddClaimDecisionComponent;
  let fixture: ComponentFixture<AddClaimDecisionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddClaimDecisionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddClaimDecisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
