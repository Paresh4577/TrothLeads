import { TestBed } from '@angular/core/testing';
import { RFQMarineService } from './rfq-marine.service';

describe('RFQMarineServiceService', () => {
  let service: RFQMarineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RFQMarineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
