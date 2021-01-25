import {Component, OnInit} from '@angular/core';
import { EChartsOption } from 'echarts';
import {HttpClient} from '@angular/common/http';
import {MatSelectChange} from '@angular/material/select';
import {MatSliderChange} from '@angular/material/slider';
import {max} from 'rxjs/operators';


interface DATA {
  type?: string;
  nodes: [any];
  links: Array<{source: string, target: string, value: number }>;
  categories: [any];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  networks: string[];
  maxSliderValue = 20;
  currSliderValue = 20;
  currNetData: DATA;

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



  constructor(private httpService: HttpClient) {


  }


  async ngOnInit(): Promise<void> {
    try{
      // const webkitDep: DATA = await this.httpService.get<DATA>("assets/demo-data.json").toPromise()

      this.networks = (await this.httpService.get<{ networks: string[] }>('http://localhost:8080/api').toPromise()).networks;

    }catch (e) {
      console.log('nah');
    }
  }

  async getNetworkData($event: MatSelectChange): Promise<void> {
    const selectedNetwork = $event.value;
    const webkitDep: DATA = await this.httpService.get<DATA>(`http://localhost:8080/api/networks/${selectedNetwork}`).toPromise();
    this.currNetData = webkitDep;
    this.maxSliderValue = webkitDep.links.length;

    const finalEdges =  webkitDep.links.slice(0, this.currSliderValue);

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



  handleSliderChange($event: MatSliderChange | number): void {

    let maxNum = 0;
    if ($event instanceof MatSliderChange) {
      maxNum = $event.value;
    }else{
      maxNum = $event;
    }

    const finalEdges = this.currNetData.links.slice(0, maxNum);

    const finalNodesSet = new Set();

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
  }

  onChartRendered($event: unknown): void {
    console.log($event);
  }
}

