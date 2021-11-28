import {NgModule} from '@angular/core';

import {CommonModule} from '@angular/common';
import {V3Routing} from './v3.routing';
import {TestingPageComponent} from './testing-page/testing-page.component';
import {SearchpageComponent} from './searchpage/searchpage.component';

@NgModule({
  imports: [
    CommonModule,
    V3Routing
  ],
  declarations: [
    TestingPageComponent,
    SearchpageComponent
  ]
})
export class V3Module {
}
