import {NgModule} from '@angular/core';

import {CommonModule} from '@angular/common';
import {V3Routing} from './v3.routing';
import {TestingPageComponent} from './testing-page/testing-page.component';
import {SearchpageComponent} from './searchpage/searchpage.component';
import {MatIconModule} from '@angular/material/icon';

@NgModule({
  imports: [
    CommonModule,
    V3Routing,
    MatIconModule
  ],
  declarations: [
    TestingPageComponent,
    SearchpageComponent
  ]
})
export class V3Module {
}
