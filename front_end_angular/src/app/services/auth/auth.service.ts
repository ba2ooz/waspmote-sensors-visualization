import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../data/data.service';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
  })
export class AuthService extends DataService{
  constructor(http: HttpClient){
      super("http://localhost:9091", http);
  }

  login(username, password) {
    return this.http.post(
      this.url + '/login',
      JSON.stringify({username: username, password: password})
      )
      .pipe(
        map(res => {
          if(res && res['id_token']){
            let result = res;
            localStorage.setItem('id_token', result['id_token']);
            localStorage.setItem('expires_at', result['expires_at']);
            return true;
          }
          localStorage.setItem('error', res['error']);
          return false;
        })
      )
  }

  logout(): void {
    localStorage.removeItem("id_token");
    localStorage.removeItem("expires_at");
  }

  isJwt(): boolean {
    let token = localStorage.getItem("id_token");
    if(token != null)
      return true;
    return false;
  }

  isLoggedIn(): boolean {
    let token = localStorage.getItem("id_token");
    if(!token)
      return false;
    let isExp = localStorage.getItem('expires_at');
    let current_date = Date.now().valueOf() / 1000;
    if(current_date > parseFloat(isExp))
      return false
    return true;
  }
}
