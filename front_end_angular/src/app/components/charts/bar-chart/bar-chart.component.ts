import { Component, OnInit, OnChanges, Input, Output, SimpleChanges, EventEmitter } from '@angular/core';
import 'chartjs-plugin-zoom';

@Component({
  selector: 'bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnInit, OnChanges {

  @Input() receivedData: any;
  @Output() selectedIndex = new EventEmitter<number>();

  barData: any;
  barOptions: any;

  minDate: Date;
  maxDate: Date;

  constructor()
  {
    this.barData = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
          {
              label: 'Temperature',
              backgroundColor: '#42A5F5',
              borderColor: '#1E88E5',
              barPercentage: 0.8,
              barThickness: 'flex',
              //maxBarThickness: 8,
              data: []
          },
          {
              label: 'Soil temperature',
              backgroundColor: '#9CCC65',
              borderColor: '#7CB342',
              barPercentage: 0.8,
              barThickness: 'flex',
              //maxBarThickness: 8,
              data: []
          }
      ]
    };

    this.barOptions =
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
   }

  ngOnChanges(changes: SimpleChanges): void {

    if(changes.receivedData.currentValue == undefined){
      return;
    }

    var customData;

    customData = this.barData;
    customData = this.barData;
    customData.labels =  changes.receivedData.currentValue.map(a => a._source.date);
    customData.datasets[0].data = changes.receivedData.currentValue.map(a => a._source.temperature);
    // customData.datasets[0].data = changes.receivedData.currentValue.map(a => a._source.soil_temp);


    this.barData = Object.assign({}, customData);
    this.minDate = this.barData.datasets[0].data[0];
    this.maxDate = this.barData.datasets[0].data[this.barData.datasets[0].data.length - 1];
  }

  selectData(event) {
    this.selectedIndex.emit(event.element._index);
  }

  ngOnInit(): void {
  }

}
