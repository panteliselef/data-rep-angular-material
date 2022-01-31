import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ShortNumberPipe} from '../pipes/short-number.pipe';
import {EmptyIllustrationComponent} from '../components/v3/empty-illustration/empty-illustration.component';
import {DatasetNetworkGraphComponent} from '../components/v2/dataset-network-page/dataset-network-graph/dataset-network-graph.component';
import {GraphComponentComponent} from '../components/v2/graph-component/graph-component.component';
import {NetworkGraphComponent} from '../components/v2/phenonet-network-page/network-graph/network-graph.component';
import {VisModule} from 'ngx-vis';
import {MatIconModule} from '@angular/material/icon';
import {MatSliderModule} from '@angular/material/slider';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {MatChipsModule} from '@angular/material/chips';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatBadgeModule} from '@angular/material/badge';
import {MatRadioModule} from '@angular/material/radio';
import {NeighborsTableComponent} from '../components/v2/phenonet-network-page/neighbors-table/neighbors-table.component';
import {StudyPairsListComponent} from '../components/v2/phenonet-network-page/study-pairs-list/study-pairs-list.component';
import {DownloadUrlPipe} from '../components/v2/phenonet-network-page/download-url.pipe';
import {StudiesTableComponent} from '../components/v2/phenonet-network-page/studies-table/studies-table.component';
import {MatPaginatorModule} from '@angular/material/paginator';


@NgModule({
  declarations: [
    ShortNumberPipe,
    EmptyIllustrationComponent,
    DatasetNetworkGraphComponent,
    GraphComponentComponent,
    NetworkGraphComponent,
    NeighborsTableComponent,
    StudyPairsListComponent,
    DownloadUrlPipe,
    StudiesTableComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    VisModule,
    MatAutocompleteModule,
    MatIconModule,
    MatSliderModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatTableModule,
    MatTabsModule,
    MatChipsModule,
    MatSidenavModule,
    MatBadgeModule,
    MatRadioModule,
    MatPaginatorModule,
  ],
  exports: [
    ShortNumberPipe,
    EmptyIllustrationComponent,
    DatasetNetworkGraphComponent,
    GraphComponentComponent,
    NetworkGraphComponent,
    NeighborsTableComponent,
    StudyPairsListComponent,
    DownloadUrlPipe,
    StudiesTableComponent,
    MatAutocompleteModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    VisModule,
    MatSliderModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatTableModule,
    MatTabsModule,
    MatChipsModule,
    MatSidenavModule,
    MatBadgeModule,
    MatRadioModule,
    MatPaginatorModule
  ]
})
export class SharedModule {
}
