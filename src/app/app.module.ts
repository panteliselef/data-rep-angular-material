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
import { MAT_TABS_CONFIG } from '@angular/material/tabs';

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

export function importingEchart(): void {
  import('echarts');
}
@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    HeaderComponent,
    DiseaseNetworkComponent,
    VisualizationsComponent,
    NavbarComponent,
    ToolbarSearchComponent,
    DiseasePageComponent,
    NodeDetailsComponent
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSliderModule,
    BrowserModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatTabsModule,
    MatIconModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatSidenavModule,
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

export class AppModule {

}
