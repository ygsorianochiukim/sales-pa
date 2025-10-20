import { TestBed } from '@angular/core/testing';

import { SendOtpServices } from './send-otp-services';

describe('SendOtpServices', () => {
  let service: SendOtpServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SendOtpServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
