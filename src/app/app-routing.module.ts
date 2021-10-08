import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {DiseaseNetworkComponent} from './components/disease-network/disease-network.component';
import {VisualizationsComponent} from './components/visualizations/visualizations.component';
import {HomepageComponent} from './components/homepage/homepage.component';
import {DiseasePageComponent} from './components/disease-page/disease-page.component';
import {DatasetNetworkComponent} from './components/dataset-network/dataset-network.component';
import {PhenonetNetworkComponent} from './components/v2/phenonet-network-page/phenonet-network.component';
import {DatasetNetworkPageComponent} from './components/v2/dataset-network-page/dataset-network.component';

const routes: Routes = [
  {path: '', component: HomepageComponent, },
  {path: 'disease', component: DiseasePageComponent, },
  {path: 'disease/:diseaseId', component: DiseasePageComponent, },
  {path: 'dataset-network', component: DatasetNetworkComponent, },
  {path: 'dataset-network/:networkId', component: DatasetNetworkComponent, },
  {path: 'phenonet', component: DiseaseNetworkComponent, },
  {path: 'v2/phenonet', component: PhenonetNetworkComponent, },
  {path: 'v2/phenonet/:diseaseId', component: PhenonetNetworkComponent, },
  {path: 'v2/dataset', component: DatasetNetworkPageComponent, },
  {path: 'v2/dataset/:technology', component: DatasetNetworkPageComponent, },
  {path: 'v2/dataset/:technology/:study', component: DatasetNetworkPageComponent, },
  {path: 'vis', component: VisualizationsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
