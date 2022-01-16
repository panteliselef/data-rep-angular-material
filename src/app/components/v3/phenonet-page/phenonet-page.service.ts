import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {ConnectedNode, EDGE, GRAPH} from '../../../models/graph.model';
import {ApiService} from '../../../services/api.service';
import {tap} from 'rxjs/operators';

@Injectable()
export class PhenonetPageService {

  // Behavior Subjects
  private disease = new BehaviorSubject<string>('');
  private graph = new BehaviorSubject<GRAPH>(undefined);
  private filteredGraph = new BehaviorSubject<GRAPH>(undefined);
  private minEdgeFreq = new BehaviorSubject<number>(0);
  private maxEdgeFreq = new BehaviorSubject<number>(1);
  private currEdgeFreq = new BehaviorSubject<number>(0);
  private diseaseToBeHighlighted = new BehaviorSubject<string>('');
  private displayAllNodes = new BehaviorSubject<boolean>(false);
  private selectedNode = new BehaviorSubject<string>(undefined);
  private selectedEdge = new BehaviorSubject<ConnectedNode>(undefined);

  private onZoomIn = new Subject();
  private onZoomOut = new Subject();
  private resetGraph = new Subject();
  private savePNG = new Subject();


  // Exposed observable (read-only).
  readonly disease$ = this.disease.asObservable();
  readonly graph$ = this.graph.asObservable();
  readonly filteredGraph$ = this.filteredGraph.asObservable();
  readonly minEdgeFreq$ = this.minEdgeFreq.asObservable();
  readonly maxEdgeFreq$ = this.maxEdgeFreq.asObservable();
  // readonly currEdgeFreq$ = this.currEdgeFreq.asObservable();
  readonly diseaseToBeHighlighted$ = this.diseaseToBeHighlighted.asObservable();
  readonly displayAllNodes$ = this.displayAllNodes.asObservable();
  readonly selectedNode$ = this.selectedNode.asObservable();
  readonly selectedEdge$ = this.selectedEdge.asObservable();
  readonly onZoomIn$ = this.onZoomIn.asObservable();
  readonly onZoomOut$ = this.onZoomOut.asObservable();
  readonly resetGraph$ = this.resetGraph.asObservable();
  readonly savePNG$ = this.savePNG.asObservable();

  constructor(
    private apiService: ApiService,
  ) {
  }

  /**
   * Setting Graph, FilteredGraph and slider min max values
   * @param graph
   * @private
   */
  private _setGraph(graph: GRAPH): void {
    this.graph.next(graph);
    this.filteredGraph.next(graph);
    this.minEdgeFreq.next(graph.edges[graph.edges.length - 1].weight);
    this.maxEdgeFreq.next(graph.edges[0].weight);
  }

  private _setDisplayAllNodes(degree: boolean): void {
    this.displayAllNodes.next(degree);
  }

  /**
   * Setting selected slider value
   * @param count
   * @private
   */
  private _setSlider(count: number): void {
    this.currEdgeFreq.next(count);
  }

  private _filterOriginalGraph(sliderLimit: number): GRAPH {
    const graphInstance = this.graph.getValue();
    const finalNodesSet = new Set<string>();
    const finalEdges = graphInstance.edges.slice().filter((edge: EDGE) => edge.weight >= sliderLimit);
    for (const edge of finalEdges) {
      finalNodesSet.add(edge.from as string);
      finalNodesSet.add(edge.to as string);
    }
    const finalNodes = Array.from(finalNodesSet).map(nodeId => graphInstance.nodes.find(node => node.id === nodeId));
    return {
      nodes: finalNodes,
      edges: finalEdges
    };
  }

  fetchNetwork(diseaseId?: string): Observable<GRAPH> {
    if (!diseaseId) {
      return this.apiService.getPhenonet()
        .pipe(tap(graph => this._setGraph(graph)));
    }
    return this.apiService.getPhenonetDiseaseNeighborsAtDepth(diseaseId, 1)
      .pipe(tap(graph => this._setGraph(graph)));
  }


  updateDisplayAllNodes(b: boolean): void {
    this._setDisplayAllNodes(b);
  }


  updateDisease(d: string): void {
    this.disease.next(d);
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

  /**
   * Pushed updated value to subscribers
   * @param diseaseId
   */
  updateSelectedNode(diseaseId: string): void {
    this.selectedNode.next(diseaseId);
  }

  /**
   * Pushed updated value to subscribers
   * @param edge selected edge
   */
  updateSelectedEdge(edge: ConnectedNode): void {
    this.selectedEdge.next(edge);
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
  updateCurrEdgeFreq(sliderLimit: number): void {
    this._setSlider(sliderLimit);
    const filteredOriginalGraph = this._filterOriginalGraph(sliderLimit);
    this.filteredGraph.next(filteredOriginalGraph);
  }
}
