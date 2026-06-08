import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AddEngagementModule } from '../../shared/components/add-engagement/add-engagement.module';
import { EngagementDetailsModule } from '../../shared/components/engagement-details/engagement-details.module';
import { FundModule } from '../fund/fund.module';
import { ScopingComponent } from './components/scoping/scoping.component';

const routes: Routes = [
  {
    path: '',
    component: ScopingComponent
  }
];

@NgModule({
  declarations: [ScopingComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    AddEngagementModule,
    EngagementDetailsModule,
    FundModule
  ]
})
export class ScopingModule { }
