import { AuthService } from '../services/auth/auth.service';
import { MessageService } from 'primeng/api';
import { Injectable } from "@angular/core";
import {
    HttpInterceptor,
    HttpRequest,
    HttpErrorResponse,
    HttpHandler,
    HttpEvent
} from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { Router } from '@angular/router'


@Injectable()
export class AppHttpInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private messageService: MessageService,
    private authService: AuthService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token: string = localStorage.getItem('id_token');

    if(token && this.authService.isLoggedIn){
      req = req.clone({ headers: req.headers.set('Authorization', 'Bearer ' + token)})
    }

    if(!req.headers.has('Content-Type')){
      req = req.clone({ headers: req.headers.set('Content-Type', 'application/json') });
    }

    req = req.clone({ headers: req.headers.set('Accept', 'application/json') });

    //send the newly created request
    return next.handle(req)
      .catch(err => {
        // onError
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            localStorage.removeItem('id_token');
            this.router.navigate(["/login"]);
            this.messageService.add({severity:'warn', summary: 'Logged out', detail:'You have been Logged out. Please Log in again in order to use the service.'});
          }
        }
        return Observable.throwError(err);
      });
    }
}
