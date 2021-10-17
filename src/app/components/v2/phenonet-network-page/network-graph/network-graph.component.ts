import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {ConnectedNode, NODE} from 'src/app/models/graph.model';
import {DataSet, Edge, Node, Options, VisNetworkService} from 'ngx-vis';
import {fullPhenonetConfig} from 'src/util/utils';
import {ActivatedRoute} from '@angular/router';
import {PhenonetNetworkService} from '../phenonet-network.service';
import {Observable, Subscription} from 'rxjs';
import {GraphComponentComponent} from '../../graph-component/graph-component.component';
import {filter} from 'rxjs/operators';

@Component({
  selector: 'app-network-graph',
  templateUrl: './network-graph.component.html',
  styleUrls: ['./network-graph.component.scss']
})
export class NetworkGraphComponent extends GraphComponentComponent implements OnInit, OnChanges, AfterViewInit {

  @Input() disease: string;

  @ViewChild('networkCanvas') canvasContainer: ElementRef;

  /* About Vis.js Network Graph */
  public visNetwork = 'phenonet'; // Do not change this value
  public visNetworkOptions: Options;
  private filteredGraphSub: Subscription;
  private diseaseToBeHighlighted$: Observable<string>;
  private diseaseToBeHighlightedSub: Subscription;

  constructor(
    public visNetworkService: VisNetworkService,
    private route: ActivatedRoute,
    private phenonetService: PhenonetNetworkService
  ) {
    super(visNetworkService);
    this.nodes = new DataSet<Node>([]);
    this.edges = new DataSet<Edge>([]);
    this.visNetworkData = {nodes: this.nodes, edges: this.edges};
  }

  ngAfterViewInit(): void{
    this.canvas = this.canvasContainer.nativeElement.children[0].children[0] as HTMLCanvasElement;
  }

  ngOnInit(): void {
    this.filteredGraphSub = this.phenonetService.filteredGraph$.subscribe(this.setGraphData.bind(this));
    this.diseaseToBeHighlighted$ = this.phenonetService.diseaseToBeHighlighted$;
    this.diseaseToBeHighlightedSub = this.diseaseToBeHighlighted$.subscribe((diseaseToBeHighlighted: string) => {
      if (!diseaseToBeHighlighted) { return; }
      this._focusNode(diseaseToBeHighlighted);
      console.log('Disease Highlighted: ', diseaseToBeHighlighted);
    });

    this.selectedEdge$
      .subscribe(edge => this.phenonetService.updateSelectedEdge(edge ? {
        ...edge,
        node: edge.from === this.disease ? edge.to : edge.from
      } as ConnectedNode : undefined));
    this.selectedNode$.pipe(filter(node => typeof node !== 'undefined'))
      .subscribe(node => this.phenonetService.updateSelectedNode((node as NODE).id));
  }

  private _onChangeDisease(disease: string): void {
    this.disease = disease;
    this.visNetworkOptions = fullPhenonetConfig;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const {disease} = changes;
    if (disease?.currentValue) {this._onChangeDisease(disease.currentValue); }
  }

  // private _onNetworkBlurNode(eventData: any[]): void {
  //   const allNodes = this.nodes.get({returnType: 'Object'}) as any;
  //   const allEdges = this.edges.get({returnType: 'Object'}) as any;
  //   if (this.highlightActive === true) {
  //     console.log('Nothing selected');
  //     // reset all nodes
  //     for (const nodeId in allNodes) {
  //       if (allNodes.hasOwnProperty(nodeId)) {
  //         allNodes[nodeId].color = nodeDefaultColor;
  //         if (allNodes[nodeId].hiddenLabel !== undefined) {
  //           allNodes[nodeId].label = allNodes[nodeId].hiddenLabel;
  //           allNodes[nodeId].hiddenLabel = undefined;
  //         }
  //       }
  //
  //     }
  //
  //     if (this.lastSelectedEdge) {
  //       this.lastSelectedEdge.color = edgeDefaultColor;
  //     }
  //     //
  //     // mark all nodes as hard to read.
  //     for (const edgeId in allEdges) {
  //       if (allEdges.hasOwnProperty(edgeId)) {
  //         allEdges[edgeId].color = {
  //           inherit: true,
  //         };
  //       }
  //     }
  //     this.highlightActive = false;
  //
  //     let updateArray = [];
  //     for (const edgeId in allEdges) {
  //       if (allEdges.hasOwnProperty(edgeId)) {
  //         updateArray.push(allEdges[edgeId]);
  //       }
  //     }
  //
  //     this.edges.update(updateArray);
  //
  //     // transform the object into an array
  //     updateArray = [];
  //     for (const nodeId in allNodes) {
  //       if (allNodes.hasOwnProperty(nodeId)) {
  //         updateArray.push(allNodes[nodeId]);
  //       }
  //     }
  //     this.nodes.update(updateArray);
  //   }
  // }
  //
  // private _onNetworkHoverEdge(eventData: any[]): void {
  //   const allNodes = this.nodes.get({returnType: 'Object'}) as any;
  //   const allEdges = this.edges.get({returnType: 'Object'}) as any;
  //
  //   const [, clickData] = eventData;
  //   const hoveredEdge = clickData.edge;
  //   console.log(hoveredEdge);
  //   this.highlightActive = true;
  //   const selectedEdge = hoveredEdge;
  //   this.lastSelectedEdge = allNodes[selectedEdge];
  //
  //
  //   // mark all nodes as hard to read.
  //   for (const nodeId in allNodes) {
  //     if (allNodes.hasOwnProperty(nodeId)) {
  //       // console.log(allNodes[nodeId]);
  //       allNodes[nodeId].color = 'rgba(200,200,200,0.5)';
  //       if (allNodes[nodeId].hiddenLabel === undefined) {
  //         allNodes[nodeId].hiddenLabel = allNodes[nodeId].label;
  //         allNodes[nodeId].label = undefined;
  //       }
  //     }
  //   }
  //
  //   // mark all nodes as hard to read.
  //   for (const edgeId in allEdges) {
  //     if (allEdges.hasOwnProperty(edgeId)) {
  //       allEdges[edgeId].color = 'rgba(200,200,200,0.5)';
  //     }
  //   }
  //
  //   allEdges[selectedEdge].color = edgeDefaultColor;
  //
  //   const connectedNodes = this.visNetworkService.getConnectedNodes(this.visNetwork, selectedEdge) as any[];
  //   connectedNodes.forEach(nodeId => {
  //     allNodes[nodeId].color = nodeDefaultColor;
  //     allNodes[nodeId].label = allNodes[nodeId].hiddenLabel;
  //     allNodes[nodeId].hiddenLabel = undefined;
  //   });
  //
  //   let updateArray = [];
  //   for (const edgeId in allEdges) {
  //     if (allEdges.hasOwnProperty(edgeId)) {
  //       updateArray.push(allEdges[edgeId]);
  //     }
  //   }
  //
  //   this.edges.update(updateArray);
  //
  //   // transform the object into an array
  //   updateArray = [];
  //   for (const nodeId in allNodes) {
  //     if (allNodes.hasOwnProperty(nodeId)) {
  //       updateArray.push(allNodes[nodeId]);
  //     }
  //   }
  //   this.nodes.update(updateArray);
  // }
  //
  // private _onNetworkBlurEdge(eventData: any[]): void {
  //   this._onNetworkBlurNode([]);
  // }
  //
  //
  // private highlightConnectedNodes(selectedNode: string | IdType): void {
  //   console.log('Node selected');
  //   const allNodes = this.nodes.get({returnType: 'Object'}) as any;
  //   this.highlightActive = true;
  //   let i;
  //   let j;
  //
  //
  //   const degrees = 2;
  //
  //   // mark all nodes as hard to read.
  //   for (const nodeId in allNodes) {
  //     if (allNodes.hasOwnProperty(nodeId)) {
  //       // console.log(allNodes[nodeId]);
  //       allNodes[nodeId].color = 'rgba(200,200,200,0.5)';
  //       if (allNodes[nodeId].hiddenLabel === undefined) {
  //         allNodes[nodeId].hiddenLabel = allNodes[nodeId].label;
  //         allNodes[nodeId].label = undefined;
  //       }
  //     }
  //   }
  //
  //
  //   const connectedNodes = this.visNetworkService.getConnectedNodes(this.visNetwork, selectedNode) as any[];
  //   let allConnectedNodes = [];
  //
  //   // get the second degree nodes
  //   for (i = 1; i < degrees; i++) {
  //     for (j = 0; j < connectedNodes.length; j++) {
  //       allConnectedNodes = allConnectedNodes.concat(
  //         this.visNetworkService.getConnectedNodes(this.visNetwork, connectedNodes[j] as string)
  //       );
  //     }
  //   }
  //
  //   // all second degree nodes get a different color and their label back
  //   console.log('da', Array.from(new Set([...allConnectedNodes, ...connectedNodes])).sort());
  //   for (i = 0; i < allConnectedNodes.length; i++) {
  //     allNodes[allConnectedNodes[i]].color = 'rgba(150,150,150,0.5)';
  //     if (allNodes[allConnectedNodes[i]].hiddenLabel !== undefined) {
  //       allNodes[allConnectedNodes[i]].label =
  //         allNodes[allConnectedNodes[i]].hiddenLabel;
  //       allNodes[allConnectedNodes[i]].hiddenLabel = undefined;
  //     }
  //   }
  //
  //   // all first degree nodes get their own color and their label back
  //   console.log('od', Array.from(new Set(connectedNodes)).sort());
  //   for (i = 0; i < connectedNodes.length; i++) {
  //     allNodes[connectedNodes[i]].color = nodeDefaultColor;
  //     if (allNodes[connectedNodes[i]].hiddenLabel !== undefined) {
  //       allNodes[connectedNodes[i]].label =
  //         allNodes[connectedNodes[i]].hiddenLabel;
  //       allNodes[connectedNodes[i]].hiddenLabel = undefined;
  //     }
  //   }
  //
  //   // the main node gets its own color and its label back.
  //   allNodes[selectedNode].color = nodeDefaultColor;
  //   if (allNodes[selectedNode].hiddenLabel !== undefined) {
  //     allNodes[selectedNode].label = allNodes[selectedNode].hiddenLabel;
  //     allNodes[selectedNode].hiddenLabel = undefined;
  //   }
  //
  //   const updateArray = [];
  //   for (const nodeId in allNodes) {
  //     if (allNodes.hasOwnProperty(nodeId)) {
  //       updateArray.push(allNodes[nodeId]);
  //     }
  //   }
  //
  //   this.nodes.update(updateArray);
  // }

}
