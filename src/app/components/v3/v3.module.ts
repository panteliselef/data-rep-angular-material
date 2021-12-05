import {NgModule} from '@angular/core';

import {CommonModule} from '@angular/common';
import {V3Routing} from './v3.routing';
import {TestingPageComponent} from './testing-page/testing-page.component';
import {SearchPageComponent} from './search-page/search-page.component';
import {MatIconModule} from '@angular/material/icon';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import {SharedModule} from '../../shared/shared.module';
import { FilterSearchPageComponent } from './search-page/filter-search-page/filter-search-page.component';
import {PhenonetPageComponent} from './phenonet-page/phenonet-page.component';
import {NotFoundPageComponent} from './not-found-page/not-found-page.component';

@NgModule({
  imports: [
    CommonModule,
    V3Routing,
    MatIconModule,
    SharedModule
  ],
  declarations: [
    // Pages
    TestingPageComponent,
    SearchPageComponent,
    PhenonetPageComponent,
    NotFoundPageComponent,
    // Components
    LoadingSpinnerComponent,
    FilterSearchPageComponent
  ]
})
export class V3Module {
}
