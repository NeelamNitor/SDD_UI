import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MultiSelectDropdownComponent } from './components/multi-select-dropdown/multi-select-dropdown.component';
import { DatepickerWrapperComponent } from './components/datepicker-wrapper/datepicker-wrapper.component';

@NgModule({
  declarations: [
    MultiSelectDropdownComponent,
    DatepickerWrapperComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectDropdownComponent,
    DatepickerWrapperComponent
  ]
})
export class SharedModule { }
