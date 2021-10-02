import {CommonModule} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
import {NgxEchartsModule} from 'ngx-echarts';
import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';


import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';
import {MatSelectModule} from '@angular/material/select';
import {MatSliderModule} from '@angular/material/slider';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatTabsModule} from '@angular/material/tabs';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatChipsModule} from '@angular/material/chips';
import {MatBadgeModule} from '@angular/material/badge';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatRadioModule} from '@angular/material/radio';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {VisModule} from 'ngx-vis';



import {HeaderComponent} from './components/header/header.component';
import {DiseaseNetworkComponent} from './components/disease-network/disease-network.component';
import {VisualizationsComponent} from './components/visualizations/visualizations.component';
import {NavbarComponent} from './components/navbar/navbar.component';
import {HomepageComponent} from './components/homepage/homepage.component';
import { ToolbarSearchComponent } from './components/toolbar-search/toolbar-search.component';
import { DiseasePageComponent } from './components/disease-page/disease-page.component';
import { NodeDetailsComponent } from './components/disease-page/node-details/node-details.component';
import { EdgeDetailsComponent } from './components/disease-page/edge-details/edge-details.component';
import { DatasetNetworkComponent } from './components/dataset-network/dataset-network.component';
import { ToolbarSearchDatasetComponent } from './components/toolbar-search-dataset/toolbar-search-dataset.component';
import {PhenonetNetworkComponent} from './components/v2/phenonet-network-page/phenonet-network.component';
import {StudyPairsListComponent} from './components/v2/phenonet-network-page/study-pairs-list/study-pairs-list.component';
import {NeighborsTableComponent} from './components/v2/phenonet-network-page/neighbors-table/neighbors-table.component';
import {StudiesTableComponent} from './components/v2/phenonet-network-page/studies-table/studies-table.component';
import {GraphFilterBarComponent} from './components/v2/phenonet-network-page/graph-filter-bar/graph-filter-bar.component';
import {PhenonetTopBarComponent} from './components/v2/phenonet-network-page/phenonet-top-bar/phenonet-top-bar.component';
import {NetworkGraphComponent} from './components/v2/phenonet-network-page/network-graph/network-graph.component';
import {HomepageSearchbarComponent} from './components/homepage-searchbar/homepage-searchbar.component';
import {DatasetNetworkPageComponent} from './components/v2/dataset-network-page/dataset-network.component';
import {DatasetTopBarComponent} from './components/v2/dataset-network-page/dataset-top-bar/dataset-top-bar.component';
import {DatasetNetworkGraphComponent} from './components/v2/dataset-network-page/dataset-network-graph/dataset-network-graph.component';
import {DatasetFilterBarComponent} from './components/v2/dataset-network-page/dataset-filter-bar/dataset-filter-bar.component';

export function importingEchart(): void {
  import('echarts');
}
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomepageComponent,
    DiseaseNetworkComponent,
    VisualizationsComponent,
    NavbarComponent,
    NavbarComponent,
    ToolbarSearchComponent,
    DiseasePageComponent,
    NodeDetailsComponent,
    EdgeDetailsComponent,
    DatasetNetworkComponent,
    ToolbarSearchDatasetComponent,
    PhenonetNetworkComponent,
    StudyPairsListComponent,
    NeighborsTableComponent,
    StudiesTableComponent,
    PhenonetTopBarComponent,
    GraphFilterBarComponent,
    NetworkGraphComponent,
    HomepageSearchbarComponent,
    DatasetNetworkPageComponent,
    DatasetTopBarComponent,
    DatasetNetworkGraphComponent,
    DatasetFilterBarComponent
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSliderModule,
    BrowserModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatTableModule,
    MatTabsModule,
    MatIconModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatSidenavModule,
    MatBadgeModule,
    MatRadioModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NgxEchartsModule.forRoot({
      /**
       * This will import all modules from echarts.
       * If you only need custom modules,
       * please refer to [Custom Build] section.
       */
      echarts: importingEchart, // or import('./path-to-my-custom-echarts')
    }),
    ReactiveFormsModule,
    FormsModule,
    VisModule,
    MatTooltipModule,
  ],
  providers: [
    // {
    //   provide: MAT_TABS_CONFIG,
    //   useValue: { animationDuration: 1000, fitInkBarToContent: true }
    // }
  ],
  bootstrap: [AppComponent]
})

export class AppModule {}
