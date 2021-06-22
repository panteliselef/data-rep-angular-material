import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {DiseaseNetworkComponent} from './components/disease-network/disease-network.component';
import {VisualizationsComponent} from './components/visualizations/visualizations.component';

const routes: Routes = [
  {path: '', component: DiseaseNetworkComponent, },
  {path: 'phenonet', component: DiseaseNetworkComponent, },
  {path: 'vis', component: VisualizationsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
