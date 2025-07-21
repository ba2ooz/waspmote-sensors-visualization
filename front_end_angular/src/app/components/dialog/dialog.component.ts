import { Component, OnInit , Output, EventEmitter } from '@angular/core';
import { Size } from '../../object-models/size.model';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit {

  @Output() getDialogData = new EventEmitter<any>();

  position: string;
  displayPosition: boolean;

  sizes: Size[];
  fromDate: Date;
  toDate: Date;
  selectedSize: Size;

  constructor() {
    this.sizes = [
      {size: 20},
      {size: 50},
      {size: 100}
    ]
  }

  ngOnInit(): void {
    this.position = 'bottom';
    this.hideDialog();
  }

  showDialog(): void {
    this.displayPosition = true;
  }

  hideDialog(): void {
    this.displayPosition = false;
  }

  collectDialogData(): void {

    var collectedData = {
      fromDate: this.fromDate.toISOString().toString().substring(0, 19),
      toDate: this.toDate.toISOString().toString().substring(0, 19),
      size: this.selectedSize.size
    }

    this.getDialogData.emit(collectedData);
    this.hideDialog();
  }

}
