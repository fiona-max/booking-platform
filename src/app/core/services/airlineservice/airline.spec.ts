import { TestBed } from '@angular/core/testing';

import { Airline } from './airline';

describe('Airline', () => {
  let service: Airline;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Airline);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
