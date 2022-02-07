import { Injectable } from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {GPLCATEGORY, GplData, GPLEDGE, GPLNODE, Technology} from 'src/app/models/gplGraph.model';
import {ApiService} from 'src/app/services/api.service';

/**
 * A service for managing the state of dataset-network page
 */
@Injectable()
export class PlatformPageService {


  // Behavior Subjects
  private graph = new BehaviorSubject<GplData>(undefined);
  private filteredGraph = new BehaviorSubject<GplData>(undefined);
  private minSliderValue = new BehaviorSubject<number>(0);
  private maxSliderValue = new BehaviorSubject<number>(10);
  private currSliderValue = new BehaviorSubject<number>(10);
  private diseaseToBeHighlighted = new BehaviorSubject<string>('');
  private selectedNode = new BehaviorSubject<GPLNODE>(undefined);
  private selectedEdge = new BehaviorSubject<GPLEDGE>(undefined);
  private technology = new BehaviorSubject<Technology>(undefined);

  private onZoomIn = new Subject();
  private onZoomOut = new Subject();
  private resetGraph = new Subject();
  private savePNG = new Subject();

  // Exposed observable (read-only).
  readonly graph$ = this.graph.asObservable();
  readonly filteredGraph$ = this.filteredGraph.asObservable();
  readonly minSliderValue$ = this.minSliderValue.asObservable();
  readonly maxSliderValue$ = this.maxSliderValue.asObservable();
  readonly currSliderValue$ = this.currSliderValue.asObservable();
  readonly diseaseToBeHighlighted$ = this.diseaseToBeHighlighted.asObservable();
  readonly selectedNode$ = this.selectedNode.asObservable();
  readonly selectedEdge$ = this.selectedEdge.asObservable();
  readonly technology$ = this.technology.asObservable();
  readonly onZoomIn$ = this.onZoomIn.asObservable();
  readonly onZoomOut$ = this.onZoomOut.asObservable();
  readonly resetGraph$ = this.resetGraph.asObservable();
  readonly savePNG$ = this.savePNG.asObservable();

  constructor(
    private apiService: ApiService,
  ) {

  }

  filterGraph(graph: GplData, sliderLimit: number): GplData {
    const graphInstance = graph;
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


  /**
   * Setting Graph, FilteredGraph and slider min max values
   * @param graph
   * @private
   */
  private _setGraph(graph: GplData): void {
    console.warn('setting');
    this.graph.next(graph);
    this.filteredGraph.next(graph);
    this.minSliderValue.next(10);
    this.currSliderValue.next(10);
    this.maxSliderValue.next(graph.edges.length);
  }

  /**
   * Set top k edges from graph and corresponding nodes as a new filtered graph
   * @param sliderLimit
   * @private
   */
  private _filterOriginalGraph(sliderLimit: number): GplData {
    const graphInstance = this.graph.getValue();
    return this.filterGraph(graphInstance, sliderLimit);
  }

  /**
   * Setting selected slider value
   * @param count
   * @private
   */
  private _setSlider(count: number): void {
    this.currSliderValue.next(count);
  }

  get graphSnapshot(): GplData {
    return this.graph.getValue();
  }

  get sliderValues(): {min: number, max: number, current: number} {
    return {
      min: this.minSliderValue.getValue(),
      max: this.maxSliderValue.getValue(),
      current: this.currSliderValue.getValue()
    };
  }

  /**
   * @returns the selected technology once
   */
  get technologyValue(): Technology {
    return this.technology.getValue();
  }

  /**
   * @returns the edges from graph once
   */
  get edgesValue(): GPLEDGE[] {
    return this.graph.getValue().edges;
  }


  /**
   * Fetch Network Data and set selected technology
   * @param technology
   */
  fetchNetwork(technology: Technology): void {
    this.technology.next(technology);
    // Uncomment this line to request from Node API
    this.apiService.getTechnologyGraph(technology).subscribe(this._setGraph.bind(this));
  }


  /**
   * Updating selected disease that you want to highlight
   * @param disease
   */
  updateDiseaseToBeHighlighted(disease: string): void {
    this.diseaseToBeHighlighted.next(disease);
  }



  /**
   * Sets selected value of slider and filters the graph for top k edges based on that value
   * @param sliderLimit
   */
  updateSliderEdgeLimit(sliderLimit: number): void {
    this._setSlider(sliderLimit);
    const filteredOriginalGraph = this._filterOriginalGraph(sliderLimit);
    this.filteredGraph.next(filteredOriginalGraph);
  }


  updateZoomIn(): void {
    this.onZoomIn.next();
  }

  updateZoomOut(): void {
    this.onZoomOut.next();
  }

  requestPNGSave(): void {
    this.savePNG.next();
  }

  requestResetGraph(): void {
    this.resetGraph.next();
  }

  resetGraphFilters(): void {
    this.updateCurrEdgeFreq(this.minSliderValue.value);
    this.updateDiseaseToBeHighlighted('');
  }

  /**
   * Sets selected value of slider and filters the graph for top k edges based on that value
   * @param sliderLimit
   */
  updateCurrEdgeFreq(sliderLimit: number): void {
    this.updateDiseaseToBeHighlighted('');
    this._setSlider(sliderLimit);
    const filteredOriginalGraph = this._filterOriginalGraph(sliderLimit);
    this.filteredGraph.next(filteredOriginalGraph);
  }


  /**
   * Pushed updated value to subscribers
   * @param node selected node
   */
  updateSelectedNode(node: GPLNODE): void {
    this.selectedNode.next(node);
  }

  /**
   * Pushed updated value to subscribers
   * @param edge selected edge
   */
  updateSelectedEdge(edge: GPLEDGE): void {
    console.log('setting');
    this.selectedEdge.next(edge);
  }
}
