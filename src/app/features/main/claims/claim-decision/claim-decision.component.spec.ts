import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimDecisionComponent } from './claim-decision.component';

describe('ClaimDecisionComponent', () => {
  let component: ClaimDecisionComponent;
  let fixture: ComponentFixture<ClaimDecisionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClaimDecisionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimDecisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
