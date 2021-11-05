import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefaultRoutingModule } from './default-routing.module';

import { MatButtonModule } from '@angular/material/button';
import { SharedModule } from '../shared/shared.module';

import { AboutThisSiteComponent } from './components/about-this-site/about-this-site.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';


@NgModule({
  declarations: [
    AboutThisSiteComponent,
    HomeComponent,
    LoginComponent,
    PageNotFoundComponent
  ],
  imports: [
    CommonModule,
    DefaultRoutingModule,
    SharedModule,
    MatButtonModule
  ]
})
export class DefaultModule {}
