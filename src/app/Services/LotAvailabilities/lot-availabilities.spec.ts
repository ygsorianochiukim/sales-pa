import { TestBed } from '@angular/core/testing';

import { LotAvailabilities } from './lot-availabilities';

describe('LotAvailabilities', () => {
  let service: LotAvailabilities;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LotAvailabilities);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
