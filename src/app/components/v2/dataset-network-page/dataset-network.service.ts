import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {GPLCATEGORY, GplData, GPLEDGE, GPLNODE, Technology} from 'src/app/models/gplGraph.model';
import {ApiService} from 'src/app/services/api.service';
import {PlatformEdge, PlatformNode} from 'src/app/models/elastic.model';

@Injectable()
export class DatasetNetworkService {

  private graph = new BehaviorSubject<GplData>(undefined);
  private filteredGraph = new BehaviorSubject<GplData>(undefined);
  private sliderEdgeLimit = new BehaviorSubject<number>(10);
  private minSliderValue = new BehaviorSubject<number>(0);
  private maxSliderValue = new BehaviorSubject<number>(1);
  private diseaseToBeHighlighted = new BehaviorSubject<string>('');

  private selectedNode = new BehaviorSubject<GPLNODE>(undefined);
  private selectedEdge = new BehaviorSubject<GPLEDGE>(undefined);

  private technology = new BehaviorSubject<Technology>(undefined);

  // Exposed observable (read-only).
  readonly graph$ = this.graph.asObservable();
  readonly filteredGraph$ = this.filteredGraph.asObservable();
  readonly sliderEdgeLimit$ = this.sliderEdgeLimit.asObservable();
  readonly minSliderValue$ = this.minSliderValue.asObservable();
  readonly maxSliderValue$ = this.maxSliderValue.asObservable();
  readonly diseaseToBeHighlighted$ = this.diseaseToBeHighlighted.asObservable();
  readonly selectedNode$ = this.selectedNode.asObservable();
  readonly selectedEdge$ = this.selectedEdge.asObservable();
  readonly technology$ = this.technology.asObservable();

  constructor(
    private apiService: ApiService
  ) {

  }

  updateSelectedNode(node: GPLNODE): void {
    this.selectedNode.next(node);
  }

  updateSelectedEdge(selectedEdge: GPLEDGE): void {
    // const edge = {
    //   from: (selectedEdge.from as GPLNODE)?.id || selectedEdge.from,
    //   to: (selectedEdge.to as GPLNODE)?.id || selectedEdge.to,
    //   value: selectedEdge.value
    // };
    this.selectedEdge.next(selectedEdge);
  }


  private _setGraph(graph: GplData): void {
    console.warn('setting');
    this.graph.next(graph);
    // this.updateSliderEdgeCount(10);
    this.filteredGraph.next(graph);
    this.minSliderValue.next(10);
    this.maxSliderValue.next(graph.edges.length);
  }

  fetchNetwork(technology: Technology): void {
    console.warn('requesting');
    this.technology.next(technology);
    // this.apiService.getTechnologyGraph(technology).subscribe(this._setGraph.bind(this));

    this.apiService.getTechnologyGraphElastic(technology).subscribe((edges: PlatformEdge[]) => {

      const diseaseSet = new Set<string>();
      const nodes = new Array<GPLNODE>();

      const GSESet = new Set<string>();

      for (const edge of edges) {
        const pairNodes = [edge.node1, edge.node2];
        pairNodes.forEach((node: PlatformNode) => {
          if (GSESet.has(node.data_table_id)) {
            return;
          }
          GSESet.add(node.data_table_id);
          diseaseSet.add(node.disease);
          nodes.push({
            id: node.data_table_id,
            label: node.data_table_id,
            group: node.disease
          });
        });
      }

      const gplEdges =  edges.map<GPLEDGE>((edge: PlatformEdge) => {
        return {
          from: edge.node1.data_table_id,
          to: edge.node2.data_table_id,
          value: edge.q_value
        };
      });

      const graph = {
        nodes,
        edges: gplEdges,
        categories: Array.from(diseaseSet).map<GPLCATEGORY>(disease => ({name: disease}))
      };




      this._setGraph(graph);
    });
  }

  private _setSlider(count: number): void {
    console.warn('setting');
    this.sliderEdgeLimit.next(count);
  }

  updateDiseaseToBeHighlighted(disease: string): void {
    this.diseaseToBeHighlighted.next(disease);
  }

  private _filterOriginalGraph(sliderLimit: number): GplData {
    const graphInstance = this.graph.getValue();
    const finalNodesSet = new Set<string>();
    const finalCategoriesSet = new Set<string>();

    const finalEdges = graphInstance.edges.slice(0, sliderLimit);
    for (const edge of finalEdges) {
      finalNodesSet.add(edge.from as string);
      finalNodesSet.add(edge.to as string);
    }
    const finalNodes = Array.from(finalNodesSet).map<GPLNODE>(nodeId => {
      const n = graphInstance.nodes.find(node => node.id === nodeId) as GPLNODE;
      finalCategoriesSet.add(n.group);
      return n;
    });

    const finalCategories = Array.from(finalCategoriesSet).map<GPLCATEGORY>(categoryName => {
      return {
        name: categoryName,
      };
    });

    return {
      nodes: finalNodes,
      edges: finalEdges,
      categories: finalCategories
    };
  }

  updateSliderEdgeLimit(sliderLimit: number): void {
    this._setSlider(sliderLimit);
    const filteredOriginalGraph = this._filterOriginalGraph(sliderLimit);
    this.filteredGraph.next(filteredOriginalGraph);
  }

  get technologyValue(): Technology {
    return this.technology.getValue();
  }

  get edgesValue(): GPLEDGE[] {
    return this.graph.getValue().edges;
  }
}
