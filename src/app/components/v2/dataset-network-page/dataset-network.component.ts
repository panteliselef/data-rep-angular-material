import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {LoadingService} from 'src/app/services/loading.service';
import {GplData} from 'src/app/models/gplGraph.model';
import {DatasetNetworkService} from './dataset-network.service';

@Component({
  selector: 'app-dataset-network2',
  templateUrl: './dataset-network.component.html',
  styleUrls: ['./dataset-network.component.scss'],
  providers: [DatasetNetworkService]
})
export class DatasetNetworkPageComponent implements OnInit {

  loadingGraphData$: Observable<boolean>;
  gplGraph$: Observable<GplData>;

  constructor(
    private datasetNetworkService: DatasetNetworkService,
    private loadingService: LoadingService) {
  }

  ngOnInit(): void {

    this.loadingGraphData$ = this.loadingService.loading$;

    this.gplGraph$ = this.datasetNetworkService.filteredGraph$;

    this.datasetNetworkService.fetchNetwork('GPL96');
  }

}
