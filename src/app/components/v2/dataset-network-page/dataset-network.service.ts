import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {GPLCATEGORY, GplData, GPLEDGE, GPLNODE, Technology} from 'src/app/models/gplGraph.model';
import {ApiService} from 'src/app/services/api.service';
import {PlatformEdge, PlatformNode} from 'src/app/models/elastic.model';

/**
 * A service for managing the state of dataset-network page
 */

@Injectable()
export class DatasetNetworkService {


  // Behavior Subjects
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
    this.maxSliderValue.next(graph.edges.length);
  }

  /**
   * Set top k edges from graph and corresponding nodes as a new filtered graph
   * @param sliderLimit
   * @private
   */
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

  /**
   * Setting selected slider value
   * @param count
   * @private
   */
  private _setSlider(count: number): void {
    this.sliderEdgeLimit.next(count);
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
    // this.apiService.getTechnologyGraph(technology).subscribe(this._setGraph.bind(this));

    this.apiService.getTechnologyGraphElastic(technology).subscribe((edges: PlatformEdge[]) => {
      // TODO: make this private function
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
    this.selectedEdge.next(edge);
  }
}
