import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForwardToCompanyComponent } from './forward-to-company.component';

describe('ForwardToCompanyComponent', () => {
  let component: ForwardToCompanyComponent;
  let fixture: ComponentFixture<ForwardToCompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ForwardToCompanyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForwardToCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
