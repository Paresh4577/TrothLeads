import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KYCPopUpComponent } from './kycpop-up.component';

describe('KYCPopUpComponent', () => {
  let component: KYCPopUpComponent;
  let fixture: ComponentFixture<KYCPopUpComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KYCPopUpComponent]
    });
    fixture = TestBed.createComponent(KYCPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
