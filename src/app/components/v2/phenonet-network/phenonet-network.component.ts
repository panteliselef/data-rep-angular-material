import {Component, OnInit} from '@angular/core';
import {ApiService} from 'src/app/services/api.service';
import {ConnectedNode, DATASET, EDGE, GRAPH, NODE} from 'src/app/models/graph.model';
import {MatTableDataSource} from '@angular/material/table';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Data, DataSet, Edge, Node, Options, VisNetworkService} from 'ngx-vis';

@Component({
  selector: 'app-phenonet-network',
  templateUrl: './phenonet-network.component.html',
  styleUrls: ['./phenonet-network.component.scss'],
})
export class PhenonetNetworkComponent implements OnInit {

  connectedNodes: MatTableDataSource<ConnectedNode>;
  studies: MatTableDataSource<DATASET>;
  mainDisease = 'sepsis';
  mainDiseaseGraph: GRAPH;

  mainDiseaseNeighborsCount: number;
  mainDiseaseStudiesCount: number;


  maxGraphEdgeFreq = 0;
  minGraphEdgeFreq = 0;
  currSliderValue = 0;
  nodesInGraph = 0;


  /* About Vis.js Network Graph */
  public visNetwork = 'networkDisease';
  public visNetworkData: Data;
  public nodes: DataSet<Node>;
  public edges: DataSet<Edge>;
  public visNetworkOptions: Options;
  private nodeDefaultColor = {
    background: '#1E352F',
    border: '#A6C36F',
    hover: {
      border: '#5EB1BF',
      background: '#483D8B',
    },
    highlight: {
      border: '#5EB1BF',
      background: '#483D8B',
    }
  };


  private networkOptions1 = {
    height: '100%',
    width: '100%',
    nodes: {
      shape: 'dot',
      color: this.nodeDefaultColor,
      font: {
        face: 'roboto',
      }
    },
    layout: {
      randomSeed: 12,
      improvedLayout: true,
      hierarchical: {
        enabled: false,
      }
    },
    interaction: {
      hover: true,
      hideEdgesOnDrag: true,
      hideEdgesOnZoom: true,
      // navigationButtons: true,
    },
  };
  searchFocused: boolean;
  searchBarPhenotype: string;
  public searchRecommendations: string[];

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private visNetworkService: VisNetworkService, private router: Router) {
    this.nodes = new DataSet<Node>([]);
    this.edges = new DataSet<Edge>([]);
    this.visNetworkData = {nodes: this.nodes, edges: this.edges};
    this.searchRecommendations = [];
  }


  fetchDiseaseFromPhenonet(disease: string): void {
    this.apiService.getPhenonetDiseaseNeighbors(disease)
      .subscribe((graph: GRAPH) => {
        this.setMainGraph(graph);
        this.setMainDiseaseNeighborsCount(graph.nodes.length - 1); // because 'nodes' include the main disease
        this.setStudiesForDisease(disease);
        this.connectedNodes = new MatTableDataSource<ConnectedNode>(
          graph.edges
            .map(({from, to, ...rest}) => {
              return {
                ...rest,
                from,
                to,
                node: from === disease ? to : from,
              };
            })
            .sort((a, b) => b.weight - a.weight)
        );
        this.setGraphData(graph);
        this.setSliderValues(
          this.mainDiseaseGraph.edges[this.mainDiseaseGraph.edges.length - 1].weight,
          this.mainDiseaseGraph.edges[0].weight
        );
      });
  }

  setSliderValues(min: number, max: number): void {
    this.maxGraphEdgeFreq = min;
    this.minGraphEdgeFreq = max;
  }

  setStudiesForDisease(disease: string): void {
    this.studies = new MatTableDataSource<DATASET>(this.mainDiseaseGraph.nodes.filter((n: NODE) => n.disease === disease)[0].datasets);
    this.mainDiseaseStudiesCount = this.studies.data.length;
  }

  setMainDiseaseNeighborsCount(n: number): void {
    this.mainDiseaseNeighborsCount = n;
  }

  setMainGraph(graph: GRAPH): void {
    this.mainDiseaseGraph = graph;
  }


  setGraphData(graph: GRAPH): void {
    this.nodes.clear();
    this.nodes.add(graph.nodes);
    this.edges.clear();
    this.edges.add(graph.edges);
  }

  onParamsChange(params: Params): void {
    const {diseaseId} = params;
    this.mainDisease = diseaseId;

    this.visNetworkOptions = this.networkOptions1;


    /* Fetch Edges and Nodes */
    if (!diseaseId) {
      this.apiService.getPhenonet().subscribe((graph: GRAPH) => {
        this.setGraphData(graph);
        this.setMainGraph(graph);
        console.log(graph);
        this.setSliderValues(
          graph.edges[graph.edges.length - 1].weight,
          graph.edges[0].weight
        );
      });
    } else {
      this.fetchDiseaseFromPhenonet(diseaseId);
      this.searchBarPhenotype = diseaseId;
    }
  }

  ngOnInit(): void {
    this.route.params.subscribe(this.onParamsChange.bind(this));
  }


  public networkInitialized(): void {
    // now we can use the service to register on events
    this.visNetworkService.on(this.visNetwork, 'click');
    this.visNetworkService.click.subscribe(this._onNetworkClick.bind(this));
  }

  private _onNetworkClick(eventData: any[]): void {
    const [networkId, clickData] = eventData;

    if (networkId !== this.visNetwork) {
      return;
    }

    const clickedNode = clickData?.nodes[0];
    if (!clickedNode) { return; }
    this.router.navigate(['/v2/phenonet', clickedNode]).then(console.log);
  }


  handleSliderInput(limit: number): void {
    this.currSliderValue = limit;
    const finalNodesSet = new Set<string>();
    const finalEdges = this.mainDiseaseGraph.edges.slice().filter((edge: EDGE) => edge.weight >= limit);
    for (const edge of finalEdges) {
      finalNodesSet.add(edge.from);
      finalNodesSet.add(edge.to);
    }
    const finalNodes = Array.from(finalNodesSet).map(nodeId => this.mainDiseaseGraph.nodes.find(node => node.id === nodeId));
    this.nodesInGraph = finalNodesSet.size - 1;

    this.nodes.clear();
    this.nodes.add(finalNodes);
    this.edges.clear();
    this.edges.add(finalEdges);
  }

  onSearchPhenonet($event): void{
    this.searchBarPhenotype = $event;
    this.apiService
      .getPhenonetSearchResults(this.searchBarPhenotype)
      .subscribe((recommendations: string[]) => {
        this.searchRecommendations = recommendations;
        console.log(recommendations);
      });
    console.log(this.searchBarPhenotype);

  }
}



