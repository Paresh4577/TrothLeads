import { TestBed } from '@angular/core/testing';

import { ColumnSearchService } from './column-search.service';

describe('ColumnSearchService', () => {
  let service: ColumnSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColumnSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
