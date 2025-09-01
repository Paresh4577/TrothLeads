import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatrixManagementComponent } from './matrix-management.component';

describe('MatrixManagementComponent', () => {
  let component: MatrixManagementComponent;
  let fixture: ComponentFixture<MatrixManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MatrixManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatrixManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
