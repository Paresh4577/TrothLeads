import { TestBed } from '@angular/core/testing';

import { PaymentLinkService } from './payment-link.service';

describe('PaymentLinkService', () => {
  let service: PaymentLinkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentLinkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
