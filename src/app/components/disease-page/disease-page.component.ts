import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Data, DataSet, Edge, Node, Options, VisNetworkService} from 'ngx-vis';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {IdType} from 'vis';
import {MatSliderChange} from '@angular/material/slider';
import {ConnectedNode, EDGE, GRAPH, NODE} from 'src/app/models/graph.model';

export interface SelectedItemNodeInfo {
  selectedNode: NODE;
  connectedNodes: Array<ConnectedNode>;
  visibleNodes?: number;

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
  public highlightActive = false;


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
  private lastSelectedEdge = undefined;
  currSliderValue: any;
  maxGraphEdgeFreq = 0;
  minGraphEdgeFreq = 0;
  nodesInGraph: number;

  constructor(private httpService: HttpClient, private route: ActivatedRoute, private visNetworkService: VisNetworkService) {
    this.nodes = new DataSet<Node>([]);
    this.edges = new DataSet<Edge>([]);
    this.visNetworkData = {nodes: this.nodes, edges: this.edges};
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
        // navigationButtons: true,
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
    this.maxGraphEdgeFreq = this.diseaseGraph.edges[this.diseaseGraph.edges.length - 1].weight;
    this.minGraphEdgeFreq = this.diseaseGraph.edges[0].weight;
    console.log(this.maxGraphEdgeFreq);
    this.nodes.clear();
    this.nodes.add(this.diseaseGraph.nodes);
    this.edges.clear();
    this.edges.add(this.diseaseGraph.edges);
    this.selectNode(diseaseId);
  }

  public ngOnInit(): void {
    this.route.params.subscribe(this.onParamsChange.bind(this));
  }

  focusNode(nodeId: IdType): void {
    console.log(this.visNetworkService.getScale(this.visNetwork));
    this._neighbourhoodHighlight({nodes: [nodeId], edges: []});
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

  private highlightConnectedNodes(selectedNode: string | IdType): void {
    console.log('Node selected');
    const allNodes = this.nodes.get({returnType: 'Object'}) as any;
    this.highlightActive = true;
    let i;
    let j;


    const degrees = 2;

    // mark all nodes as hard to read.
    for (const nodeId in allNodes) {
      if (allNodes.hasOwnProperty(nodeId)) {
        // console.log(allNodes[nodeId]);
        allNodes[nodeId].color = 'rgba(200,200,200,0.5)';
        if (allNodes[nodeId].hiddenLabel === undefined) {
          allNodes[nodeId].hiddenLabel = allNodes[nodeId].label;
          allNodes[nodeId].label = undefined;
        }
      }
    }


    const connectedNodes = this.visNetworkService.getConnectedNodes(this.visNetwork, selectedNode) as any[];
    let allConnectedNodes = [];

    // get the second degree nodes
    for (i = 1; i < degrees; i++) {
      for (j = 0; j < connectedNodes.length; j++) {
        allConnectedNodes = allConnectedNodes.concat(
          this.visNetworkService.getConnectedNodes(this.visNetwork, connectedNodes[j] as string)
        );
      }
    }

    // all second degree nodes get a different color and their label back
    for (i = 0; i < allConnectedNodes.length; i++) {
      allNodes[allConnectedNodes[i]].color = 'rgba(150,150,150,0.5)';
      if (allNodes[allConnectedNodes[i]].hiddenLabel !== undefined) {
        allNodes[allConnectedNodes[i]].label =
          allNodes[allConnectedNodes[i]].hiddenLabel;
        allNodes[allConnectedNodes[i]].hiddenLabel = undefined;
      }
    }

    // all first degree nodes get their own color and their label back
    for (i = 0; i < connectedNodes.length; i++) {
      allNodes[connectedNodes[i]].color = this.nodeDefaultColor;
      if (allNodes[connectedNodes[i]].hiddenLabel !== undefined) {
        allNodes[connectedNodes[i]].label =
          allNodes[connectedNodes[i]].hiddenLabel;
        allNodes[connectedNodes[i]].hiddenLabel = undefined;
      }
    }

    // the main node gets its own color and its label back.
    allNodes[selectedNode].color = this.nodeDefaultColor;
    if (allNodes[selectedNode].hiddenLabel !== undefined) {
      allNodes[selectedNode].label = allNodes[selectedNode].hiddenLabel;
      allNodes[selectedNode].hiddenLabel = undefined;
    }

    const updateArray = [];
    for (const nodeId in allNodes) {
      if (allNodes.hasOwnProperty(nodeId)) {
        updateArray.push(allNodes[nodeId]);
      }
    }

    this.nodes.update(updateArray);
  }

  private _neighbourhoodHighlight(params: any): void {
    console.log('higiggwda');
    // tslint:disable-next-line:max-line-length
    // Code from https://visjs.github.io/vis-network/examples/static/jsfiddle.a6eacda850dfe6c88d8ea581887b67b263eb310301cdd593e76f7cabd6df4800.html
    const allNodes = this.nodes.get({returnType: 'Object'}) as any;
    const allEdges = this.edges.get({returnType: 'Object'}) as any;

    if (this.highlightActive === true) {
      console.log('Nothing selected');
      // reset all nodes
      for (const nodeId in allNodes) {
        if (allNodes.hasOwnProperty(nodeId)) {
          allNodes[nodeId].color = this.nodeDefaultColor;
          if (allNodes[nodeId].hiddenLabel !== undefined) {
            allNodes[nodeId].label = allNodes[nodeId].hiddenLabel;
            allNodes[nodeId].hiddenLabel = undefined;
          }
        }

      }

      if (this.lastSelectedEdge) {
        this.lastSelectedEdge.color = this.edgeDefaultColor;
      }
      //
      // mark all nodes as hard to read.
      for (const edgeId in allEdges) {
        if (allEdges.hasOwnProperty(edgeId)) {
          allEdges[edgeId].color = {
            inherit: true,
          };
        }
      }
      this.highlightActive = false;
    }

    if (params?.nodes?.length === 0 && params?.edges?.length === 1) {
      console.log('Edge selected');
      // console.log(allEdges);
      this.highlightActive = true;
      const selectedEdge = params.edges[0];
      this.lastSelectedEdge = allNodes[selectedEdge];


      // mark all nodes as hard to read.
      for (const nodeId in allNodes) {
        if (allNodes.hasOwnProperty(nodeId)) {
          // console.log(allNodes[nodeId]);
          allNodes[nodeId].color = 'rgba(200,200,200,0.5)';
          if (allNodes[nodeId].hiddenLabel === undefined) {
            allNodes[nodeId].hiddenLabel = allNodes[nodeId].label;
            allNodes[nodeId].label = undefined;
          }
        }
      }

      // mark all nodes as hard to read.
      for (const edgeId in allEdges) {
        if (allEdges.hasOwnProperty(edgeId)) {
          allEdges[edgeId].color = 'rgba(200,200,200,0.5)';
        }
      }

      allEdges[selectedEdge].color = this.edgeDefaultColor;

      const connectedNodes = this.visNetworkService.getConnectedNodes(this.visNetwork, selectedEdge) as any[];
      connectedNodes.forEach(nodeId => {
        allNodes[nodeId].color = this.nodeDefaultColor;
        allNodes[nodeId].label = allNodes[nodeId].hiddenLabel;
        allNodes[nodeId].hiddenLabel = undefined;
      });

    } else if (params?.nodes?.length > 0) {
      this.highlightConnectedNodes(params.nodes[0]);
      console.log('connected nodes');
    }

    let updateArray = [];
    for (const edgeId in allEdges) {
      if (allEdges.hasOwnProperty(edgeId)) {
        updateArray.push(allEdges[edgeId]);
      }
    }

    this.edges.update(updateArray);

    // transform the object into an array
    updateArray = [];
    for (const nodeId in allNodes) {
      if (allNodes.hasOwnProperty(nodeId)) {
        updateArray.push(allNodes[nodeId]);
      }
    }

    this.nodes.update(updateArray);

  }

  private _onNetworkClick(eventData: any[]): void {
    const [networkId, clickData] = eventData;

    if (networkId !== this.visNetwork) {
      return;
    }
    this._neighbourhoodHighlight(clickData);
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

  focusEdge({id: edgeId, node}: { id: string, node: IdType }): void {
    this.focusNode(node);
    this.visNetworkService.setSelection(this.visNetwork, {
      nodes: [],
      edges: [edgeId]
    }, {
      unselectAll: true,
      highlightEdges: true
    });
    this._neighbourhoodHighlight({nodes: [], edges: [edgeId]});
    console.log({edgeId, node});
  }

  selectEdge(edgeId: string): void {
    const edge: EDGE = this.edges.get({returnType: 'Object'})[edgeId] as any;
    this.selectedItem.type = 'edge';
    this.selectedItem.value = edge;
  }

  selectNode($event: MatAutocompleteSelectedEvent | string): void {

    const nodeId = $event instanceof MatAutocompleteSelectedEvent ? $event.option.value : $event;
    this.showDetails = true;
    const node: NODE = this.nodes.get({returnType: 'Object'})[nodeId] as NODE;
    this.selectedItem.type = 'node';
    this.selectedItem.value = {
      selectedNode: node,
      connectedNodes: this.getConnectedNodesAndTheirEdges(nodeId),
    };
    this.focusNode(nodeId);
  }

  handleSliderChange($event: MatSliderChange): void {
    console.log('CHANGE', $event);
  }

  handleSliderInput($event: MatSliderChange): void {
    // let edgesCopy = this.diseaseGraph.edges.slice().filter((edge: EDGE) => {
    //   edge.weight
    // });
    console.log('INPUT', $event);


    let limit: number;
    if ($event instanceof MatSliderChange) {
      limit = $event.value;
    } else {
      limit = $event;
    }

    this.currSliderValue = limit;


    const finalNodesSet = new Set<string>();

    const finalEdges = this.diseaseGraph.edges.slice().filter((edge: EDGE) => edge.weight >= limit);
    for (const edge of finalEdges) {
      finalNodesSet.add(edge.from);
      finalNodesSet.add(edge.to);
    }

    const finalNodes = Array.from(finalNodesSet).map(nodeId => this.diseaseGraph.nodes.find(node => node.id === nodeId));
    // this.selectedItem.value = {
    //   selectedNode: (this.selectedItem.value as SelectedItemNodeInfo).selectedNode,
    //   connectedNodes:  (this.selectedItem.value as SelectedItemNodeInfo).connectedNodes,
    //   visibleNodes: finalNodesSet
    // };

    // this.selectedItem.value
    this.nodesInGraph = finalNodesSet.size - 1;
    // (this.selectedItem.value as SelectedItemNodeInfo).visibleNodes = finalNodesSet.size;

    this.nodes.clear();
    this.nodes.add(finalNodes);
    this.edges.clear();
    this.edges.add(finalEdges);
    // this.visNetworkService.fit(this.visNetwork);
  }
}
