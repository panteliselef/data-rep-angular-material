import {NgModule} from '@angular/core';

import {CommonModule} from '@angular/common';
import {V3Routing} from './v3.routing';
import {TestingPageComponent} from './testing-page/testing-page.component';
import {SearchpageComponent} from './searchpage/searchpage.component';
import {MatIconModule} from '@angular/material/icon';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    V3Routing,
    MatIconModule,
    SharedModule
  ],
  declarations: [
    TestingPageComponent,
    SearchpageComponent,
    LoadingSpinnerComponent
  ]
})
export class V3Module {
}
