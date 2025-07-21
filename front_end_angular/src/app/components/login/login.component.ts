import { AuthService } from '../../services/auth/auth.service';
import { Component } from '@angular/core';
import { Router } from "@angular/router";
import {Message} from 'primeng/api';
import {MessageService} from 'primeng/api';
import { Password } from 'primeng';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent{

  msgs: Message[] = [];
  username: string;
  password: Password;

  constructor(
             private messageService: MessageService,
             private authService: AuthService,
             private router: Router
            ) { }

  signIn(): void {
    this.authService.login(this.username, this.password)
    .subscribe(result => {
        if (result){
            this.router.navigate(['/dashboard']);
            this.showSuccess();
        }
        else
           this.showError();
    });
  }

  showError() {
      let errorMess = localStorage.getItem('error');
      this.msgs = [];
      this.msgs.push({severity:'error', summary:'Error Message', detail:'Validation failed: ' + errorMess});
  }

  clear() {
      this.msgs = [];
  }

  showSuccess() {
      this.messageService.add({severity:'success', summary: 'Success', detail:'Logged in successful'});
  }
}

