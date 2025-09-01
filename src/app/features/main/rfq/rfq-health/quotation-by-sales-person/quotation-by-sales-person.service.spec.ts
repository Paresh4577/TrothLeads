import { TestBed } from '@angular/core/testing';

import { QuotationBySalesPersonService } from './quotation-by-sales-person.service';

describe('QuotationBySalesPersonService', () => {
  let service: QuotationBySalesPersonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuotationBySalesPersonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
