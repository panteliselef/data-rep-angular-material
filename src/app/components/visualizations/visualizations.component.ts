import {Component, OnDestroy, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Data, DataSet, Edge, Node, Options, VisNetworkService} from 'ngx-vis';
import {environment} from '../../../environments/environment';
import {MatSliderChange} from '@angular/material/slider';
import {MatSelectChange} from '@angular/material/select';

export interface GplData {
  type?: string;
  nodes: [any];
  links: Array<{ source: string, target: string, value: number }>;
  edges: Array<{ from: string, to: string, value: number }>;
  categories: [any];
}


@Component({
  selector: 'app-visualizations',
  templateUrl: './visualizations.component.html',
  styleUrls: ['./visualizations.component.scss']
})
export class VisualizationsComponent implements  OnInit, OnDestroy {

  currentTab = 0;
  networks: string[];
  maxSliderValue = 10;
  currSliderValue = 10;
  currNetData: GplData;

  lastSelectedNode: string;
  public visNetwork = 'networkId1';
  public visNetworkData: Data;
  public nodes: DataSet<Node>;
  public edges: DataSet<Edge>;
  public visNetworkOptions: Options;

  public constructor(private httpService: HttpClient, private visNetworkService: VisNetworkService
  ) {


  }


  public networkInitialized(): void {
    // now we can use the service to register on events
    this.visNetworkService.on(this.visNetwork, 'click');
    this.visNetworkService.on(this.visNetwork, 'hoverNode');
    this.visNetworkService.on(this.visNetwork, 'dragStart');
    this.visNetworkService.on(this.visNetwork, 'dragEnd');

    this.visNetworkService.on(this.visNetwork, 'stabilizationIterationsDone');

    this.visNetworkService.hoverNode.subscribe((eventData: any[]) => {
      if (eventData[0] === this.visNetwork) {

      }
    });

    this.visNetworkService.dragStart.subscribe((eventData: any[]) => {
      if (eventData[0] === this.visNetwork) {
        this.visNetworkService.setOptions(this.visNetwork, {physics: {enabled: true}});
      }
    });

    this.visNetworkService.dragEnd.subscribe((eventData: any[]) => {
      if (eventData[0] === this.visNetwork) {
        this.visNetworkService.setOptions(this.visNetwork, {physics: {enabled: false}});
      }
    });

    this.visNetworkService.stabilizationIterationsDone.subscribe((eventData: any[]) => {

      // this.visNetworkService.setOptions(this.visNetwork,{physics: false});


      // network.setOptions( { physics: false } );
    });

    // open your console/dev tools to see the click params
    this.visNetworkService.click.subscribe((eventData: any[]) => {
      if (eventData[0] === this.visNetwork) {
        this.lastSelectedNode = eventData[1].nodes[0];
      }
    });
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
      height: '600px',
      width: '100%',
      nodes: {
        shape: 'dot',
      },
      interaction: {
        // hover: false,
        // tooltipDelay: 200,
        hideEdgesOnDrag: true,
        hideEdgesOnZoom: true,
        // multiselect: true,
        navigationButtons: true,
        // selectable: true,
        // selectConnectedEdges:true,
      },
    };

    await this.getVisNetworkData({value: 'GPL96'});
  }

  async getVisNetworkData($event: MatSelectChange | {value: string}): Promise<void> {
    const selectedNetwork = $event.value;
    const webkitDep: GplData = await this.httpService.get<GplData>(`${environment.apiUrl}visjs/${selectedNetwork}`).toPromise();
    this.currNetData = webkitDep;
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
    this.visNetworkService.fit(this.visNetwork);
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

  public ngOnDestroy(): void {
    this.visNetworkService.off(this.visNetwork, 'click');
  }
}
