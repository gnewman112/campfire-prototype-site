import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ForaComponent } from './fora.component';

const routes: Routes = [
  {path: '', component: ForaComponent},
  {path: 'account_exists', component: ForaComponent, data: {account_exists: true}}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ForaRoutingModule { }