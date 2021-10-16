import {Component, OnDestroy, OnInit} from '@angular/core';
import {ApiService} from 'src/app/services/api.service';
import {ConnectedNode, GRAPH, NODE} from 'src/app/models/graph.model';
import {PostgresStudy} from 'src/app/models/postgres.model';
import {MatTableDataSource} from '@angular/material/table';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {GraphFilterBarService} from 'src/app/services/graph-filter-bar.service';
import {Observable, Subscription} from 'rxjs';
import 'src/util/string.extentions';
import {LoadingService} from 'src/app/services/loading.service';
import {PhenonetNetworkService} from './phenonet-network.service';
import {filter, map, switchMap} from 'rxjs/operators';

@Component({
  selector: 'app-phenonet-network',
  templateUrl: './phenonet-network.component.html',
  styleUrls: ['./phenonet-network.component.scss'],
  providers: [PhenonetNetworkService]
})
export class PhenonetNetworkComponent implements OnInit, OnDestroy, OnDestroy {

  connectedNodes: MatTableDataSource<ConnectedNode>;
  mainDisease = 'sepsis';
  mainDiseaseGraph: GRAPH;

  private routeSub: Subscription;

  searchBarPhenotype: string;
  public searchRecommendations: string[];
  selectedEdge: ConnectedNode;
  diseaseToBeHighlighted: string;
  filteredGraph$: Observable<GRAPH>;
  connectedNodes$: Observable<MatTableDataSource<ConnectedNode>>;
  studies$: Observable<MatTableDataSource<PostgresStudy>>;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private loadingService: LoadingService,
    private phenonetService: PhenonetNetworkService,
    private graphFilterBarService: GraphFilterBarService,
    private titleService: Title) {
    this.searchRecommendations = [];
  }

  setMainGraph(graph: GRAPH): void {
    this.mainDiseaseGraph = graph;
  }


  /**
   * Only for comparison with elastic
   * @deprecated use elastic instead
   */
  // private _onFetchGraph(disease: string, graph: GRAPH): void  {
  //   console.log(graph.edges);
  //   this.setMainGraph(graph);
  //   this.setStudiesForDisease(disease);
  //   const d = graph.edges
  //     .filter(({from, to}) => {
  //       return from === disease || to === disease;
  //     })
  //     .map(({from, to, ...rest}) => {
  //       return {
  //         ...rest,
  //         // from: disease,
  //         from,
  //         // to:  from === disease ? to : from,
  //         to,
  //         node: from === disease ? to : from,
  //       };
  //     })
  //     .sort((a, b) => b.weight - a.weight);
  //   this.setMainDiseaseNeighborsCount(d.length); // because 'nodes' include the main disease
  //   this.connectedNodes = new MatTableDataSource<ConnectedNode>(d);
  //   this.setSliderValues(
  //     this.mainDiseaseGraph.edges[0].weight,
  //     this.mainDiseaseGraph.edges[this.mainDiseaseGraph.edges.length - 1].weight,
  //   );
  // }

  /**
   * Only for comparison with elastic
   * @deprecated use elastic instead
   */
  // fetchDiseaseFromPhenonetOld(disease: string): void {
  //   this.loadingServiceSub = this.loadingService
  //     .showLoaderUntilCompleted(this.apiService.getPhenonetDiseaseNeighborsAtDepth(disease, 1))
  //     .subscribe(this._onFetchGraph.bind(this, disease));
  // }


  /**
   * Only for comparison with elastic
   * @deprecated use elastic instead
   */
  // onParamsChangeOld(params: Params): void {
  //   const {diseaseId} = params;
  //   this.mainDisease = diseaseId;
  //
  //   /* Fetch Edges and Nodes */
  //   if (!diseaseId) {
  //     this.titleService.setTitle('Phenonet');
  //     this.graphFilterBarService.updateDepthDegreeDisabled(true);
  //     this.apiService.getPhenonet().subscribe((graph: GRAPH) => {
  //       this.setMainGraph(graph);
  //       console.log(graph.edges);
  //       this.setSliderValues(
  //         graph.edges[graph.edges.length - 1].weight,
  //         graph.edges[0].weight
  //       );
  //     });
  //   } else {
  //     this.titleService.setTitle(`${this.mainDisease.capitalize()} | Phenonet`);
  //     this.graphFilterBarService.updateDepthDegreeDisabled(false);
  //     this.graphFilterBarService.updateDepthDegree(1);
  //     this.fetchDiseaseFromPhenonetOld(diseaseId);
  //     this.searchBarPhenotype = diseaseId;
  //   }
  // }


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
      this.searchBarPhenotype = diseaseId;
    }
  }

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(this.onParamsChange.bind(this));
    this.connectedNodes = new MatTableDataSource<ConnectedNode>();


    /*
    * Fetch Edges and Nodes
    * and listen to switch and fetch again
    */
    this.phenonetService.displayAllNodes$.subscribe((display) => {
      this.phenonetService.fetchNetwork(display ? '' : this.mainDisease);
    });


    this.filteredGraph$ = this.phenonetService.filteredGraph$;
    this.connectedNodes$ = this.phenonetService.graph$.pipe(
      map(graph => graph.edges
        .filter(({from, to}) => {
          return from === this.mainDisease || to === this.mainDisease;
        })
        .map(({from, to, ...rest}) => {
          return {
            ...rest,
            from,
            to,
            node: from === this.mainDisease ? to : from,
          };
        })
        .sort((a, b) => b.weight - a.weight)),
      map(formattedEdges => new MatTableDataSource<ConnectedNode>(formattedEdges))
    );

    this.studies$ = this.phenonetService.graph$.pipe(
      map(graph => graph.nodes.filter((n: NODE) => n.disease === this.mainDisease)[0].datasets),
      switchMap(datasetIds => this.apiService.getBiodataomeStudies(datasetIds as string[])),
      map(datasets => new MatTableDataSource<PostgresStudy>(datasets))
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
    this.router.navigate(['/v2/phenonet', node]).then(console.log);
  }

}



