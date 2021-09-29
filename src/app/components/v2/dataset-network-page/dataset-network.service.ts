import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {GPLCATEGORY, GplData, GPLNODE, Technology} from 'src/app/models/gplGraph.model';
import {ApiService} from 'src/app/services/api.service';

@Injectable()
export class DatasetNetworkService {

  private graph = new BehaviorSubject<GplData>(undefined);
  private filteredGraph = new BehaviorSubject<GplData>(undefined);
  private sliderEdgeCount = new BehaviorSubject<number>(10);
  private minSliderValue = new BehaviorSubject<number>(0);
  private maxSliderValue = new BehaviorSubject<number>(1);
  private diseaseToBeHighlighted = new BehaviorSubject<string>('');

  // Exposed observable (read-only).
  readonly graph$ = this.graph.asObservable();
  readonly filteredGraph$ = this.filteredGraph.asObservable();
  readonly sliderEdgeCount$ = this.sliderEdgeCount.asObservable();
  readonly minSliderValue$ = this.minSliderValue.asObservable();
  readonly maxSliderValue$ = this.maxSliderValue.asObservable();
  readonly diseaseToBeHighlighted$ = this.diseaseToBeHighlighted.asObservable();

  constructor(
    private apiService: ApiService
  ) {

  }


  private _setGraph(graph: GplData): void {
    console.warn('setting');
    this.graph.next(graph);
    this.filteredGraph.next(graph);
    this.minSliderValue.next(10);
    this.maxSliderValue.next(graph.edges.length);
  }

  fetchNetwork(technology: Technology): void {
    console.warn('requesting');
    this.apiService.getTechnologyGraph(technology).subscribe(this._setGraph.bind(this));
  }

  private _setSlider(count: number): void {
    console.warn('setting');
    this.sliderEdgeCount.next(count);
  }

  updateDiseaseToBeHighlighted(disease: string): void {
    this.diseaseToBeHighlighted.next(disease);
  }

  updateSliderEdgeCount(count: number): void {
    this._setSlider(count);
    console.log(count);

    // TODO: Make this a separate function
    const graphInstance = this.graph.getValue();
    const finalNodesSet = new Set<string>();
    const finalCategoriesSet = new Set<string>();

    const finalEdges = graphInstance.edges.slice(0, count);
    for (const edge of finalEdges) {
      finalNodesSet.add(edge.from);
      finalNodesSet.add(edge.to);
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

    this.filteredGraph.next({
      nodes: finalNodes,
      edges: finalEdges,
      categories: finalCategories
    });
  }
}
