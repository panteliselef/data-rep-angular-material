import { TestBed } from '@angular/core/testing';

import { GraphFilterBarService } from './graph-filter-bar.service';

describe('GraphFilterBarService', () => {
  let service: GraphFilterBarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GraphFilterBarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
