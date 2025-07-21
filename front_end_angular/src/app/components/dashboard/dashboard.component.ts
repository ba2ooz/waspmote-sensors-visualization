import { WaspMeteoSource } from '../../object-models/waspMeteo.model';

import { ElasticService } from '../../services/elastic/elastic.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { switchMap, startWith } from 'rxjs/operators';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  elasticData: WaspMeteoSource[];
  sub: Subscription;

  customLabel: string = "RT OFF";
  on_off: boolean = true;

  selectedLineChartIndex: number = 0;

  constructor(private elService: ElasticService) { }

  ngOnInit(): void {
    this.updateCharts();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  updateCharts(): void {

    let doc = {
      fromDate: "",
      toDate: "",
      size: 10
    };

    let getInTime = interval(10000);
    this.sub = getInTime
      .pipe(
        startWith(0),
        switchMap(() => this.elService.getWaspMeteo(doc)),
      )
      .subscribe(response => {
        this.elasticData = <WaspMeteoSource[]>response['hits']['hits'].reverse();
      });

  }

  switchOnOff(): void {
    this.on_off = !this.on_off;

		if(this.on_off){
			this.customLabel = "RT OFF";
			this.ngOnInit();
		}
		else{
			this.customLabel = "RT ON";
			this.ngOnDestroy();
		}
	}

  getFilteredData(data: any): void {
    this.elService.getWaspMeteo(data)
      .subscribe(response => {
        this.elasticData = <WaspMeteoSource[]>response['hits']['hits'];
        console.log(this.elasticData);
      });
  }

  setIndex(event: number): void {
    this.selectedLineChartIndex = event;
  }
}
