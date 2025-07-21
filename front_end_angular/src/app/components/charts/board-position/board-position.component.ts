import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BoardPositionService } from '../../../services/board/board-position.service';

@Component({
  selector: 'board-position',
  templateUrl: './board-position.component.html'
})
export class BoardPositionComponent implements OnInit {

  @ViewChild('rendererCanvas', {static: true})
  public rendererCanvas: ElementRef<HTMLCanvasElement>;

  public constructor(private boardServ: BoardPositionService) { }

  public ngOnInit(): void {
    this.boardServ.createScene(this.rendererCanvas);
    this.boardServ.animate();
  }

}
