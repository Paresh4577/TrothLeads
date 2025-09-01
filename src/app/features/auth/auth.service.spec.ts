import { TestBed } from '@angular/core/testing';

import { authService } from './auth.service';

describe('authService', () => {
  let service: authService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(authService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
