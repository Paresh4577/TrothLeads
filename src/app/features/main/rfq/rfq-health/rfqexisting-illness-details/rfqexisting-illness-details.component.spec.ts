import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RFQExistingIllnessDetailsComponent } from './rfqexisting-illness-details.component';

describe('RFQExistingIllnessDetailsComponent', () => {
  let component: RFQExistingIllnessDetailsComponent;
  let fixture: ComponentFixture<RFQExistingIllnessDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RFQExistingIllnessDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RFQExistingIllnessDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
