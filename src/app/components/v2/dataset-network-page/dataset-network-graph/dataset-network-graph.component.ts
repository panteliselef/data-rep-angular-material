import {
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
import {ConnectedNode} from 'src/app/models/graph.model';
import {Data, DataSet, Edge, Node, Options, VisNetworkService} from 'ngx-vis';
import {gplConfig } from 'src/util/utils';
import {ActivatedRoute} from '@angular/router';
import {GplData} from 'src/app/models/gplGraph.model';
import {DatasetNetworkService} from '../dataset-network.service';
import {Observable} from 'rxjs';
@Component({
  selector: 'app-dataset-network-graph',
  templateUrl: './dataset-network-graph.component.html',
  styleUrls: ['./dataset-network-graph.component.scss']
})
export class DatasetNetworkGraphComponent implements OnInit, OnChanges {

  graphData$: Observable<GplData>;
  @Input() sliderValue: number;
  diseaseToBeHighlighted$: Observable<string>;

  @Output() selectEdge = new EventEmitter<ConnectedNode>();
  @Output() selectNode = new EventEmitter<string>();
  @Output() filterNodes = new EventEmitter<string[]>();

  @ViewChild('networkCanvas') canvasContainer: ElementRef;

  canvas: HTMLCanvasElement;

  /* About Vis.js Network Graph */
  public visNetwork = 'networkId1';
  public visNetworkData: Data;
  private nodes: DataSet<Node>;
  private edges: DataSet<Edge>;
  public visNetworkOptions: Options;
  private highlightActive: boolean;
  private lastSelectedEdge: any;

  constructor(
    private datasetNetworkService: DatasetNetworkService,
    private visNetworkService: VisNetworkService,
    private route: ActivatedRoute
  ) {
    this.nodes = new DataSet<Node>([]);
    this.edges = new DataSet<Edge>([]);
    this.visNetworkData = {nodes: this.nodes, edges: this.edges};
  }

  ngOnInit(): void {
    this.visNetworkOptions = gplConfig;
    this.datasetNetworkService.filteredGraph$.subscribe(this.setGraphData.bind(this));
    this.diseaseToBeHighlighted$ = this.datasetNetworkService.diseaseToBeHighlighted$;
    this.diseaseToBeHighlighted$.subscribe((diseaseToBeHighlighted: string) => {
      // TODO: Highlight all nodes of the disease in graph
      console.log('Disease Highlighted: ', diseaseToBeHighlighted);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const {diseaseToBeHighlighted} = changes;
  }

  setGraphData(graph: GplData): void {
    console.log(graph);
    this.nodes.clear();
    this.nodes.add(graph.nodes);
    this.edges.clear();
    this.edges.add(graph.edges);
  }

  public networkInitialized(): void {

    // this.visNetworkService.on(this.visNetwork, 'afterDrawing');
    // this.visNetworkService.afterDrawing.subscribe((eventData: any[]) => {
    //   // const [_, ctx] = eventData;
    //   // ctx.fillStyle = 'rgb(0,255,255)';
    //   // ctx.strokeStyle = 'red';
    //   // ctx.stroke();
    //   // ctx.fillRect(-200,-200,this.canvas.width,this.canvas.height);
    //   // console.log(ctx);
    // });
    // // now we can use the service to register on events
    // this.visNetworkService.on(this.visNetwork, 'click');
    // this.visNetworkService.click.subscribe(this._onNetworkClick.bind(this));
    //
    // this.visNetworkService.on(this.visNetwork, 'selectEdge');
    // this.visNetworkService.selectEdge.subscribe(this._onNetworkSelectEdge.bind(this));
    //
    // this.visNetworkService.on(this.visNetwork, 'deselectEdge');
    // this.visNetworkService.deselectEdge.subscribe(this._onNetworkDeselectEdge.bind(this));
    //
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

