import {Component, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {EChartsOption} from 'echarts';
import {HttpClient} from '@angular/common/http';
import {MatSelectChange} from '@angular/material/select';
import {MatSliderChange} from '@angular/material/slider';
import {environment} from '../environments/environment';
import {VisNetworkService, Data, DataSet, Node, Options, Edge} from 'ngx-vis';
import {MatTabChangeEvent} from '@angular/material/tabs';
import FontFaceObserver from 'fontfaceobserver';

interface DATA {
  type?: string;
  nodes: [any];
  links: Array<{ source: string, target: string, value: number }>;
  edges: Array<{ from: string, to: string, value: number }>;
  categories: [any];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  currentTab = 0;
  networks: string[];
  maxSliderValue = 10;
  currSliderValue = 10;
  currNetData: DATA;

  lastSelectedNode: string;
  chartOption: EChartsOption = {
    legend: [{
      // selectedMode: 'single',
      data: []
    }],
    tooltip: {},
    series: [{
      type: 'graph',
      layout: 'force',
      draggable: true,
      symbolSize: 40,
      focusNodeAdjacency: true,
      roam: true,
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 1,
        shadowBlur: 10,
        shadowColor: 'rgba(0, 0, 0, 0.3)'
      },
      label: {
        position: 'right',
      },
      lineStyle: {
        color: 'source',
        // curveness: 0.3,
        width: 5
      },
      emphasis: {
        itemStyle: {
          borderWidth: 5,
        },
        lineStyle: {
          width: 10
        }
      },
      force: {
        edgeLength: [100, 1000],
        repulsion: 100 * 100,
        gravity: 0.2
      },
    }]
  };

  title = 'data-rep-angular-material';
  myInitOpts = {
    height: '700'
  };


  public visNetwork = 'networkId1';
  public visNetworkData: Data;
  public nodes: DataSet<Node>;
  public edges: DataSet<Edge>;
  public visNetworkOptions: Options;

  public constructor(private renderer: Renderer2, private httpService: HttpClient, private visNetworkService: VisNetworkService
  ) {
    const keyword = 'icons-material';

    const materialIcons = new FontFaceObserver('Material Icons Round');
    materialIcons.load(null, 3000)
      .then(() => this.renderer.addClass(document.body, `${keyword}-loaded`))
      .catch(() => this.renderer.addClass(document.body, `${keyword}-error`));
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
        this.visNetworkService.setOptions(this.visNetwork, { physics: {enabled: true}});
      }
    });

    this.visNetworkService.dragEnd.subscribe((eventData: any[]) => {
      if (eventData[0] === this.visNetwork) {
        this.visNetworkService.setOptions(this.visNetwork, { physics: {enabled: false}});
      }
    });

    this.visNetworkService.stabilizationIterationsDone.subscribe( (eventData: any[]) => {

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
      // const webkitDep: DATA = await this.httpService.get<DATA>("assets/demo-data.json").toPromise()

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
      height: '500px',
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
  }

  async getEchartsNetworkData($event: MatSelectChange): Promise<void> {
    const selectedNetwork = $event.value;
    const webkitDep: DATA = await this.httpService.get<DATA>(`${environment.apiUrl}echarts/${selectedNetwork}`).toPromise();
    this.currNetData = webkitDep;
    this.maxSliderValue = webkitDep.links.length;

    const finalEdges = webkitDep.links.slice(0, this.currSliderValue);

    const finalNodesSet = new Set();

    for (const edge of finalEdges) {
      finalNodesSet.add(edge.source);
      finalNodesSet.add(edge.target);
    }

    const finalNodes = Array.from(finalNodesSet).map(nodeId => {
      return webkitDep.nodes.find(node => node.name === nodeId);
    });
    this.chartOption.series[0] = {
      ...this.chartOption.series[0],

      data: finalNodes,
      categories: webkitDep.categories,
      edges: finalEdges
    };

    this.chartOption = {
      ...this.chartOption
    };

    console.log(this.chartOption);
  }


  async getVisNetworkData($event: MatSelectChange): Promise<void> {
    const selectedNetwork = $event.value;
    const webkitDep: DATA = await this.httpService.get<DATA>(`${environment.apiUrl}visjs/${selectedNetwork}`).toPromise();
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
    if (this.currentTab === 1) {

      const finalEdges = this.currNetData.links.slice(0, maxNum);
      for (const edge of finalEdges) {
        finalNodesSet.add(edge.source);
        finalNodesSet.add(edge.target);
      }

      const finalNodes = Array.from(finalNodesSet).map(nodeId => {
        return this.currNetData.nodes.find(node => node.name === nodeId);
      });
      this.chartOption.series[0] = {
        ...this.chartOption.series[0],
        // zoom: 0,
        data: finalNodes,
        categories: this.currNetData.categories,
        edges: finalEdges
      };

      this.chartOption = {
        ...this.chartOption
      };

      console.log(this.chartOption);
    }else {
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


  }

  onChartRendered($event: unknown): void {
    console.log($event);
  }


  public ngOnDestroy(): void {
    this.visNetworkService.off(this.visNetwork, 'click');
  }

  public changeTab($event: MatTabChangeEvent): void {
    this.currentTab = $event.index;
  }
}

