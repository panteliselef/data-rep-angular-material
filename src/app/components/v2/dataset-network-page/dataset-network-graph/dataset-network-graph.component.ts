import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {ConnectedNode} from 'src/app/models/graph.model';
import {Data, DataSet, Edge, Node, Options, VisNetworkService} from 'ngx-vis';
import {edgeDefaultColor, gplConfig, nodeDefaultColor, gplEdgeColor} from 'src/util/utils';
import {GplData, GPLEDGE, GPLNODE} from 'src/app/models/gplGraph.model';
import {DatasetNetworkService} from '../dataset-network.service';
import {Observable, Subscription} from 'rxjs';
import {IdType} from 'vis';
import {ImageSaver} from 'src/util/ImageSaver';
import groupsGPL570 from 'src/assets/groupColors/GPL570.json';
import groupsGPL96 from 'src/assets/groupColors/GPL96.json';

@Component({
  selector: 'app-dataset-network-graph',
  templateUrl: './dataset-network-graph.component.html',
  styleUrls: ['./dataset-network-graph.component.scss']
})
export class DatasetNetworkGraphComponent implements OnInit, OnDestroy, AfterViewInit {

  graphData$: Observable<GplData>;
  @Input() sliderValue: number;
  diseaseToBeHighlighted$: Observable<string>;

  @Output() selectEdge = new EventEmitter<ConnectedNode>();
  @Output() selectNode = new EventEmitter<string>();
  @Output() filterNodes = new EventEmitter<string[]>();

  @ViewChild('networkCanvas') canvasContainer: ElementRef;

  canvas: HTMLCanvasElement;

  /* About Vis.js Network Graph */
  public visNetwork = 'datasetNetwork';
  public visNetworkData: Data;
  private nodes: DataSet<Node>;
  private edges: DataSet<Edge>;
  public visNetworkOptions: Options;
  private highlightActive: boolean;
  private lastSelectedEdge: any;
  private diseaseToBeHighlightedSub: Subscription;
  private filteredGraphSub: Subscription;
  private selectedEdgeSub: Subscription;
  private selectedNodeSub: Subscription;

  constructor(
    private datasetNetworkService: DatasetNetworkService,
    private visNetworkService: VisNetworkService
  ) {
    this.nodes = new DataSet<Node>([]);
    this.edges = new DataSet<Edge>([]);
    this.visNetworkData = {nodes: this.nodes, edges: this.edges};
  }

  ngAfterViewInit(): void{
    this.canvas = this.canvasContainer.nativeElement.children[0].children[0] as HTMLCanvasElement;
  }

  ngOnInit(): void {
    // gplConfig.groups = groupsGPL570;
    this.visNetworkOptions = gplConfig;

    this.datasetNetworkService.technology$.subscribe((technology) => {
      if (!technology) { return; }
      switch (technology) {
        case 'GPL96': gplConfig.groups = groupsGPL96; break;
        case 'GPL570': gplConfig.groups = groupsGPL570; break;
        default: return;
      }
      this.visNetworkOptions = gplConfig;
    });

    this.filteredGraphSub = this.datasetNetworkService.filteredGraph$.subscribe(this.setGraphData.bind(this));
    this.diseaseToBeHighlighted$ = this.datasetNetworkService.diseaseToBeHighlighted$;
    this.diseaseToBeHighlightedSub = this.diseaseToBeHighlighted$.subscribe((diseaseToBeHighlighted: string) => {
      if (!diseaseToBeHighlighted) { return; }
      this._highlightByDisease(diseaseToBeHighlighted);
      console.log('Disease Highlighted: ', diseaseToBeHighlighted);
    });

    this.selectedEdgeSub = this.datasetNetworkService.selectedEdge$.subscribe((selectedEdge: GPLEDGE) => {
      console.log('Selected Edge', selectedEdge);
    });

    this.selectedNodeSub = this.datasetNetworkService.selectedNode$.subscribe((selectedNode: GPLNODE) => {
      if (!selectedNode) { return; }
      setTimeout(() => this._focusNode(selectedNode.id), 300);
    });
  }

  ngOnDestroy(): void {
    this.filteredGraphSub.unsubscribe();
    this.diseaseToBeHighlightedSub.unsubscribe();
    this.selectedEdgeSub.unsubscribe();
    this.selectedNodeSub.unsubscribe();
  }

  setGraphData(graph: GplData): void {
    console.log(graph);
    this.nodes.clear();
    this.nodes.add(graph.nodes);
    this.edges.clear();
    this.edges.add(graph.edges);
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

  public networkInitialized(): void {

    this.visNetworkService.on(this.visNetwork, 'afterDrawing');
    this.visNetworkService.afterDrawing.subscribe((eventData: any[]) => {
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

    // this.visNetworkService.on(this.visNetwork, 'selectEdge');
    // this.visNetworkService.selectEdge.subscribe(this._onNetworkSelectEdge.bind(this));

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
    const [, clickData] = eventData;
    const hoveredNode = clickData.node;
    console.log('hoverNode', hoveredNode);

    this.highlightConnectedNodes(hoveredNode);
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

  private _onNetworkBlurNode(eventData: any[]): void {
    const allNodes = this.nodes.get({returnType: 'Object'}) as any;
    const allEdges = this.edges.get({returnType: 'Object'}) as any;
    if (this.highlightActive === true) {
      console.log('Nothing hovered');
      // reset all nodes
      for (const nodeId in allNodes) {
        if (allNodes.hasOwnProperty(nodeId)) {
          allNodes[nodeId].color = undefined;
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
            inherit: false,
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

    const [, clickData] = eventData;
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
      allNodes[nodeId].color = undefined;
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
      // Edge is clicked but do nothing because this logic in handled in _onNetworkSelectEdge
      this._onNetworkSelectEdge(eventData);
    }else if (clickData?.nodes.length > 0) {
      // Node is clicked
      console.log('nodeeee');
      const clickedNode = clickData.nodes[0];
      const allNodes = this.nodes.get({returnType: 'Object'}) as any;
      const cNode = allNodes[clickedNode] as GPLNODE;
      this.datasetNetworkService.updateSelectedNode(cNode);
      this._onNetworkDeselectEdge();
    }else {
      this.datasetNetworkService.updateSelectedNode(undefined);
      this._onNetworkDeselectEdge();
    }
  }

  private _onNetworkSelectEdge(eventData: any[]): void {
    const [, clickData] = eventData;
    const clickedEdge = clickData.edges[0];
    const allEdges = this.edges.get({returnType: 'Object'}) as any;
    const cEdge = allEdges[clickedEdge] as GPLEDGE;
    const allNodes = this.nodes.get({returnType: 'Object'}) as any;
    cEdge.from = allNodes[cEdge.from as string] as GPLNODE;
    cEdge.to = allNodes[cEdge.to as string] as GPLNODE;
    this.datasetNetworkService.updateSelectedEdge(cEdge);
    this.datasetNetworkService.updateSelectedNode(undefined);
  }

  private _onNetworkDeselectEdge(): void {
    this.datasetNetworkService.updateSelectedEdge(undefined);
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
      allNodes[connectedNodes[i]].color = undefined;
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

  private _highlightByDisease(diseaseName: string): void {
    console.log('By disease Highlight');
    // tslint:disable-next-line:max-line-length
    // Code from https://visjs.github.io/vis-network/examples/static/jsfiddle.a6eacda850dfe6c88d8ea581887b67b263eb310301cdd593e76f7cabd6df4800.html
    const allNodes = this.nodes.get({returnType: 'Object'}) as any;
    const allEdges = this.edges.get({returnType: 'Object'}) as any;

    if (this.highlightActive === true) {
      console.log('Nothing selected');
      // reset all nodes
      for (const nodeId in allNodes) {
        if (allNodes.hasOwnProperty(nodeId)) {
          allNodes[nodeId].color = undefined;
          if (allNodes[nodeId].hiddenLabel !== undefined) {
            allNodes[nodeId].label = allNodes[nodeId].hiddenLabel;
            allNodes[nodeId].hiddenLabel = undefined;
          }
        }

      }

      if (this.lastSelectedEdge) {
        // this.lastSelectedEdge.color = this.edgeDefaultColor;
      }
      //
      // mark all nodes as hard to read.
      for (const edgeId in allEdges) {
        if (allEdges.hasOwnProperty(edgeId)) {
          allEdges[edgeId].color = gplEdgeColor;
        }
      }
      this.highlightActive = false;
    }
    // Highlight only nodes that represent the corresponding disease

    this.highlightActive = true;

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

    const allDiseaseNodes = Object.values(allNodes)
      .filter(({group}: { group: string }) => group.toLowerCase() === diseaseName.toLowerCase())
      .map(({id}: {id: string}) => id) as string[];

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < allDiseaseNodes.length; i++) {
      allNodes[allDiseaseNodes[i]].color = undefined;
      if (allNodes[allDiseaseNodes[i]].hiddenLabel !== undefined) {
        allNodes[allDiseaseNodes[i]].label =
          allNodes[allDiseaseNodes[i]].hiddenLabel;
        allNodes[allDiseaseNodes[i]].hiddenLabel = undefined;
      }
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

  zoomIn(): void {
    const scale = this.visNetworkService.getScale(this.visNetwork);
    this.visNetworkService.moveTo(this.visNetwork, { position: { x: 0, y: 0}, scale: scale + 0.3, animation: true} );
  }

  zoomOut(): void {
    const scale = this.visNetworkService.getScale(this.visNetwork);
    this.visNetworkService.moveTo(this.visNetwork, { position: { x: 0, y: 0}, scale: scale - 0.3, animation: true} );
  }

  savePNG(): void {
    const imageSaver = new ImageSaver();
    imageSaver.fromCanvas(this.canvas);
    imageSaver.requestDownload('test');
  }
}

