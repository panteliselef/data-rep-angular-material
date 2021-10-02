import {Component, OnDestroy, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Data, DataSet, Edge, Node, Options, VisNetworkService} from 'ngx-vis';
import {environment} from 'src/environments/environment';
import {MatSelectChange} from '@angular/material/select';
import {GplData} from 'src/app/models/gplGraph.model';
import {ActivatedRoute, Params} from '@angular/router';
import {IdType} from 'vis';
import {map, startWith} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {FormControl} from '@angular/forms';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatSliderChange} from '@angular/material/slider';

interface GplNode {
  group: number;
  id: string;
  label: string;
}

interface GplEdge {
  from: string;
  id: string;
  to: string;
}

@Component({
  selector: 'app-dataset-network',
  templateUrl: './dataset-network.component.html',
  styleUrls: ['./dataset-network.component.scss']
})
export class DatasetNetworkComponent implements OnInit, OnDestroy {

  currentTab = 0;
  networks: string[];
  maxSliderValue = 10;
  currSliderValue = 10;
  currNetData: GplData;
  myControl = new FormControl();

  options: string[] = ['One', 'Two', 'Three'];

  filteredOptions: Observable<string[]>;

  lastSelectedNode: string;
  visNetwork = 'networkId1';
  visNetworkData: Data;
  nodes: DataSet<Node>;
  edges: DataSet<Edge>;
  visNetworkOptions: Options;
  lastSelectedItem: { type: string, value: GplNode | GplEdge[] };
  private highlightActive = false;
  private lastSelectedEdge: any;
  networkId: string;

  private edgeDefaultColor = {
    highlight: '#1E352F',
    color: 'rgba(150,150,150,0.5)',
    hover: '#1E352F',
    opacity: .5,
  };

  public constructor(private route: ActivatedRoute, private httpService: HttpClient, private visNetworkService: VisNetworkService
  ) {
  }


  public networkInitialized(): void {
    // now we can use the service to register on events
    this.visNetworkService.on(this.visNetwork, 'click');
    this.visNetworkService.on(this.visNetwork, 'hoverNode');

    this.visNetworkService.on(this.visNetwork, 'blurNode');

    this.visNetworkService.on(this.visNetwork, 'dragStart');
    this.visNetworkService.on(this.visNetwork, 'dragEnd');

    this.visNetworkService.on(this.visNetwork, 'stabilizationIterationsDone');

    // this.visNetworkService.blurNode.subscribe((eventData: any[]) => {
    //   if (eventData[0] === this.visNetwork) {
    //     this._neighbourhoodHighlight({
    //       nodes: [],
    //       edges: []
    //     });
    //   }
    // });
    // this.visNetworkService.hoverNode.subscribe((eventData: any[]) => {
    //   if (eventData[0] === this.visNetwork) {
    //     console.log(eventData);
    //     const [networkId, hoverData] = eventData;
    //     this._neighbourhoodHighlight({
    //       nodes: [hoverData.node],
    //       edges: []
    //     });
    //   }
    // });

    this.visNetworkService.dragStart.subscribe((eventData: any[]) => {
      if (eventData[0] === this.visNetwork) {
        // this.visNetworkService.setOptions(this.visNetwork, {physics: {enabled: true}});
      }
    });

    this.visNetworkService.dragEnd.subscribe((eventData: any[]) => {
      if (eventData[0] === this.visNetwork) {
        // this.visNetworkService.setOptions(this.visNetwork, {physics: {enabled: false}});
      }
    });

    this.visNetworkService.stabilizationIterationsDone.subscribe((eventData: any[]) => {

      // this.visNetworkService.setOptions(this.visNetwork,{physics: false});


      // network.setOptions( { physics: false } );
    });

    this.visNetworkService.click.subscribe(this._onNetworkClick.bind(this));
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
      allNodes[connectedNodes[i]].color = undefined;
      if (allNodes[connectedNodes[i]].hiddenLabel !== undefined) {
        allNodes[connectedNodes[i]].label =
          allNodes[connectedNodes[i]].hiddenLabel;
        allNodes[connectedNodes[i]].hiddenLabel = undefined;
      }
    }

    // the main node gets its own color and its label back.
    allNodes[selectedNode].color = undefined;
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

    console.log('dada');
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
          allEdges[edgeId].color = this.edgeDefaultColor;
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

      allEdges[selectedEdge].color = {
        inherit: true,
      };

      const connectedNodes = this.visNetworkService.getConnectedNodes(this.visNetwork, selectedEdge) as any[];
      connectedNodes.forEach(nodeId => {
        allNodes[nodeId].color = undefined;
        allNodes[nodeId].label = allNodes[nodeId].hiddenLabel;
        allNodes[nodeId].hiddenLabel = undefined;
      });

    } else if (params?.nodes?.length > 0) {
      this.highlightConnectedNodes(params.nodes[0]);
      return;
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
    console.log(eventData);
    const [networkId, clickData] = eventData;

    if (networkId !== this.visNetwork) {
      return;
    }

    this._neighbourhoodHighlight(clickData);

    if (clickData.nodes.length <= 0 && clickData.edges.length <= 0) {
      this.lastSelectedItem = null;
      return;
    }

    if (clickData.nodes[0]) {
      console.log(this.nodes.get({returnType: 'Object'})[clickData.nodes[0]]);
      this.lastSelectedItem = {
        type: 'node',
        value: this.nodes.get({returnType: 'Object'})[clickData.nodes[0]] as any
      };

    } else if (clickData.edges[0]) {

      this.lastSelectedItem = {
        type: 'edge',
        value: Object.entries(this.edges.get({returnType: 'Object'})[clickData.edges[0]] as any)
          .filter(([key, value]) => ['from', 'to'].includes(key))
          .map(([key, value]) => value)
          .map((nodeId: string) => {
            return this.nodes.get({returnType: 'Object'})[nodeId] as any;
          })
      };
    }
  }

  async onParamsChange(params: Params): Promise<void> {
    this.networkId = params?.networkId || 'GPL96';
    await this.getVisNetworkData({value: params?.networkId || 'GPL96'});
    this.options = this.currNetData.categories.map(({name}) => name);
    this.filteredOptions = this.myControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }


  ngOnInit(): void {
    this.route.params.subscribe(this.onParamsChange.bind(this));


    this.lastSelectedItem = null;
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
      height: '680px',
      width: '100%',
      layout: {
        randomSeed: 12,
        hierarchical: false,
        improvedLayout: true,
      },
      nodes: {
        shape: 'dot',
        font: {
          face: 'roboto',
          size: 22
        },
      },
      edges: {
        color: this.edgeDefaultColor,
        hoverWidth: 7,
        selectionWidth: 17,
        scaling: {
          min: 4,
          max: 17,
        },
        smooth: false,
      },
      physics: {
        enabled: true,
        minVelocity: 15,
        solver: 'forceAtlas2Based',
        maxVelocity: 50,
        forceAtlas2Based: {
          gravitationalConstant: -500,
          centralGravity: 0.05,
          avoidOverlap: 0
        },
        stabilization: {
          enabled: true,
          iterations: 1,
          fit: true
        },
      },
      interaction: {
        hover: true,
        // tooltipDelay: 200,
        hideEdgesOnDrag: true,
        hideEdgesOnZoom: true,
        // multiselect: true,
        // navigationButtons: true,
        // selectable: true,
        // selectConnectedEdges:true,
      },
    };
  }

  async getVisNetworkData($event: MatSelectChange | { value: string }): Promise<void> {
    const selectedNetwork = $event.value;
    const webkitDep: GplData = await this.httpService.get<GplData>(`${environment.apiUrl}visjs/${selectedNetwork}`).toPromise();
    this.currNetData = webkitDep;
    console.log(webkitDep);

    this.maxSliderValue = webkitDep.edges.length;

    const finalEdges = webkitDep.edges.slice(0, this.currSliderValue);


    const finalNodesSet = new Set();

    for (const edge of finalEdges) {
      finalNodesSet.add(edge.from);
      finalNodesSet.add(edge.to);
    }

    const finalNodes = Array.from(finalNodesSet).map(nodeId => {
      return webkitDep.nodes.find(node => node.id === nodeId);
    });

    console.log(finalEdges);

    this.nodes.clear();
    this.nodes.add(finalNodes);
    this.edges.clear();
    this.edges.add(finalEdges);
    // this.visNetworkService.fit(this.visNetwork);
  }

  public ngOnDestroy(): void {
    this.visNetworkService.off(this.visNetwork, 'click');
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
          allEdges[edgeId].color = this.edgeDefaultColor;
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

  handleSliderChange($event: MatSliderChange | number): void {
    let maxNum: number;
    if ($event instanceof MatSliderChange) {
      maxNum = $event.value;
    } else {
      maxNum = $event;
    }


    const finalNodesSet = new Set();

    const finalEdges = this.currNetData.edges.slice(0, maxNum);
    for (const edge of finalEdges) {
      finalNodesSet.add(edge.from);
      finalNodesSet.add(edge.to);
    }

    const finalNodes = Array.from(finalNodesSet).map(nodeId => {
      return this.currNetData.nodes.find(node => node.id === nodeId);
    });

    this.nodes.clear();
    this.nodes.add(finalNodes);
    this.edges.clear();
    this.edges.add(finalEdges);
    this.visNetworkService.fit(this.visNetwork);
  }

  selectNodesByDisease($event: MatAutocompleteSelectedEvent | string): void {
    const diseaseName = $event instanceof MatAutocompleteSelectedEvent ? $event.option.value : $event;
    this._highlightByDisease(diseaseName);

  }
}
