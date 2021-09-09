import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {ConnectedNode, EDGE, GRAPH} from 'src/app/models/graph.model';
import {Data, DataSet, Edge, Node, Options, VisNetworkService} from 'ngx-vis';
import {fullPhenonetConfig, sPhenonetConfig} from 'src/util/utils';

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
      const cgraphData: GRAPH  = (graphData.currentValue as GRAPH);
      this.setGraphData(cgraphData);
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

    // this.visNetworkService.on(this.visNetwork, 'hoverNode');
    // this.visNetworkService.hoverNode.subscribe(this._onNetworkHoverNode.bind(this));
    //
    // this.visNetworkService.on(this.visNetwork, 'blurNode');
    // this.visNetworkService.blurNode.subscribe(this._onNetworkBlurNode.bind(this));
    //
    // this.visNetworkService.on(this.visNetwork, 'hoverEdge');
    // this.visNetworkService.hoverEdge.subscribe(this._onNetworkHoverEdge.bind(this));
    //
    // this.visNetworkService.on(this.visNetwork, 'blurEdge');
    // this.visNetworkService.blurEdge.subscribe(this._onNetworkBlurEdge.bind(this));
  }

  private _onNetworkHoverNode(eventData: any[]): void {
    console.log('hoverNode');
  }

  private _onNetworkBlurNode(eventData: any[]): void {
    console.log('blurNode');
  }

  private _onNetworkHoverEdge(eventData: any[]): void {
    console.log('hoverEdge');
  }

  private _onNetworkBlurEdge(eventData: any[]): void {
    console.log('blurEdge');
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
}
