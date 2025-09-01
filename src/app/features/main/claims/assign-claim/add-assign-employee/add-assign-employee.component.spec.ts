import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAssignEmployeeComponent } from './add-assign-employee.component';

describe('AddAssignEmployeeComponent', () => {
  let component: AddAssignEmployeeComponent;
  let fixture: ComponentFixture<AddAssignEmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddAssignEmployeeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAssignEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
