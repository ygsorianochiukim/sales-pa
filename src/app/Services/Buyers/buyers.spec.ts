import { TestBed } from '@angular/core/testing';

import { Buyers } from './buyers';

describe('Buyers', () => {
  let service: Buyers;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Buyers);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
