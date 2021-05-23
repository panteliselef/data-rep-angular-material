import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Data, DataSet, Edge, Node, Options, VisNetworkService} from 'ngx-vis';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatTableDataSource} from '@angular/material/table';
import {TableEntry} from '../disease-network/disease-network.component';
import {IdType} from 'vis';

export interface EDGE {
  from: string;
  to: string;
  value: number;
  weight: string;
  datasetPairs: Array<{dA: string, dB: string}>;
}

export interface DATASET {
  DOLink: string;
  DataAnnot: string;
  Datapath: string;
  Disease: string;
  Dsetlink: string;
  Entity: string;
  GSE: string;
  Samples: number;
  Species: string;
  Technology: string;
  Type: string;
  id: string;
}

export interface NODE {
  id: string;
  label: string;
  size: number;
  font: any;
  disease: string;
  borderWidth: number;
  datasets: Array<DATASET>;
}

export interface ConnectedNode extends EDGE {
  node: string | IdType;
}
export interface GRAPH {
  edges: Array<EDGE>;
  nodes: Array<NODE>;
}
export interface SelectedItemNodeInfo {
  selectedNode: NODE;
  connectedNodes: Array<ConnectedNode>;
}
export interface SelectedItem {
  type: string;
  value: EDGE | SelectedItemNodeInfo;
}
@Component({
  selector: 'app-disease-page',
  templateUrl: './disease-page.component.html',
  styleUrls: ['./disease-page.component.scss']
})
export class DiseasePageComponent implements OnInit, OnDestroy {
  public diseaseId: string = undefined;

  public diseaseGraph: GRAPH;
  public visNetwork = 'networkDisease';
  public visNetworkData: Data;
  public nodes: DataSet<Node>;
  public edges: DataSet<Edge>;
  public visNetworkOptions: Options;
  public selectedItem: SelectedItem;
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

  private edgeDefaultColor = {
    highlight: '#1E352F',
    color: '#A6C36F',
    hover: '#FFB90F',
    opacity: .5,
  };


  public detailsInfo = {
    name: 'sepsis',
    type: 'node',
    edges: undefined,
    datasets: ['a'],
    datasetPairs: undefined,
    connectedNodes: undefined,
    edgeWeight: undefined,
    edgeFrom: undefined,
    edgeTo: undefined,
  };
  private showDetails: boolean;

  constructor(private httpService: HttpClient, private route: ActivatedRoute, private visNetworkService: VisNetworkService) {
    this.nodes = new DataSet<Node>([]);
    this.edges = new DataSet<Edge>([]);
    this.visNetworkData = { nodes: this.nodes, edges: this.edges };
    this.visNetworkOptions = {
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
        navigationButtons: true,
      },
    };
    this.selectedItem = {
      type: '',
      value: undefined
    };
  }

  async fetchDiseaseGraph(disease: string): Promise<GRAPH> {
    return await this.httpService.get<GRAPH>(`${environment.apiUrl}getPhenoNeighbors?q=${disease}`).toPromise();
  }

  async onParamsChange(params: Params): Promise<void> {
    const {diseaseId} = params;
    this.diseaseId = diseaseId;
    console.log(this.diseaseId);
    this.diseaseGraph = await this.fetchDiseaseGraph(this.diseaseId);
    this.nodes.clear();
    this.nodes.add(this.diseaseGraph.nodes);
    this.edges.clear();
    this.edges.add(this.diseaseGraph.edges);
    this.selectNode(diseaseId);
  }
  public ngOnInit(): void {
    this.route.params.subscribe(this.onParamsChange.bind(this));
  }

  closeSidenav(): void {

  }

  focusNode(nodeId: IdType): void {
    console.log(this.visNetworkService.getScale(this.visNetwork));
    const nodePos = this.visNetworkService.getPositions(this.visNetwork, [nodeId])[nodeId];
    this.visNetworkService.selectNodes(this.visNetwork, [nodeId], false);
    this.visNetworkService.moveTo(this.visNetwork, {
      position: nodePos,
      scale: 1,
      offset: {
        x: 0,
        y: 0
      },
      animation: {
        easingFunction: 'easeInOutCubic',
        duration: 500
      }
    });
  }

  private _onNetworkClick(eventData: any[]): void {
    const [networkId, clickData] = eventData;
    console.log(clickData);

    if (networkId !== this.visNetwork) { return; }
    this.detailsInfo = {
      name: undefined,
      type: undefined,
      edges: undefined,
      datasets: undefined,
      datasetPairs: undefined,
      connectedNodes: undefined,
      edgeWeight: undefined,
      edgeFrom: undefined,
      edgeTo: undefined,
    };

    // if (eventData[1].nodes.length === 0) {
    //   this.myControl.setValue('');
    // }

    if (clickData.nodes.length > 0 || clickData.edges.length > 0) {


      if (clickData.nodes[0]) {
        this.selectNode(clickData.nodes[0]);

      } else if (clickData.edges[0]) {
        this.selectEdge(clickData.edges[0]);
        // this.showDetails = true;
        // this.sidenav.open();
        // const allEdges = this.edges.get({returnType: 'Object'}) as any;
        // const selectedEdge = allEdges[eventData[1].edges[0]];
        // this.detailsInfo.edgeFrom = selectedEdge.from;
        // this.detailsInfo.edgeTo = selectedEdge.to;
        // console.log(selectedEdge);
        // this.detailsInfo.edgeWeight = selectedEdge.weight;
        // this.detailsInfo.datasetPairs = selectedEdge.datasetPairs;
        // this.detailsInfo.type = 'edge';
      }
    } else {
      // this.showDetails = false;
      // this.sidenav.close();
    }
  }

  public networkInitialized(): void {
    // now we can use the service to register on events
    this.visNetworkService.on(this.visNetwork, 'click');
    this.visNetworkService.click.subscribe(this._onNetworkClick.bind(this));
  }

  public ngOnDestroy(): void {
    this.visNetworkService.off(this.visNetwork, 'click');
  }

  private getConnectedNodesAndTheirEdges(nodeId: IdType): ConnectedNode[] {
    const allEdges = this.edges.get({returnType: 'Object'}) as any;
    const edgesInfo = this.visNetworkService.getConnectedEdges(this.visNetwork, nodeId).map(edgeId => {
      return this.edges.get({returnType: 'Object'})[edgeId];
    });
    return (this.visNetworkService.getConnectedNodes(this.visNetwork, nodeId) as IdType[]).map((node: IdType, i) => {
      const selectedEdge = allEdges[edgesInfo[i].id];
      return {
        node,
        ...edgesInfo[i],
        ...selectedEdge
      };
    });
  }

  selectEdge(edgeId: string): void  {
    const edge: EDGE = this.edges.get({returnType: 'Object'})[edgeId] as any;
    this.selectedItem.type = 'edge';
    this.selectedItem.value = edge;
  }

  selectNode($event: MatAutocompleteSelectedEvent| string ): void {

    const nodeId = $event instanceof MatAutocompleteSelectedEvent ? $event.option.value : $event;
    this.showDetails = true;
    const node: NODE = this.nodes.get({returnType: 'Object'})[nodeId] as NODE;
    this.selectedItem.type = 'node';
    this.selectedItem.value = {
      selectedNode: node,
      connectedNodes:  this.getConnectedNodesAndTheirEdges(nodeId)
    };
    this.focusNode(nodeId);
  }
}
