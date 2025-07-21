import { MenuItem } from 'primeng/primeng';
import { MessageService } from 'primeng/api'
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
    selector: 'menu',
    templateUrl: './menu.component.html'
})

export class Menu implements OnInit {

  constructor(private router: Router,
              private authService: AuthService,
              private messageService: MessageService
            ){}

  menuitems: MenuItem[];

  ngOnInit(): void {
    this.menuitems = [
      {label: 'Home', icon: 'pi pi-home', routerLink: '/'},
      {label: 'Dashboard', icon: 'pi pi-fw pi-chart-bar', routerLink: '/dashboard'}
    ]
  }

  toShowMenu(): boolean {
    return this.authService.isJwt();
  }

  isLogged(): boolean {
    return this.authService.isLoggedIn();
  }

  logOut(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.showSuccess();
  }

  showSuccess(): void {
    this.messageService.add({severity:'success', summary: 'Success', detail:'You loged out'});
  }
}
