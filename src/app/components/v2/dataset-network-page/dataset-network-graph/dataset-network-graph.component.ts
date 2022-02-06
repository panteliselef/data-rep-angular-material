import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {DataSet, Edge, Node, Options, VisNetworkService} from 'ngx-vis';
import { gplConfig, gplEdgeColor} from 'src/util/utils';
import {GPLEDGE, GPLNODE} from 'src/app/models/gplGraph.model';
import {Observable, Subscription} from 'rxjs';
import groupsGPL570 from 'src/assets/groupColors/GPL570.json';
import groupsGPL96 from 'src/assets/groupColors/GPL96.json';
import {GraphComponentComponent} from '../../graph-component/graph-component.component';
import {PlatformPageService} from '../../../v3/platforms-page/platform-page/platform-page.service';

@Component({
  selector: 'app-dataset-network-graph',
  templateUrl: './dataset-network-graph.component.html',
  styleUrls: ['./dataset-network-graph.component.scss']
})
export class DatasetNetworkGraphComponent extends GraphComponentComponent implements OnInit, AfterViewInit, OnDestroy {
  diseaseToBeHighlighted$: Observable<string>;

  @ViewChild('networkCanvas') canvasContainer: ElementRef;

  /* About Vis.js Network Graph */
  public visNetwork = 'dataset'; // Do not change this value
  public visNetworkOptions: Options;
  private diseaseToBeHighlightedSub: Subscription;
  private filteredGraphSub: Subscription;
  private selectedNodeSub: Subscription;

  constructor(
    private platformService: PlatformPageService,
    public visNetworkService: VisNetworkService
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
    super.ngOnInit();
    this.visNetworkOptions = gplConfig;

    this.platformService.technology$.subscribe((technology) => {
      if (!technology) { return; }
      switch (technology) {
        case 'GPL96': gplConfig.groups = groupsGPL96; break;
        case 'GPL570': gplConfig.groups = groupsGPL570; break;
        default:
          this.visNetworkOptions = gplConfig;
          return;
      }

    });

    this.filteredGraphSub = this.platformService.filteredGraph$.subscribe(this.setGraphData.bind(this));
    this.diseaseToBeHighlighted$ = this.platformService.diseaseToBeHighlighted$;
    this.diseaseToBeHighlightedSub = this.diseaseToBeHighlighted$.subscribe((diseaseToBeHighlighted: string) => {
      if (!diseaseToBeHighlighted) { return; }
      this._highlightByDisease(diseaseToBeHighlighted);
      console.log('Disease Highlighted: ', diseaseToBeHighlighted);
    });

    this.selectedNodeSub = this.platformService.selectedNode$.subscribe((selectedNode: GPLNODE) => {
      if (!selectedNode) { return; }
      setTimeout(() => this._focusNode(selectedNode.id), 300);
    });

    this.selectedEdge$
      .subscribe(edge => this.platformService.updateSelectedEdge(edge as GPLEDGE));
    this.selectedNode$
      .subscribe(node => this.platformService.updateSelectedNode(node as GPLNODE));

    this.platformService.onZoomIn$.subscribe(this.zoomIn.bind(this));
    this.platformService.onZoomOut$.subscribe(this.zoomOut.bind(this));
    this.platformService.resetGraph$.subscribe(this.fitAllNodes.bind(this));
    this.platformService.savePNG$.subscribe(this.savePNG.bind(this));
  }

  ngOnDestroy(): void{
    super.ngOnDestroy();
    this.diseaseToBeHighlightedSub.unsubscribe();
    this.filteredGraphSub.unsubscribe();
    this.selectedNodeSub.unsubscribe();
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
}

