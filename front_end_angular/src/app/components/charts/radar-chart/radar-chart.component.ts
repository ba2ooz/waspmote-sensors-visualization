import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'radar-chart',
  templateUrl: './radar-chart.component.html',
  styleUrls: ['./radar-chart.component.css']
})
export class RadarChartComponent implements OnInit, OnChanges {

  @Input() receivedData: any;
  @Input() receivedIndex: number;
  radarData: any;

  constructor() {
    this.radarData = {
      labels: ['N','NE','E','SE', 'S','SW', 'W', 'NW'],
      datasets: [
          {
              label: 'Vane',
              backgroundColor: 'rgba(179,181,198,0.2)',
              borderColor: 'rgba(179,181,198,1)',
              pointBackgroundColor: 'rgba(179,181,198,1)',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: 'rgba(179,181,198,1)',
              data: [0, 0, 0, 0, 0, 0, 0, 0]
          }
      ]
    };
  }
  ngOnChanges(changes: SimpleChanges): void {

    if(this.receivedData == undefined){
      return;
    }

    var customData = this.radarData;
    customData.datasets[0].data = [0,0,0,0,0,0,0,0];

		let ane = this.receivedData[this.receivedIndex]._source.anemometer;
    let vane = this.receivedData[this.receivedIndex]._source.vane;

		switch(vane.length){

			case 1:
				for(var i = 0; i<8; i+=2)
					if(vane == customData.labels[i])
						customData.datasets[0].data[i] = ane;
				break;

			case 2:
				for(var i = 1; i<8; i+=2)
					if(vane == customData.labels[i])
						customData.datasets[0].data[i] = ane;
				break;

			case 3:
				for(var i = 0; i<8; i+=2)
					if(vane.charAt(0) == customData.labels[i])
						customData.datasets[0].data[i] = ane;

				for(var i = 1; i<8; i+=2)
					if(vane.substring(1) == customData.labels[i])
						customData.datasets[0].data[i] = ane;
				break;
		}
		this.radarData = Object.assign({}, customData);
  }

  ngOnInit(): void {
  }

}
