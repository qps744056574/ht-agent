import { TestBed, inject } from '@angular/core/testing';

import { SubmitService } from './submit.service';

describe('SubmitService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SubmitService]
    });
  });

  it('should ...', inject([SubmitService], (service: SubmitService) => {
    expect(service).toBeTruthy();
  }));
});
