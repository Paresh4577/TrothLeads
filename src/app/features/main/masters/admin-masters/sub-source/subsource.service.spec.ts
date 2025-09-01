import { TestBed } from '@angular/core/testing';

import { SubsourceService } from './subsource.service';

describe('SubsourceService', () => {
  let service: SubsourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubsourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
