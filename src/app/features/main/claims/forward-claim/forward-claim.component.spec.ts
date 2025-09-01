import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForwardClaimComponent } from './forward-claim.component';

describe('ForwardClaimComponent', () => {
  let component: ForwardClaimComponent;
  let fixture: ComponentFixture<ForwardClaimComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ForwardClaimComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForwardClaimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
