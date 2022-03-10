import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {Observable, Subscription} from 'rxjs';
import {ApiService, StudyMetadata} from 'src/app/services/api.service';
import {HttpErrorResponse} from '@angular/common/http';
import {PhenonetPageService} from './phenonet-page.service';
import {MatTableDataSource} from '@angular/material/table';
import {ConnectedNode, GRAPH} from '../../../models/graph.model';
import {catchError, delay, filter, map, switchMap} from 'rxjs/operators';
import {animate, style, transition, trigger} from '@angular/animations';
import {toastSliding} from '../../../shared/animations';

@Component({
  selector: 'app-phenonet-page',
  templateUrl: './phenonet-page.component.html',
  styleUrls: [
    './phenonet-page.component.scss',
    '../../v2/phenonet-network-page/phenonet-network.component.scss'
  ],
  providers: [
    PhenonetPageService
  ],
  animations: [
    toastSliding,
    trigger('lala', [
      transition(':enter', [
        style({opacity: 0, transform: 'translateY(-10px)'}),
        animate('400ms cubic-bezier(0.68,-1.55,0.27,2.55)', style({opacity: 1, transform: 'translateY(0)'})),
      ]),
      transition(':leave', [
        animate('400ms cubic-bezier(0.68,-1.55,0.27,2.55)', style({opacity: 0, transform: 'translateY(-10px)'}))
      ])
    ])
  ]
})
export class PhenonetPageComponent implements OnInit, OnDestroy {

  mainDisease = 'sepsis';
  private routeSub: Subscription;

  filteredGraph$: Observable<GRAPH>;
  connectedNodes$: Observable<MatTableDataSource<ConnectedNode>>;
  studies$: Observable<MatTableDataSource<StudyMetadata>>;
  isShown = true;
  selectedEdge: ConnectedNode;
  isSearchFieldVisible = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private phenonetService: PhenonetPageService,
    private titleService: Title) {
  }


  /**
   * Fetch new graph for disease in parameters
   * With elastic API
   * @param params contains :diseaseId
   */
  onParamsChange(params: Params): void {
    const {diseaseId} = params;
    this.mainDisease = diseaseId;

    /* Meanwhile set up the rest elements */
    if (!diseaseId) {
      this.titleService.setTitle('Phenonet');
      this.phenonetService.updateDisplayAllNodesDisabled(true);
    } else {
      this.titleService.setTitle(`${this.mainDisease.capitalize()} | Phenonet`);
      this.phenonetService.updateDisplayAllNodesDisabled(false);
      this.phenonetService.updateDisplayAllNodes(false);
    }
  }

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(this.onParamsChange.bind(this));


    /*
    * Fetch Edges and Nodes
    * and listen to switch and fetch again
    */
    this.phenonetService.displayAllNodes$.subscribe((display) => {
      this.phenonetService.fetchNetwork(display ? '' : this.mainDisease)
        .subscribe(_ => {
          // this.titleService.setTitle(`${this.mainDisease.capitalize()} | Phenonet`);
          this.phenonetService.updateDisease(this.mainDisease);
        }, (err: HttpErrorResponse) => {
          if (err.status === 400) {
            this.router.navigate(['/v3/error'], {
              queryParams: {
                fromPage: 'phenonet',
                fromPageArg: this.mainDisease,
              },
              skipLocationChange: true
            });
          } else {
            this.router.navigate(['/v3/error'], {
              queryParams: {
                errorCode: '404',
                withErrorCode: true
              },
              skipLocationChange: true
            });

          }
        });
    });

    // Get diseases that exist in the displayed graph
    this.phenonetService.filteredGraph$.pipe(
      map((graph) => graph?.diseases),
      map(diseases => diseases.length === 0 ? true : diseases.includes(this.mainDisease))
    ).subscribe((hasWarning) => {
      this.isShown = !(!!this.mainDisease ? !hasWarning : false);
    });


    this.filteredGraph$ = this.phenonetService.filteredGraph$;
    this.connectedNodes$ = this.phenonetService.filteredGraph$.pipe(
      map(graph => graph.edges
        .filter(({from, to}) => {
          return from === this.mainDisease || to === this.mainDisease;
        })
        .map(({from, to, ...rest}) => {
          return {
            ...rest,
            from,
            to,
            node: (from === this.mainDisease ? to : from) as string,
          };
        })
        .sort((a, b) => b.weight - a.weight)),
      map(formattedEdges => new MatTableDataSource<ConnectedNode>(formattedEdges))
    );

    this.studies$ = this.phenonetService.graph$.pipe(
      delay(1000),
      map(graph => this.mainDisease ? graph.nodes.filter(n => n.disease === this.mainDisease)?.[0]?.datasets || [] : []),
      filter(datasetIds => datasetIds.length !== 0),
      switchMap(datasetIds => this.apiService.getStudiesMetadata(datasetIds as string[])),
      catchError(_ => []),
      map(datasets => new MatTableDataSource<StudyMetadata>(datasets))
    );

    this.phenonetService.selectedEdge$.subscribe(this.onEdgeSelect.bind(this));
    this.phenonetService.selectedNode$
      .pipe(filter(node => typeof node !== 'undefined'))
      .subscribe(this.onNodeSelect.bind(this));
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }

  onEdgeSelect(edge: ConnectedNode): void {
    this.selectedEdge = edge;
  }


  onNodeSelect(node: string): void {
    this.isShown = true;
    this.isSearchFieldVisible = false;
    this.router.navigate(['/v3/phenonet', node]).then(console.log);
  }

  requestSearchInTable(event: KeyboardEvent): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.phenonetService.updateConnectedNodeFilter(filterValue);
  }

  toggleSearchField(): void {
    this.isSearchFieldVisible = !this.isSearchFieldVisible;
  }
}
