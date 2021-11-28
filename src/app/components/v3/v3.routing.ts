import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {TestingPageComponent} from './testing-page/testing-page.component';
import {SearchpageComponent} from './searchpage/searchpage.component';


const routes: Routes = [
  {path: '', component: TestingPageComponent, },
  {path: 'search', component: SearchpageComponent, },
  {path: '**', redirectTo: '', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class V3Routing {
}
