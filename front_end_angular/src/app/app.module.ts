import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { PasswordModule } from 'primeng/password';
import { MenubarModule } from 'primeng/menubar';

import { AppHttpInterceptor } from './interceptor/interceptor.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BoardPositionComponent } from './components/charts/board-position/board-position.component';
import { ElasticService } from './services/elastic/elastic.service';
import { AppErrorHandler } from './components/common/global-error-handler';
import { Menu } from './components/menu/menu.component';
import { LoginComponent } from './components/login/login.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DialogComponent } from './components/dialog/dialog.component';
import { BarChartComponent } from './components/charts/bar-chart/bar-chart.component';
import { LineChartComponent } from './components/charts/line-chart/line-chart.component';
import { DoughnutChartComponent } from './components/charts/doughnut-chart/doughnut-chart.component';
import { RadarChartComponent } from './components/charts/radar-chart/radar-chart.component';

@NgModule({
  declarations: [
    AppComponent,
    BoardPositionComponent,
    LineChartComponent,
    DashboardComponent,
    DialogComponent,
    LoginComponent,
    NavbarComponent,
    Menu,
    BarChartComponent,
    DoughnutChartComponent,
    RadarChartComponent
  ],
  imports: [
    FormsModule,
    DropdownModule,
    BrowserModule,
    NoopAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ButtonModule,
    MessageModule,
    MessagesModule,
    ChartModule,
    InputTextModule,
    CalendarModule,
    DialogModule,
    BrowserAnimationsModule,
    ToastModule,
    ReactiveFormsModule,
    FormsModule,
    PasswordModule,
    MenubarModule
  ],
  providers: [
    MessageService,
    ElasticService,
    { provide: ErrorHandler, useClass: AppErrorHandler},
    { provide: HTTP_INTERCEPTORS, useClass: AppHttpInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
