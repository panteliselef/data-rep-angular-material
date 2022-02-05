import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {TestingPageComponent} from './testing-page/testing-page.component';
import {SearchPageComponent} from './search-page/search-page.component';
import {PhenonetPageComponent} from './phenonet-page/phenonet-page.component';
import {NotFoundPageComponent} from './not-found-page/not-found-page.component';
import {PlatformsPageComponent} from './platforms-page/platforms-page.component';


const routes: Routes = [
  {path: '', component: TestingPageComponent, },
  {path: 'search', component: SearchPageComponent, },
  {path: 'phenonet', component: PhenonetPageComponent, },
  {path: 'phenonet/:diseaseId', component: PhenonetPageComponent, },
  {path: 'platforms', component: PlatformsPageComponent, },
  {path: 'error', component: NotFoundPageComponent, },
  {path: '**', redirectTo: '', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class V3Routing {
}
