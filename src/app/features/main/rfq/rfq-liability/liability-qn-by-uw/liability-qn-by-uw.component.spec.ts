import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiabilityQnByUwComponent } from './liability-qn-by-uw.component';

describe('LiabilityQnByUwComponent', () => {
  let component: LiabilityQnByUwComponent;
  let fixture: ComponentFixture<LiabilityQnByUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiabilityQnByUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiabilityQnByUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
