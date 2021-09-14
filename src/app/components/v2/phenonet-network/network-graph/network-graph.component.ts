import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output, Renderer2,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {ConnectedNode, EDGE, GRAPH, NODE} from 'src/app/models/graph.model';
import {Data, DataSet, Edge, Node, Options, VisNetworkService} from 'ngx-vis';
import {edgeDefaultColor, fullPhenonetConfig, nodeDefaultColor, sPhenonetConfig} from 'src/util/utils';
import {IdType} from 'vis';

@Component({
  selector: 'app-network-graph',
  templateUrl: './network-graph.component.html',
  styleUrls: ['./network-graph.component.scss']
})
export class NetworkGraphComponent implements OnInit, OnChanges, AfterViewInit {

  @Input() graphData: GRAPH;
  @Input() disease: string;
  @Input() sliderValue: number;
  @Input() diseaseToBeHighlighted: string;

  @Output() selectEdge = new EventEmitter<ConnectedNode>();
  @Output() selectNode = new EventEmitter<string>();
  @Output() filterNodes = new EventEmitter<string[]>();

  @ViewChild('networkCanvas') canvasContainer: ElementRef;

  canvas: HTMLCanvasElement;

  /* About Vis.js Network Graph */
  public visNetwork = 'networkDisease';
  public visNetworkData: Data;
  private nodes: DataSet<Node>;
  private edges: DataSet<Edge>;
  public visNetworkOptions: Options;
  private highlightActive: boolean;
  private lastSelectedEdge: any;

  constructor(
    private visNetworkService: VisNetworkService,
    private rd: Renderer2
  ) {
    this.nodes = new DataSet<Node>([]);
    this.edges = new DataSet<Edge>([]);
    this.visNetworkData = {nodes: this.nodes, edges: this.edges};
  }

  ngAfterViewInit(): void{
    this.canvas = this.canvasContainer.nativeElement.children[0].children[0] as HTMLCanvasElement;
    console.log(this.canvas);
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
    this.filterNodes.emit(Array.from(finalNodesSet));
  }

  ngOnChanges(changes: SimpleChanges): void {
    const {disease, graphData, sliderValue, diseaseToBeHighlighted} = changes;
    if (disease?.currentValue) {this._onChangeDisease(disease.currentValue); }
    if (graphData?.currentValue) {
      this.setGraphData((graphData.currentValue as GRAPH));
    }
    if (sliderValue?.currentValue) {
      this._onChangeSlider(sliderValue.currentValue as number);
    }

    if (diseaseToBeHighlighted?.currentValue) {
      this._focusNode(diseaseToBeHighlighted.currentValue);
    }
  }

  setGraphData(graph: GRAPH): void {
    this.nodes.clear();
    this.nodes.add(graph.nodes);
    this.edges.clear();
    this.edges.add(graph.edges);
  }

  private _focusNode(diseaseId: string): void {
    this.highlightConnectedNodes(diseaseId);
    const nodePos = this.visNetworkService.getPositions(this.visNetwork, [diseaseId])[diseaseId];
    this.visNetworkService.selectNodes(this.visNetwork, [diseaseId], false);
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

  public networkInitialized(): void {

    this.visNetworkService.on(this.visNetwork, 'beforeDrawing');
    this.visNetworkService.beforeDrawing.subscribe((eventData: any[]) => {
      // const [_, ctx] = eventData;
      // ctx.fillStyle = 'rgb(0,255,255)';
      // ctx.strokeStyle = 'red';
      // ctx.stroke();
      // ctx.fillRect(-200,-200,this.canvas.width,this.canvas.height);
      // console.log(ctx);
    });
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
    const [_, clickData] = eventData;
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
    console.log('da', Array.from(new Set([...allConnectedNodes, ...connectedNodes])).sort());
    for (i = 0; i < allConnectedNodes.length; i++) {
      allNodes[allConnectedNodes[i]].color = 'rgba(150,150,150,0.5)';
      if (allNodes[allConnectedNodes[i]].hiddenLabel !== undefined) {
        allNodes[allConnectedNodes[i]].label =
          allNodes[allConnectedNodes[i]].hiddenLabel;
        allNodes[allConnectedNodes[i]].hiddenLabel = undefined;
      }
    }

    // all first degree nodes get their own color and their label back
    console.log('od', Array.from(new Set(connectedNodes)).sort());
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

  fitAllNodes(): void {
    try {
      this.visNetworkService.fit(this.visNetwork, {animation: true});
    }catch (e) {
      this.visNetworkService.blurEdge.emit([]);
      setTimeout(() => {
        this.visNetworkService.fit(this.visNetwork, {animation: true});
      }, 0);
    }
  }

  zoomIn(): void {
    const scale = this.visNetworkService.getScale(this.visNetwork);
    this.visNetworkService.moveTo(this.visNetwork, { position: { x: 0, y: 0}, scale: scale + 0.3, animation: true} );
  }

  zoomOut(): void {
    const scale = this.visNetworkService.getScale(this.visNetwork);
    this.visNetworkService.moveTo(this.visNetwork, { position: { x: 0, y: 0}, scale: scale - 0.3, animation: true} );
  }

  savePNG(): void {
    function downloadBlob(url, filename) {
      // Create an object URL for the blob object
      // const url = URL.createObjectURL(blob);

      // Create a new anchor element
      const a = document.createElement('a');

      // Set the href and download attributes for the anchor element
      // You can optionally set other attributes like `title`, etc
      // Especially, if the anchor element will be attached to the DOM
      a.href = url;
      a.download = filename || 'download';

      // Click handler that releases the object URL after the element has been clicked
      // This is required for one-off downloads of the blob content
      const clickHandler = function() {
        setTimeout(() => {
          URL.revokeObjectURL(url);
          this.removeEventListener('click', clickHandler);
        }, 150);
      };

      // Add the click event listener on the anchor element
      // Comment out this line if you don't want a one-off download of the blob content
      a.addEventListener('click', clickHandler.bind(a), false);

      // Programmatically trigger a click on the anchor element
      // Useful if you want the download to happen automatically
      // Without attaching the anchor element to the DOM
      // Comment out this line if you don't want an automatic download of the blob content
      a.click();

      // Return the anchor element
      // Useful if you want a reference to the element
      // in order to attach it to the DOM or use it in some other way
      return a;
    }
    const a = this.canvas.getAttribute('background');
    console.log(a);
    const img = this.canvas.toDataURL('image/png');
    downloadBlob(img, 'adad');
    // console.log(img);
  }
}
