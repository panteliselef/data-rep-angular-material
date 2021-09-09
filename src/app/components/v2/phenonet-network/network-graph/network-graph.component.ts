import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {ConnectedNode, EDGE, GRAPH} from 'src/app/models/graph.model';
import {Data, DataSet, Edge, Node, Options, VisNetworkService} from 'ngx-vis';
import {edgeDefaultColor, fullPhenonetConfig, nodeDefaultColor, sPhenonetConfig} from 'src/util/utils';
import {IdType} from 'vis';

@Component({
  selector: 'app-network-graph',
  templateUrl: './network-graph.component.html',
  styleUrls: ['./network-graph.component.scss']
})
export class NetworkGraphComponent implements OnInit, OnChanges {

  @Input() graphData: GRAPH;
  @Input() disease: string;
  @Input() sliderValue: number;

  @Output() selectEdge = new EventEmitter<ConnectedNode>();
  @Output() selectNode = new EventEmitter<string>();

  /* About Vis.js Network Graph */
  public visNetwork = 'networkDisease';
  public visNetworkData: Data;
  private nodes: DataSet<Node>;
  private edges: DataSet<Edge>;
  public visNetworkOptions: Options;
  private highlightActive: boolean;
  private lastSelectedEdge: any;

  constructor(private visNetworkService: VisNetworkService) {
    this.nodes = new DataSet<Node>([]);
    this.edges = new DataSet<Edge>([]);
    this.visNetworkData = {nodes: this.nodes, edges: this.edges};
  }

  ngOnInit(): void {

  }

  private _onChangeDisease(disease: string): void {
    this.disease = disease;
    if (disease === 'phenonet') { // is full Phenonet
      this.visNetworkOptions = fullPhenonetConfig;
    }else {
      this.visNetworkOptions = sPhenonetConfig;
    }
  }

  private _onChangeSlider(currentValue: number): void {
    const finalNodesSet = new Set<string>();
    const finalEdges = this.graphData.edges.slice().filter((edge: EDGE) => edge.weight >= currentValue);
    for (const edge of finalEdges) {
      finalNodesSet.add(edge.from);
      finalNodesSet.add(edge.to);
    }
    const finalNodes = Array.from(finalNodesSet).map(nodeId => this.graphData.nodes.find(node => node.id === nodeId));
    // this.nodesInGraph = finalNodesSet.size - 1;

    this.setGraphData({
      nodes: finalNodes,
      edges: finalEdges
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const {disease, graphData, sliderValue} = changes;
    if (disease?.currentValue) {this._onChangeDisease(disease.currentValue); }
    if (graphData?.currentValue) {
      this.setGraphData((graphData.currentValue as GRAPH));
    }
    if (sliderValue?.currentValue) {
      this._onChangeSlider(sliderValue.currentValue as number);
    }
  }

  setGraphData(graph: GRAPH): void {
    this.nodes.clear();
    this.nodes.add(graph.nodes);
    this.edges.clear();
    this.edges.add(graph.edges);
  }


  public networkInitialized(): void {
    // now we can use the service to register on events
    this.visNetworkService.on(this.visNetwork, 'click');
    this.visNetworkService.click.subscribe(this._onNetworkClick.bind(this));

    this.visNetworkService.on(this.visNetwork, 'selectEdge');
    this.visNetworkService.selectEdge.subscribe(this._onNetworkSelectEdge.bind(this));

    this.visNetworkService.on(this.visNetwork, 'deselectEdge');
    this.visNetworkService.deselectEdge.subscribe(this._onNetworkDeselectEdge.bind(this));

    this.visNetworkService.on(this.visNetwork, 'hoverNode');
    this.visNetworkService.hoverNode.subscribe(this._onNetworkHoverNode.bind(this));

    this.visNetworkService.on(this.visNetwork, 'blurNode');
    this.visNetworkService.blurNode.subscribe(this._onNetworkBlurNode.bind(this));

    this.visNetworkService.on(this.visNetwork, 'hoverEdge');
    this.visNetworkService.hoverEdge.subscribe(this._onNetworkHoverEdge.bind(this));

    this.visNetworkService.on(this.visNetwork, 'blurEdge');
    this.visNetworkService.blurEdge.subscribe(this._onNetworkBlurEdge.bind(this));
  }

  private _onNetworkHoverNode(eventData: any[]): void {
    const [networkId, clickData] = eventData;
    const hoveredNode = clickData.node;
    console.log('hoverNode', hoveredNode);

    this.highlightConnectedNodes(hoveredNode);
  }

  private _onNetworkBlurNode(eventData: any[]): void {
    const allNodes = this.nodes.get({returnType: 'Object'}) as any;
    const allEdges = this.edges.get({returnType: 'Object'}) as any;
    if (this.highlightActive === true) {
      console.log('Nothing selected');
      // reset all nodes
      for (const nodeId in allNodes) {
        if (allNodes.hasOwnProperty(nodeId)) {
          allNodes[nodeId].color = nodeDefaultColor;
          if (allNodes[nodeId].hiddenLabel !== undefined) {
            allNodes[nodeId].label = allNodes[nodeId].hiddenLabel;
            allNodes[nodeId].hiddenLabel = undefined;
          }
        }

      }

      if (this.lastSelectedEdge) {
        this.lastSelectedEdge.color = edgeDefaultColor;
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
  }

  private _onNetworkHoverEdge(eventData: any[]): void {
    const allNodes = this.nodes.get({returnType: 'Object'}) as any;
    const allEdges = this.edges.get({returnType: 'Object'}) as any;

    const [networkId, clickData] = eventData;
    const hoveredEdge = clickData.edge;
    console.log(hoveredEdge);
    this.highlightActive = true;
    const selectedEdge = hoveredEdge;
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

    allEdges[selectedEdge].color = edgeDefaultColor;

    const connectedNodes = this.visNetworkService.getConnectedNodes(this.visNetwork, selectedEdge) as any[];
    connectedNodes.forEach(nodeId => {
      allNodes[nodeId].color = nodeDefaultColor;
      allNodes[nodeId].label = allNodes[nodeId].hiddenLabel;
      allNodes[nodeId].hiddenLabel = undefined;
    });

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

  private _onNetworkBlurEdge(eventData: any[]): void {
    this._onNetworkBlurNode([]);
  }

  private _onNetworkClick(eventData: any[]): void {
    const [networkId, clickData] = eventData;

    if (networkId !== this.visNetwork) {
      return;
    }
    if (clickData?.nodes?.length === 0 && clickData?.edges?.length === 1) {
      // Edge is clicked
      this._onNetworkSelectEdge(eventData);
    }else if (clickData?.nodes.length > 0) {
      // Node is clicked
      const clickedNode = clickData.nodes[0];
      this.selectNode.emit(clickedNode);
      this._onNetworkDeselectEdge();
    }else {
      this._onNetworkDeselectEdge();
    }
  }

  private _onNetworkSelectEdge(eventData: any[]): void {
    const [_, clickData] = eventData;
    const clickedEdge = clickData.edges[0];
    const allEdges = this.edges.get({returnType: 'Object'}) as any;
    const cEdge = allEdges[clickedEdge] as EDGE;
    this.selectEdge.emit({
      ...cEdge,
      node: cEdge.from === this.disease ? cEdge.to : cEdge.from
    });
  }


  private _onNetworkDeselectEdge(): void {
    this.selectEdge.emit(undefined);
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
      allNodes[connectedNodes[i]].color = nodeDefaultColor;
      if (allNodes[connectedNodes[i]].hiddenLabel !== undefined) {
        allNodes[connectedNodes[i]].label =
          allNodes[connectedNodes[i]].hiddenLabel;
        allNodes[connectedNodes[i]].hiddenLabel = undefined;
      }
    }

    // the main node gets its own color and its label back.
    allNodes[selectedNode].color = nodeDefaultColor;
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
}
