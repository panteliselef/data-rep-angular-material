import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ShortNumberPipe} from '../pipes/short-number.pipe';
import {EmptyIllustrationComponent} from '../components/v3/empty-illustration/empty-illustration.component';



@NgModule({
  declarations: [
    ShortNumberPipe,
    EmptyIllustrationComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ShortNumberPipe,
    EmptyIllustrationComponent
  ]
})
export class SharedModule { }
