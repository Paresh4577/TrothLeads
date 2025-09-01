import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanydetaiComponent } from './companydetai.component';

describe('CompanydetaiComponent', () => {
  let component: CompanydetaiComponent;
  let fixture: ComponentFixture<CompanydetaiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CompanydetaiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanydetaiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
