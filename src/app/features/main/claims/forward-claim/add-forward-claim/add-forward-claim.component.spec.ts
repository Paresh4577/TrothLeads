import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddForwardClaimComponent } from './add-forward-claim.component';

describe('AddForwardClaimComponent', () => {
  let component: AddForwardClaimComponent;
  let fixture: ComponentFixture<AddForwardClaimComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddForwardClaimComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddForwardClaimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
