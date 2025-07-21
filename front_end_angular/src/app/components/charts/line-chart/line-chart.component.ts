import { Component, OnInit, OnChanges, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import 'chartjs-plugin-zoom';

@Component({
  selector: 'line-chart',
  templateUrl: './line-chart.component.html' ,
  styleUrls: ['./line-chart.component.css']
})
export class LineChartComponent implements OnInit, OnChanges {

  @Input() receivedData: any;
  @Output() selectedIndex = new EventEmitter<number>();
  lineData: any;
  lineOptions: any;

  minDate: Date;
  maxDate: Date;

  constructor() {
    this.lineData =
    {
			labels: [],
			datasets: [
					{
							label: 'Current hour',
							data: [],
							fill: false,
							borderColor: '#4bc0c0'
					 },
					 {
							 label: 'Previous hour',
							 data: [],
							 fill: false,
							 borderColor: '#565656'
					 },
					 {
						label: 'Current day',
						data: [],
						fill: false,
						borderColor: '#FFCE56'
				}
			],
	  };//lineData

    this.lineOptions =
    {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }],
        xAxes: [{ type: 'time', time: { parser: "YYYY-MM-DD'T'HH:mm:ss", tooltipFormat: 'MM-DD HH:mm' }, ticks: { maxRotation: 10 } }]},

      plugins: {

        zoom: {
          pan: {
            enabled: true,
            mode: '',

            rangeMin: {
              x: this.minDate,
              y: null
            },

            rangeMax: {
              x: this.maxDate,
              y: null
            },

            speed: 20,
            threshold: 10,
          },

          zoom: {
            enabled: true,
            drag: true,
            mode: 'x',

            rangeMin: {
              x: this.minDate,
              y: null
            },
            rangeMax: {
              x: this.maxDate,
              y: null
            },

            speed: 0.1,
            sensitivity: 3,
          }
        }
      }
    };
  }//constructor

  ngOnChanges(changes: SimpleChanges): void {

    if(changes.receivedData.currentValue == undefined){
      return;
    }

    var customData;

    customData = this.lineData;
    customData.labels =  changes.receivedData.currentValue.map(a => a._source.date);
    customData.datasets[0].data = changes.receivedData.currentValue.map(a => a._source.pulviometer1);
    customData.datasets[1].data = changes.receivedData.currentValue.map(a => a._source.pulviometer2);
    customData.datasets[2].data = changes.receivedData.currentValue.map(a => a._source.pulviometer3);

    this.lineData = Object.assign({}, customData);
    this.minDate = this.lineData.datasets[0].data[0];
    this.maxDate = this.lineData.datasets[0].data[this.lineData.datasets[0].data.length - 1];
  }

  selectData(event) {
    this.selectedIndex.emit(event.element._index);
  }

  ngOnInit(): void {
  }
}
