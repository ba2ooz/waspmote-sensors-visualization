import { TestBed } from '@angular/core/testing';

import { BoardPositionService } from './board-position.service';

describe('BoardPositionService', () => {
  let service: BoardPositionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoardPositionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
