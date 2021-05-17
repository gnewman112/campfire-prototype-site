import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';

import { OktaCallbackComponent, OktaAuthGuard } from '@okta/okta-angular';

import { HomeComponent } from './components/home/home.component';
import { AboutThisSiteComponent } from './components/about-this-site/about-this-site.component';
import { LoginComponent } from './components/login/login.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';

export function OnAuthRequired(oktaAuth, injector) {
  const router = injector.get(Router);

  router.navigate(['/login']);
}

const routes: Routes = [
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: 'implicit/callback', component: OktaCallbackComponent},
  {path: 'home', component: HomeComponent},
  {path: 'about_this_site', component: AboutThisSiteComponent},
  {path: 'login', component: LoginComponent},
  {path: 'fora', loadChildren: () => import('./modules/fora/fora.module').then(m => m.ForaModule),
    canActivate: [OktaAuthGuard],
    data: { OnAuthRequired },
  },
  {path: 'not_here', component: PageNotFoundComponent},
  {path: '**', redirectTo: '/not_here', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
