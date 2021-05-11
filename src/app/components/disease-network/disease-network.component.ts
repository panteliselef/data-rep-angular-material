import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Data, DataSet, Edge, Node, Options, VisNetworkService} from 'ngx-vis';
import {environment} from '../../../environments/environment';
import {MatSelectChange} from '@angular/material/select';
import {IdType} from 'vis';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {MatSidenav} from "@angular/material/sidenav";
import {MatTableDataSource} from "@angular/material/table";


export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

// export interface TableEntry {
//   GSE: string;
//   Samples: number;
//   Entity: number;
//   Type: string;
// }

export class TableEntry {
  GSE: string;
  Samples: number;
  Entity: number;
  Type: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];

interface DATA {
  type?: string;
  nodes: [any];
  links: Array<{ source: string, target: string, value: number }>;
  edges: Array<{ from: string, to: string, value: number }>;
  categories: [any];
}

@Component({
  selector: 'app-disease-network',
  templateUrl: './disease-network.component.html',
  styleUrls: ['./disease-network.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class DiseaseNetworkComponent implements OnInit, OnDestroy {

  currentTab = 0;
  networks: string[];
  // maxSliderValue = 10;
  currSliderValue = 10;
  currNetData: DATA;
  // displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  displayedColumns: string[] = ['GSE', 'Samples', 'Entity', 'Type'];
  // dataSource = ELEMENT_DATA;
  myControl = new FormControl();

  searchInputControl = new FormControl();
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions: Observable<string[]>;

  @ViewChild('details') details: ElementRef;

  @ViewChild('sidenav') sidenav: MatSidenav;

  public visNetwork = 'networkId1';
  public visNetworkData: Data;
  public nodes: DataSet<Node>;
  public edges: DataSet<Edge>;
  public visNetworkOptions: Options;
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

  public showDetails = false;
  public detailsInfo = {
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

  private lastSelectedEdge = undefined;
  expandedElement: any;
  events: string[] = [];
  opened: boolean;

  public constructor(private httpService: HttpClient, private visNetworkService: VisNetworkService
  ) {


  }

  private highlightConnectedNodes(selectedNode: string|IdType) {
    console.log('Node selected');
    const allNodes = this.nodes.get({returnType: 'Object'}) as any;
    this.highlightActive = true;
    let i,j;


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

  private neighbourhoodHighlight(params: any): void {

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

  private resetCanvasZoomLevel(){
    this.visNetworkService.fit(this.visNetwork, {
      animation: {
        easingFunction: 'easeInOutCubic',
        duration: 500
      }
    });
  }

  public networkInitialized(): void {
    // now we can use the service to register on events
    this.visNetworkService.on(this.visNetwork, 'click');
    this.visNetworkService.on(this.visNetwork, 'hoverNode');
    // this.visNetworkService.on(this.visNetwork, 'dragStart');
    // this.visNetworkService.on(this.visNetwork, 'dragEnd');
    //
    this.visNetworkService.on(this.visNetwork, 'stabilizationIterationsDone');
    this.visNetworkService.on(this.visNetwork, 'stabilized');
    this.visNetworkService.stabilized.subscribe(() => {
      this.resetCanvasZoomLevel()
    })

    //
    // this.visNetworkService.hoverNode.subscribe((eventData: any[]) => {
    //   if (eventData[0] === this.visNetwork) {
    //     console.log(eventData[1].nodes[0]);
    //   }
    // });
    //
    // this.visNetworkService.dragStart.subscribe((eventData: any[]) => {
    //   if (eventData[0] === this.visNetwork) {
    //     this.visNetworkService.setOptions(this.visNetwork, {physics: {enabled: true}});
    //   }
    // });
    //
    // this.visNetworkService.dragEnd.subscribe((eventData: any[]) => {
    //   if (eventData[0] === this.visNetwork) {
    //     this.visNetworkService.setOptions(this.visNetwork, {physics: {enabled: false}});
    //   }
    // });

    this.visNetworkService.stabilizationIterationsDone.subscribe((eventData: any[]) => {

      // this.visNetworkService.setOptions(this.visNetwork,{physics: false});


      // network.setOptions( { physics: false } );
    });


    // open your console/dev tools to see the click params
    this.visNetworkService.click.subscribe((eventData: any[]) => {
      console.log(eventData);

      // console.log(eventData[1].nodes[0]);
      this.neighbourhoodHighlight(eventData[1]);

      if (eventData[0] === this.visNetwork) {
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

        if(eventData[1].nodes.length == 0) {
          this.myControl.setValue('');
        }

        if (eventData[1].nodes.length > 0 || eventData[1].edges.length > 0) {


          if (eventData[1].nodes[0]) {
            const name = eventData[1].nodes[0];
            this.selectNode(name);

          } else if (eventData[1].edges[0]) {
            // this.showDetails = true;
            this.sidenav.open()
            const allEdges = this.edges.get({returnType: 'Object'}) as any;
            const selectedEdge = allEdges[eventData[1].edges[0]];
            this.detailsInfo.edgeFrom = selectedEdge.from;
            this.detailsInfo.edgeTo = selectedEdge.to;
            console.log(selectedEdge);
            this.detailsInfo.edgeWeight = selectedEdge.weight;
            this.detailsInfo.datasetPairs = selectedEdge.datasetPairs;
            this.detailsInfo.type = 'edge';
          }
        } else {
          this.showDetails = false;
          this.sidenav.close()
        }
      }
    });
  }

  private getConnectedNodesAndTheirEdges(nodeId: IdType): any[] {
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

  focusEdge({id: edgeId, node}: { id: string, node: IdType }): void {
    this.focusNode(node);
    this.visNetworkService.setSelection(this.visNetwork, {
      nodes: [],
      edges: [edgeId]
    }, {
      unselectAll: true,
      highlightEdges: true
    });
    console.log({edgeId, node});
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }


  async ngOnInit(): Promise<void> {


    try {
      this.networks = (await this.httpService.get<{ networks: string[] }>(environment.apiUrl).toPromise()).networks;
    } catch (e) {
      console.log('nah');
    }


    this.nodes = new DataSet<Node>([
      {id: '1', label: 'Node 1'},
      {id: '2', label: 'Node 2'},
      {id: '3', label: 'Node 3'},
      {id: '4', label: 'Node 4'},
      {id: '5', label: 'Node 5', title: 'Title of Node 5'}
    ]);
    this.edges = new DataSet<Edge>([
      {from: '1', to: '2'},
      {from: '1', to: '3'},
      {from: '2', to: '4'},
      {from: '2', to: '5'}
    ]);
    this.visNetworkData = {nodes: this.nodes, edges: this.edges};

    this.visNetworkOptions = {
      height: '100%',
      width: '100%',
      autoResize: true,
      nodes: {
        shape: 'dot',
        color: this.nodeDefaultColor,
        font: {
          face: 'roboto',
        }
      },
      edges: {
        color: this.edgeDefaultColor,
        hoverWidth: 7,
        selectionWidth: 17,
        scaling: {
          min: 2,
          max: 17,
        },
        smooth: false,
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
        // tooltipDelay: 200,
        hideEdgesOnDrag: true,
        hideEdgesOnZoom: true,
        // multiselect: true,
        navigationButtons: true,
        // selectable: true,
        // selectConnectedEdges:true,
      },
      physics: {
        stabilization: {
          enabled: true,
          iterations: 50,
        },
        maxVelocity: 50,
        minVelocity: 15,
        solver: 'forceAtlas2Based',
        forceAtlas2Based: {
          gravitationalConstant: -800,
          centralGravity: 0.1,
        },
      }

    };

    await this.getVisNetworkData({value: 'GPL96'});
    this.options = this.nodes.getIds() as string[];
    this.filteredOptions = this.myControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );

    // setTimeout(()=>{
    //   this.selectNode('sepsis');
    // },1000)
  }

  async getVisNetworkData($event: MatSelectChange | { value: string }): Promise<void> {
    const selectedNetwork = $event.value;
    const webkitDep: DATA = await this.httpService.get<DATA>(`${environment.apiUrl}visjs/phenonet`).toPromise();

    console.log('ADA', webkitDep);
    this.currNetData = webkitDep;
    this.nodes.clear();
    if (webkitDep.nodes) {
      this.nodes.add(webkitDep.nodes);
    }
    this.edges.clear();
    if (webkitDep.edges) {
      this.edges.add(webkitDep.edges);
    }

  }

  applyNodeFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.detailsInfo.connectedNodes.filter = filterValue.trim().toLowerCase();
  }

  clearNodeFilter() {
    (this.detailsInfo.connectedNodes as MatTableDataSource<any>).filter = '';
  }

  public ngOnDestroy(): void {
    this.visNetworkService.off(this.visNetwork, 'click');
  }

  selectNode($event: MatAutocompleteSelectedEvent| string ) {

    const nodeId = $event instanceof MatAutocompleteSelectedEvent ? $event.option.value : $event;

    this.sidenav.open()
    this.myControl.setValue(nodeId);
    this.highlightConnectedNodes(nodeId);
    this.showDetails = true;
    this.focusNode(nodeId);
    this.detailsInfo.name = nodeId;
    this.detailsInfo.type = 'node';
    this.detailsInfo.connectedNodes = new MatTableDataSource(this.getConnectedNodesAndTheirEdges(nodeId));
    // console.log(this.detailsInfo.connectedNodes);
    this.detailsInfo.datasets = Array
      .from<TableEntry>((this.nodes.get({returnType: 'Object'})[this.detailsInfo.name] as any).datasets)
      .map(({GSE, Samples, Entity, Type}) => {
        return {
          GSE,
          Samples,
          Entity,
          Type,
        };
      });
    // console.log(this.detailsInfo.datasets);
  }

  async closeSidenav() {
    await this.sidenav.close()
    this.neighbourhoodHighlight(null);
    this.visNetworkService.unselectAll(this.visNetwork);
    this.myControl.setValue('');
    this.resetCanvasZoomLevel();
  }
}
