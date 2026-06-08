import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AddEngagementComponent } from './add-engagement.component';

@NgModule({
  declarations: [AddEngagementComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  exports: [AddEngagementComponent]
})
export class AddEngagementModule { }
