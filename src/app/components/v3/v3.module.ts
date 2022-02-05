import {NgModule} from '@angular/core';

import {CommonModule} from '@angular/common';
import {V3Routing} from './v3.routing';
import {TestingPageComponent} from './testing-page/testing-page.component';
import {SearchPageComponent} from './search-page/search-page.component';
import {MatIconModule} from '@angular/material/icon';
import {LoadingSpinnerComponent} from './loading-spinner/loading-spinner.component';
import {SharedModule} from '../../shared/shared.module';
import {FilterSearchPageComponent} from './search-page/filter-search-page/filter-search-page.component';
import {PhenonetPageComponent} from './phenonet-page/phenonet-page.component';
import {NotFoundPageComponent} from './not-found-page/not-found-page.component';
import {PhenonetBreadcrumbComponent} from './phenonet-page/phenonet-breadcrumb/phenonet-breadcrumb.component';
import {PGraphFiltersComponent} from './phenonet-page/p-graph-filters/p-graph-filters.component';
import {PlatformsPageComponent} from './platforms-page/platforms-page.component';
import {PlatformPageComponent} from './platforms-page/platform-page/platform-page.component';
import {PlatformBreadcrumbComponent} from './platforms-page/platform-page/platform-breadcrumb/platform-breadcrumb.component';

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
    PlatformPageComponent,
    PlatformsPageComponent,
    PlatformBreadcrumbComponent,
    NotFoundPageComponent,
    // Components
    LoadingSpinnerComponent,
    FilterSearchPageComponent,
    PhenonetBreadcrumbComponent,
    PGraphFiltersComponent
  ]
})
export class V3Module {
}
