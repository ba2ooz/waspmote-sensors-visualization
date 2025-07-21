import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(private authService: AuthService, private messageService: MessageService) { }

  ngOnInit(): void {
  }

  isLogged(): boolean{
    return this.authService.isLoggedIn();
  }

  logOut(): void {
    this.authService.logout();
    this.showSuccess();
  }

  showSuccess(): void {
    this.messageService.add({severity:'success', summary: 'Success', detail:'You logged out'});
  }

}
