import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsuranceCompanyListComponent } from './insurance-company-list.component';

describe('InsuranceCompanyListComponent', () => {
  let component: InsuranceCompanyListComponent;
  let fixture: ComponentFixture<InsuranceCompanyListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InsuranceCompanyListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsuranceCompanyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
