import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';
import 'chartjs-plugin-doughnutlabel';

@Component({
  selector: 'doughnut-chart',
  templateUrl: './doughnut-chart.component.html',
  styleUrls: ['./doughnut-chart.component.css']
})
export class DoughnutChartComponent implements OnInit, OnChanges {

  @Input() receivedData: any;
  @Input() receivedIndex: number;

  doughnutData: any;
  doughnutOptions: any;

  constructor() {
    this.doughnutData =
    {
      labels: ['Empty', 'Full'],
      datasets: [
        {
          data: [33, 67],
          backgroundColor: [

            "#FF6384",
            //"#FFCE56",
            "#36A2EB"
          ],
          hoverBackgroundColor: [

            //"#36A2EB",
            "#FFCE56",
            "#2de627"
          ]
        }]

    };

    this.doughnutOptions = {
      plugins: {
        doughnutlabel: {
          labels: [
            {
              text: '%',
              font: {
                size: '60',
                units: 'em',
                family: 'Arial, Helvetica, sans-serif',
                style: 'italic',
                weight: 'bold'
              },
              color: '#36A2EB'
            }
          ]
        }
      }
    };
  }

  ngOnChanges(changes: SimpleChanges): void {

    if(this.receivedData == undefined){
      return;
    }

    var customData = this.doughnutData;
    var customOptions = this.doughnutOptions;

    customData = this.doughnutData;
    customData.datasets[0].data[1] = this.receivedData[this.receivedIndex]._source.battery;
    customData.datasets[0].data[0] = 100 - this.receivedData[this.receivedIndex]._source.battery;
    customOptions.plugins.doughnutlabel.labels[0].text = this.receivedData[this.receivedIndex]._source.battery.toString() + "%";
    this.doughnutData = Object.assign({}, customData);
    this.doughnutOptions = Object.assign({}, customOptions);
  }

  ngOnInit(): void {
  }

}
