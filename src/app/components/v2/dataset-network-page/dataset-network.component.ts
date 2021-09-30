import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import { combineLatest } from 'rxjs';
import {LoadingService} from 'src/app/services/loading.service';
import {GplData, GPLEDGE, GPLNODE, Technology} from 'src/app/models/gplGraph.model';
import {DatasetNetworkService} from './dataset-network.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-dataset-network2',
  templateUrl: './dataset-network.component.html',
  styleUrls: ['./dataset-network.component.scss'],
  providers: [DatasetNetworkService]
})
export class DatasetNetworkPageComponent implements OnInit {

  loadingGraphData$: Observable<boolean>;
  gplGraph$: Observable<GplData>;
  selectedNode$: Observable<GPLNODE>;
  selectedEdge$: Observable<GPLEDGE>;

  networkName$: Observable<string>;

  constructor(
    private datasetNetworkService: DatasetNetworkService,
    private loadingService: LoadingService,
    private router: Router,
    private route: ActivatedRoute) {
  }

  get isEdgeNodeSelected$(): Observable<GPLNODE | GPLEDGE> {
    return combineLatest([this.selectedNode$, this.selectedEdge$])
      .pipe(map(([a$, b$]) => a$ || b$));
  }

  ngOnInit(): void {
    this.networkName$ = this.route.paramMap.pipe(map(paramMap => paramMap.get('technology')));
    this.loadingGraphData$ = this.loadingService.loading$;
    this.gplGraph$ = this.datasetNetworkService.filteredGraph$;
    this.selectedEdge$ = this.datasetNetworkService.selectedEdge$;
    this.selectedNode$ = this.datasetNetworkService.selectedNode$;

    this.networkName$.subscribe(async (technology) => {
      // TODO: verify that technology exist
      if (!technology) {
        // TODO: handle behavior when technology parameter doesn't exist
        // a temporary solution is to fallback to technology GPL96
        await this.router.navigate(['GPL96'], { relativeTo: this.route });
        return;
      }
      this.datasetNetworkService.fetchNetwork(technology.toUpperCase() as Technology);
    });


  }

}
