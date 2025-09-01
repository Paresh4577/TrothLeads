import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviousPolicyDetailsComponent } from './previous-policy-details.component';

describe('PreviousPolicyDetailsComponent', () => {
  let component: PreviousPolicyDetailsComponent;
  let fixture: ComponentFixture<PreviousPolicyDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviousPolicyDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviousPolicyDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
