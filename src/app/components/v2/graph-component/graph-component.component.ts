import {Component, OnDestroy, OnInit} from '@angular/core';
import {Data, DataSet, Edge, Node, VisNetworkService} from 'ngx-vis';
import {GplData, GPLEDGE, GPLNODE} from '../../../models/gplGraph.model';
import {EDGE, GRAPH, NODE} from '../../../models/graph.model';
import {Subject, Subscription} from 'rxjs';
import {IdType} from 'vis';
import {edgeDefaultColor, nodeDefaultColor} from '../../../../util/utils';
import {ImageSaver} from '../../../../util/ImageSaver';

@Component({
  selector: 'app-graph-component',
  templateUrl: './graph-component.component.html',
  styleUrls: ['./graph-component.component.scss']
})
export class GraphComponentComponent implements OnInit, OnDestroy{
  public visNetwork = 'override_this';

  public visNetworkData: Data;
  public nodes: DataSet<Node>;
  public edges: DataSet<Edge>;

  public selectedEdge = new Subject<GPLEDGE | EDGE>();
  readonly selectedEdge$ = this.selectedEdge.asObservable();

  public selectedNode = new Subject<GPLNODE | NODE>();
  readonly selectedNode$ = this.selectedNode.asObservable();
  public highlightActive: boolean;
  public lastSelectedEdge: any;

  canvas: HTMLCanvasElement;
  private clickSub: Subscription;

  constructor(public visNetworkService: VisNetworkService) {
  }

  ngOnInit(): void {

    this.nodes = new DataSet<Node>();
    this.edges = new DataSet<Edge>();
    this.visNetworkData = {nodes: this.nodes, edges: this.edges};
  }

  ngOnDestroy(): void {
    this.clickSub.unsubscribe();
  }

  zoomIn(): void {
    const scale = this.visNetworkService.getScale(this.visNetwork);
    console.log(scale);
    this.visNetworkService.moveTo(this.visNetwork, {position: {x: 0, y: 0}, scale: scale + 0.3, animation: true});
  }

  zoomOut(): void {
    const scale = this.visNetworkService.getScale(this.visNetwork);
    console.log(scale);
    this.visNetworkService.moveTo(this.visNetwork, {
      position: {x: 0, y: 0},
      scale: scale - 0.3 <= 0 ? 0.1 : scale - 0.3,
      animation: true
    });
  }

  savePNG(): void {
    const imageSaver = new ImageSaver();
    imageSaver.fromCanvas(this.canvas);
    imageSaver.requestDownload('test');
  }


  setGraphData(graph: GplData | GRAPH): void {
    this.nodes.clear();
    this.nodes.add(graph.nodes);
    this.edges.clear();
    this.edges.add(graph.edges);
  }

  fitAllNodes(): void {
    try {
      this.visNetworkService.fit(this.visNetwork, {animation: true});
    } catch (e) {
      setTimeout(() => {
        this.visNetworkService.fit(this.visNetwork, {animation: true});
      }, 0);
    }
  }

  public _focusNode(nodeId: string): void {
    this.highlightConnectedNodes(nodeId);
    const nodePos = this.visNetworkService.getPositions(this.visNetwork, [nodeId])[nodeId];
    this.visNetworkService.selectNodes(this.visNetwork, [nodeId], false);
    this.visNetworkService.moveTo(this.visNetwork, {
      position: nodePos,
      scale: 1,
      offset: {
        x: 0,
        y: -100
      },
      animation: {
        easingFunction: 'easeInOutCubic',
        duration: 500
      }
    });
  }

  public networkInitialized(): void {
    // now we can use the service to register on events
    this.visNetworkService.on(this.visNetwork, 'click');
    this.clickSub = this.visNetworkService.click.subscribe(this._onNetworkClick.bind(this));

    // this.visNetworkService.on(this.visNetwork, 'selectEdge');
    // this.visNetworkService.selectEdge.subscribe(this._onNetworkSelectEdge.bind(this));

    // this.visNetworkService.on(this.visNetwork, 'deselectEdge');
    // this.deselectEdgeSub = this.visNetworkService.deselectEdge.subscribe(this._onNetworkDeselectEdge.bind(this));
    //
    // this.visNetworkService.on(this.visNetwork, 'hoverNode');
    // this.hoverNodeSub = this.visNetworkService.hoverNode.subscribe(this._onNetworkHoverNode.bind(this));
    //
    // this.visNetworkService.on(this.visNetwork, 'blurNode');
    // this.blurNodeSub = this.visNetworkService.blurNode.subscribe(this._onNetworkBlurNode.bind(this));
    //
    // this.visNetworkService.on(this.visNetwork, 'hoverEdge');
    // this.hoverEdgeSub = this.visNetworkService.hoverEdge.subscribe(this._onNetworkHoverEdge.bind(this));
    //
    // this.visNetworkService.on(this.visNetwork, 'blurEdge');
    // this.blurEdgeSub = this.visNetworkService.blurEdge.subscribe(this._onNetworkBlurEdge.bind(this));
  }

  private _onNetworkClick(eventData: any[]): void {
    const [networkId, clickData] = eventData;


    if (networkId !== this.visNetwork) {
      return;
    }
    if (clickData?.nodes?.length === 0 && clickData?.edges?.length === 1) {
      // Edge is clicked but do nothing because this logic in handled in _onNetworkSelectEdge
      this._onNetworkSelectEdge(eventData);
    } else if (clickData?.nodes.length > 0) {
      // Node is clicked
      const clickedNode = clickData.nodes[0];
      const allNodes = this.nodes.get({returnType: 'Object'}) as any;
      const cNode = allNodes[clickedNode];
      this.selectedNode.next(cNode);
      this.highlightConnectedNodes(clickedNode);
      this._onNetworkDeselectEdge();
    } else {
      this._onNetworkBlurNode(eventData);
      this.selectedNode.next(undefined);
      this._onNetworkDeselectEdge();
    }
  }

  private _onNetworkSelectEdge(eventData: any[]): void {
    const [, clickData] = eventData;
    const clickedEdge = clickData.edges[0];
    const allEdges = this.edges.get({returnType: 'Object'}) as any;
    const cEdge = allEdges[clickedEdge] as GPLEDGE;
    const allNodes = this.nodes.get({returnType: 'Object'}) as any;
    cEdge.from = allNodes[cEdge.from as string];
    cEdge.to = allNodes[cEdge.to as string];
    this.selectedEdge.next(cEdge);
    this.selectedNode.next(undefined);
    this._onNetworkHoverEdge([undefined, {edge: clickedEdge}]);
  }


  private _onNetworkDeselectEdge(): void {
    this.selectedEdge.next(undefined);
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
      allNodes[nodeId].color = this.visNetwork === 'phenonet' ? nodeDefaultColor : undefined;
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

  public highlightConnectedNodes(selectedNode: string | IdType): void {
    console.log('Node selected', selectedNode);
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
      allNodes[connectedNodes[i]].color = this.visNetwork === 'phenonet' ? nodeDefaultColor : undefined;
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

  private _onNetworkBlurNode(eventData: any[]): void {
    const allNodes = this.nodes.get({returnType: 'Object'}) as any;
    const allEdges = this.edges.get({returnType: 'Object'}) as any;
    if (this.highlightActive === true) {
      console.log('Nothing hovered');
      // reset all nodes
      for (const nodeId in allNodes) {
        if (allNodes.hasOwnProperty(nodeId)) {
          allNodes[nodeId].color = this.visNetwork === 'phenonet' ? nodeDefaultColor : undefined;
          if (allNodes[nodeId].hiddenLabel !== undefined) {
            allNodes[nodeId].label = allNodes[nodeId].hiddenLabel;
            allNodes[nodeId].hiddenLabel = undefined;
          }
        }

      }

      if (this.lastSelectedEdge) {
        this.lastSelectedEdge.color = edgeDefaultColor;
      }

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

}
