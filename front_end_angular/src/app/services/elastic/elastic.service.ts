import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DataService } from '../data/data.service';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
  })
export class ElasticService extends DataService{

  constructor(http: HttpClient){
      super("https://127.0.0.1:9092/elastic", http);
  }

  getWasp(resource: any) {
    return this.http.post(
      this.url+"/wasp_sensors",
      JSON.stringify(resource),
      { headers: new HttpHeaders({'Content-Type': 'application/json'})
    })
    .pipe(catchError(this.handleError));
  }

  getWaspMeteo (resource: any){
    return this.http.post(
      this.url+"/meteo_wasp_sensors",
      JSON.stringify(resource),
      { headers: new HttpHeaders({'Content-Type': 'application/json'})
    })
    .pipe(catchError(this.handleError));
  }

  getAcc() {
    return this.http.get(this.url+"/acc_sensor")
    .pipe(
      catchError(this.handleError)
    );
  }
}
