import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RfqAssignUwComponent } from './rfq-assign-uw.component';

describe('RfqAssignUwComponent', () => {
  let component: RfqAssignUwComponent;
  let fixture: ComponentFixture<RfqAssignUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RfqAssignUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RfqAssignUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
