import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationBySalesPersonComponent } from './quotation-by-sales-person.component';

describe('QuotationBySalesPersonComponent', () => {
  let component: QuotationBySalesPersonComponent;
  let fixture: ComponentFixture<QuotationBySalesPersonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuotationBySalesPersonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuotationBySalesPersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
