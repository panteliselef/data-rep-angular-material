import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ShortNumberPipe} from '../pipes/short-number.pipe';



@NgModule({
  declarations: [
    ShortNumberPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ShortNumberPipe
  ]
})
export class SharedModule { }
