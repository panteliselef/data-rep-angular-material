import {Component, OnDestroy, OnInit} from '@angular/core';
import {ApiService} from 'src/app/services/api.service';
import {ConnectedNode, DATASET, DATASET_PAIR, EDGE, GRAPH, NODE} from 'src/app/models/graph.model';
import {MatTableDataSource} from '@angular/material/table';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {DEPTH_DEGREE, GraphFilterBarService} from 'src/app/services/graph-filter-bar.service';
import {Observable} from 'rxjs';
import 'src/util/string.extentions';
import {LoadingService} from 'src/app/services/loading.service';
import {DiseaseNode, DiseaseEdge} from 'src/app/models/elastic.model';


@Component({
  selector: 'app-phenonet-network',
  templateUrl: './phenonet-network.component.html',
  styleUrls: ['./phenonet-network.component.scss'],
})
export class PhenonetNetworkComponent implements OnInit, OnDestroy {

  connectedNodes: MatTableDataSource<ConnectedNode>;
  studies: MatTableDataSource<DATASET>;
  mainDisease = 'sepsis';
  mainDiseaseGraph: GRAPH;

  mainDiseaseNeighborsCount: number;
  mainDiseaseStudiesCount: number;

  loadingGraphData$: Observable<boolean>;


  maxGraphEdgeFreq = 0;
  minGraphEdgeFreq = 0;
  currSliderValue = 0;
  nodesInGraph = 0;


  /* About Vis.js Network Graph */
  // public visNetwork = 'networkDisease';
  // public visNetworkData: Data;
  // public nodes: DataSet<Node>;
  // public edges: DataSet<Edge>;
  // public visNetworkOptions: Options;
  // private nodeDefaultColor = {
  //   background: '#1E352F',
  //   border: '#A6C36F',
  //   hover: {
  //     border: '#5EB1BF',
  //     background: '#483D8B',
  //   },
  //   highlight: {
  //     border: '#5EB1BF',
  //     background: '#483D8B',
  //   }
  // };


  // private networkOptions1 = {
  //   height: '100%',
  //   width: '100%',
  //   nodes: {
  //     shape: 'dot',
  //     color: this.nodeDefaultColor,
  //     font: {
  //       face: 'roboto',
  //     }
  //   },
  //   layout: {
  //     randomSeed: 12,
  //     improvedLayout: true,
  //     hierarchical: {
  //       enabled: false,
  //     }
  //   },
  //   interaction: {
  //     hover: true,
  //     hoverConnectedEdges: true,
  //     hideEdgesOnDrag: true,
  //     hideEdgesOnZoom: true,
  //     // navigationButtons: true,
  //   },
  // };
  // searchFocused: boolean;
  searchBarPhenotype: string;
  public searchRecommendations: string[];
  selectedEdge: ConnectedNode;
  filterNodes: string[];
  diseaseToBeHighlighted: string;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private loadingService: LoadingService,
    private graphFilterBarService: GraphFilterBarService,
    private titleService: Title) {
    this.searchRecommendations = [];
  }

  private setConnectedNodes(disease: string, graph: GRAPH): void {
    const d = graph.edges
      .filter(({from, to}) => {
        return from === disease || to === disease;
      })
      .map(({from, to, ...rest}) => {
        return {
          ...rest,
          // from: disease,
          from,
          // to:  from === disease ? to : from,
          to,
          node: from === disease ? to : from,
        };
      })
      .sort((a, b) => b.weight - a.weight);
    this.setMainDiseaseNeighborsCount(d.length); // because 'nodes' include the main disease
    this.connectedNodes = new MatTableDataSource<ConnectedNode>(d);
  }

  setSliderValues(min: number, max: number): void {
    console.log(min, max);
    this.minGraphEdgeFreq = min;
    this.maxGraphEdgeFreq = max;
  }

  setStudiesForDisease(disease: string): void {
    const datasetIds = this.mainDiseaseGraph.nodes.filter((n: NODE) => n.disease === disease)[0].datasets;

    this.apiService.getBiodataomeStudies(datasetIds as string[]).subscribe((datasets: DATASET[]) => {
      this.studies = new MatTableDataSource<DATASET>(datasets);
      this.mainDiseaseStudiesCount = this.studies.data.length;
    });
  }

  setMainDiseaseNeighborsCount(n: number): void {
    this.mainDiseaseNeighborsCount = n;
  }

  setMainGraph(graph: GRAPH): void {
    this.mainDiseaseGraph = graph;
    this.filterNodes = graph.nodes.map(({disease}) => disease);
  }

  private mapElasticModelToGraph(diseaseEdges: DiseaseEdge[], cb?: () => void): GRAPH {

    const diseaseSet = new Set<string>();
    const nodes = new Array<NODE>();
    for (const pair of diseaseEdges) {
      const pairNodes = [pair.node1, pair.node2];

      pairNodes.forEach((node: DiseaseNode) => {
        if (diseaseSet.has(node.disease)) {
          return;
        }
        diseaseSet.add(node.disease);
        nodes.push({
          id: node.disease,
          disease: node.disease,
          label: node.disease,
          datasets: node.corr_data_table_ids
        });
      });
    }

    const edges = diseaseEdges.map<EDGE>((source: DiseaseEdge) => {
      return {
        from: source.node1.disease,
        to: source.node2.disease,
        value: source.frequency,
        weight: source.frequency,
        datasetPairs: source.corr_data_table_conn.map<DATASET_PAIR>((pair) => {
          return {
            dA: (pair[0] as string),
            dB: (pair[1] as string),
          };
        })
      };
    })
      .sort((a: EDGE, b: EDGE) => b.weight - a.weight);

    if (cb) {
      cb();
    }

    return {
      nodes,
      edges
    };
  }


  /**
   * Only for comparison with elastic
   * @deprecated use elastic instead
   */
  private _onFetchGraph(disease: string, graph: GRAPH): void  {
    console.log(graph.edges);
    this.setMainGraph(graph);
    this.setStudiesForDisease(disease);
    const d = graph.edges
      .filter(({from, to}) => {
        return from === disease || to === disease;
      })
      .map(({from, to, ...rest}) => {
        return {
          ...rest,
          // from: disease,
          from,
          // to:  from === disease ? to : from,
          to,
          node: from === disease ? to : from,
        };
      })
      .sort((a, b) => b.weight - a.weight);
    this.setMainDiseaseNeighborsCount(d.length); // because 'nodes' include the main disease
    this.connectedNodes = new MatTableDataSource<ConnectedNode>(d);
    this.setSliderValues(
      this.mainDiseaseGraph.edges[0].weight,
      this.mainDiseaseGraph.edges[this.mainDiseaseGraph.edges.length - 1].weight,
    );
  }

  /**
   * Only for comparison with elastic
   * @deprecated use elastic instead
   */
  fetchDiseaseFromPhenonetOld(disease: string): void {
    this.loadingService
      .showLoaderUntilCompleted(this.apiService.getPhenonetDiseaseNeighborsAtDepth(disease, 1))
      .subscribe(this._onFetchGraph.bind(this, disease));
  }


  /**
   * Only for comparison with elastic
   * @deprecated use elastic instead
   */
  onParamsChangeOld(params: Params): void {
    const {diseaseId} = params;
    this.mainDisease = diseaseId;

    /* Fetch Edges and Nodes */
    if (!diseaseId) {
      this.titleService.setTitle('Phenonet');
      this.graphFilterBarService.updateDepthDegreeDisabled(true);
      this.apiService.getPhenonet().subscribe((graph: GRAPH) => {
        this.setMainGraph(graph);
        console.log(graph.edges);
        this.setSliderValues(
          graph.edges[graph.edges.length - 1].weight,
          graph.edges[0].weight
        );
      });
    } else {
      this.titleService.setTitle(`${this.mainDisease.capitalize()} | Phenonet`);
      this.graphFilterBarService.updateDepthDegreeDisabled(false);
      this.graphFilterBarService.updateDepthDegree(1);
      this.fetchDiseaseFromPhenonetOld(diseaseId);
      this.searchBarPhenotype = diseaseId;
    }
  }


  /**
   * Fetch new graph for disease in parameters
   * With elastic API
   * @param params contains :diseaseId
   */
  onParamsChange(params: Params): void {
    const {diseaseId} = params;
    this.mainDisease = diseaseId;

    /* Fetch Edges and Nodes */
    this.loadingService
      .showLoaderUntilCompleted(this.apiService.getPhenonetElastic(diseaseId || ''))
      .subscribe((edges: DiseaseEdge[]) => {
        const graph = this.mapElasticModelToGraph(edges);
        this.setMainGraph(graph);

        if (graph.nodes.length === 0) {
          console.error('Graph has zero nodes');
          return;
        }

        this.setSliderValues(
          graph.edges[graph.edges.length - 1].weight,
          graph.edges[0].weight
        );

        if (!diseaseId) {
          return;
        }

        this.setStudiesForDisease(diseaseId);
        this.setConnectedNodes(diseaseId, graph);
      });

    /* Meanwhile set up the rest elements */
    if (!diseaseId) {
      this.titleService.setTitle('Phenonet');
      this.graphFilterBarService.updateDepthDegreeDisabled(true);
    } else {
      this.titleService.setTitle(`${this.mainDisease.capitalize()} | Phenonet`);
      this.graphFilterBarService.updateDepthDegreeDisabled(false);
      this.graphFilterBarService.updateDepthDegree(1);
      this.searchBarPhenotype = diseaseId;
    }
  }

  ngOnInit(): void {
    this.route.params.subscribe(this.onParamsChange.bind(this));
    this.connectedNodes = new MatTableDataSource<ConnectedNode>();
    this.studies = new MatTableDataSource<DATASET>();
    this.loadingGraphData$ = this.loadingService.loading$;
  }

  ngOnDestroy(): void {

  }

  onEdgeSelect(edge: ConnectedNode): void {
    this.selectedEdge = edge;
  }


  handleSliderInput(limit: number): void {
    this.currSliderValue = limit;
  }

  onNodeSelect(node: string): void {
    this.graphFilterBarService.updateDepthDegree(1);
    this.router.navigate(['/v2/phenonet', node]).then(console.log);
  }

  onDegreeDepthClick(degree: DEPTH_DEGREE): void {
    if (!this.mainDisease) {
      return;
    }
    this.apiService
      .getPhenonetElastic(degree === 'all' ? '' : this.mainDisease)
      .subscribe((edges: DiseaseEdge[]) => {
        const graph = this.mapElasticModelToGraph(edges);
        this.setMainGraph(graph);
        this.setSliderValues(
          graph.edges[graph.edges.length - 1].weight,
          graph.edges[0].weight
        );
      });
  }

  /**
   * @deprecated use onDegreeDepthClick instead
   * @param degree depth degree to search for
   */
  onDegreeDepthClickOld(degree: DEPTH_DEGREE): void {
    this.apiService.getPhenonetDiseaseNeighborsAtDepth(this.mainDisease, degree).subscribe(
      this._onFetchGraph.bind(this, this.mainDisease)
    );
  }
}



