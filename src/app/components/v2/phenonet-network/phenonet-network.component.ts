import {Component, OnInit} from '@angular/core';
import {ApiService} from 'src/app/services/api.service';
import {ConnectedNode, DATASET, GRAPH, NODE} from 'src/app/models/graph.model';
import {MatTableDataSource} from '@angular/material/table';
import {ActivatedRoute, Params, Router} from '@angular/router';

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
    private route: ActivatedRoute, private router: Router) {
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
                from: disease,
                to:  from === disease ? to : from,
                node: from === disease ? to : from,
              };
            })
            .sort((a, b) => b.weight - a.weight)
        );
        // this.setGraphData(graph);
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
    this.filterNodes = graph.nodes.map(({disease}) => disease);
  }


  onParamsChange(params: Params): void {
    const {diseaseId} = params;
    this.mainDisease = diseaseId;

    /* Fetch Edges and Nodes */
    if (!diseaseId) {
      this.apiService.getPhenonet().subscribe((graph: GRAPH) => {
        this.setMainGraph(graph);
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

  onEdgeSelect(edge: ConnectedNode): void {
    this.selectedEdge = edge;
  }


  handleSliderInput(limit: number): void {
    this.currSliderValue = limit;
  }

  onNodeSelect(node: string): void{
    this.router.navigate(['/v2/phenonet', node]).then(console.log);
  }
}



