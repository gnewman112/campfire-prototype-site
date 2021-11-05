import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AboutThisSiteComponent } from './components/about-this-site/about-this-site.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'about_this_site', component: AboutThisSiteComponent},
  {path: 'login', component: LoginComponent},
  {path: 'not_here', component: PageNotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DefaultRoutingModule { }