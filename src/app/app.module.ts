import {CommonModule} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
import {NgxEchartsModule} from 'ngx-echarts';
import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {HeaderComponent} from './components/header/header.component';
import {DiseaseNetworkComponent} from './components/disease-network/disease-network.component';
import {NavbarComponent} from './components/navbar/navbar.component';
import {HomepageComponent} from './components/homepage/homepage.component';
import {ToolbarSearchComponent} from './components/toolbar-search/toolbar-search.component';
import {DatasetNetworkComponent} from './components/dataset-network/dataset-network.component';
import {ToolbarSearchDatasetComponent} from './components/toolbar-search-dataset/toolbar-search-dataset.component';
import {PhenonetNetworkComponent} from './components/v2/phenonet-network-page/phenonet-network.component';
import {GraphFilterBarComponent} from './components/v2/phenonet-network-page/graph-filter-bar/graph-filter-bar.component';
import {PhenonetTopBarComponent} from './components/v2/phenonet-network-page/phenonet-top-bar/phenonet-top-bar.component';
import {HomepageSearchbarComponent} from './components/homepage-searchbar/homepage-searchbar.component';
import {DatasetNetworkPageComponent} from './components/v2/dataset-network-page/dataset-network.component';
import {DatasetTopBarComponent} from './components/v2/dataset-network-page/dataset-top-bar/dataset-top-bar.component';
import {DatasetFilterBarComponent} from './components/v2/dataset-network-page/dataset-filter-bar/dataset-filter-bar.component';
import {SearchResultUrlPipe} from './pipes/search-result-url.pipe';
import {MyAutocompleteDirective} from './directives/my-autocomplete.directive';
import {NavigationBarComponent} from './components/v3/navigation-bar/navigation-bar.component';
import {SearchBarComponent} from './components/v3/search-bar/search-bar.component';
import {ContentLoaderModule} from '@ngneat/content-loader';
import {SharedModule} from './shared/shared.module';
import {SearchAutocompleteService} from './services/search-autocomplete.service';

export function importingEchart(): void {
  import('echarts');
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomepageComponent,
    DiseaseNetworkComponent,
    NavbarComponent,
    ToolbarSearchComponent,
    DatasetNetworkComponent,
    ToolbarSearchDatasetComponent,
    PhenonetNetworkComponent,
    PhenonetTopBarComponent,
    GraphFilterBarComponent,
    HomepageSearchbarComponent,
    DatasetNetworkPageComponent,
    DatasetTopBarComponent,
    DatasetFilterBarComponent,
    SearchResultUrlPipe,
    MyAutocompleteDirective,
    NavigationBarComponent,
    SearchBarComponent,
  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule,
    SharedModule,
    NgxEchartsModule.forRoot({
      /**
       * This will import all modules from echarts.
       * If you only need custom modules,
       * please refer to [Custom Build] section.
       */
      echarts: importingEchart, // or import('./path-to-my-custom-echarts')
    }),
    ContentLoaderModule
  ],
  providers: [
    SearchAutocompleteService
    // {
    //   provide: MAT_TABS_CONFIG,
    //   useValue: { animationDuration: 1000, fitInkBarToContent: true }
    // }
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}
