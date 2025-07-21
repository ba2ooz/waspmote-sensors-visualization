import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardPositionComponent } from './board-position.component';

describe('BoardPositionComponent', () => {
  let component: BoardPositionComponent;
  let fixture: ComponentFixture<BoardPositionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoardPositionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardPositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
