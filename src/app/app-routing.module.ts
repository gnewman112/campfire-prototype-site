import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';

import { OktaCallbackComponent, OktaAuthGuard } from '@okta/okta-angular';

export function OnAuthRequired(oktaAuth, injector) {
  const router = injector.get(Router);

  router.navigate(['/login']);
}

const routes: Routes = [
  {path: '', loadChildren: () => import('./modules/default/default.module').then(m => m.DefaultModule)},
  {path: 'implicit/callback', component: OktaCallbackComponent},
  {path: 'fora', loadChildren: () => import('./modules/fora/fora.module').then(m => m.ForaModule),
    canActivate: [OktaAuthGuard],
    data: { OnAuthRequired },
  },
  {path: '**', redirectTo: '/not_here', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
