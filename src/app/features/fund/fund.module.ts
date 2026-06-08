import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { SharedModule } from '../../shared/shared.module';
import { fundReducer } from './fund-state/fund.reducer';
import { FundEffects } from './fund-state/fund.effects';
import { FundScopingPageComponent } from './pages/fund-scoping-page/fund-scoping-page.component';
import { FundScopingGridComponent } from './components/fund-scoping-grid/fund-scoping-grid.component';

@NgModule({
  declarations: [
    FundScopingPageComponent,
    FundScopingGridComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    StoreModule.forFeature('fund', fundReducer),
    EffectsModule.forFeature([FundEffects])
  ],
  exports: [
    FundScopingPageComponent
  ]
})
export class FundModule { }
