import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'scoping',
    loadChildren: () => import('./features/scoping/scoping.module').then(m => m.ScopingModule)
  },
  {
    path: '',
    redirectTo: 'scoping',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'scoping'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    initialNavigation: 'enabledNonBlocking'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
