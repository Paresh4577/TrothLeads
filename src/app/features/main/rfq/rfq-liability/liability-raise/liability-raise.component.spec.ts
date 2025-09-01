import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiabilityRaiseComponent } from './liability-raise.component';

describe('LiabilityRaiseComponent', () => {
  let component: LiabilityRaiseComponent;
  let fixture: ComponentFixture<LiabilityRaiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiabilityRaiseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiabilityRaiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
