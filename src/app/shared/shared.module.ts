import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ShortNumberPipe} from '../pipes/short-number.pipe';
import {EmptyIllustrationComponent} from '../components/v3/empty-illustration/empty-illustration.component';
import {DatasetNetworkGraphComponent} from '../components/v2/dataset-network-page/dataset-network-graph/dataset-network-graph.component';
import {GraphComponentComponent} from '../components/v2/graph-component/graph-component.component';
import {NetworkGraphComponent} from '../components/v2/phenonet-network-page/network-graph/network-graph.component';
import {VisModule} from 'ngx-vis';
import {MatIconModule} from '@angular/material/icon';



@NgModule({
  declarations: [
    ShortNumberPipe,
    EmptyIllustrationComponent,
    DatasetNetworkGraphComponent,
    GraphComponentComponent,
    NetworkGraphComponent,
  ],
  imports: [
    CommonModule,
    VisModule,
    MatIconModule,
  ],
  exports: [
    ShortNumberPipe,
    EmptyIllustrationComponent,
    DatasetNetworkGraphComponent,
    GraphComponentComponent,
    NetworkGraphComponent,
    MatIconModule,
    VisModule,
  ]
})
export class SharedModule { }
