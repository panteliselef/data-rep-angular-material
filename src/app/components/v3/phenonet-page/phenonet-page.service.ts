import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {ConnectedNode, EDGE, GRAPH} from '../../../models/graph.model';
import {ApiService} from '../../../services/api.service';
import {map, tap} from 'rxjs/operators';
import {bfsAsync, loadGraphAsAdjacencyList} from './bfs';

@Injectable()
export class PhenonetPageService {

  // Behavior Subjects
  private disease = new BehaviorSubject<string>('');
  private graph = new BehaviorSubject<GRAPH>({
    nodes: [],
    edges: [],
    diseases: []
  });
  private filteredGraph = new BehaviorSubject<GRAPH>(this.graph.value);
  private minEdgeFreq = new BehaviorSubject<number>(0);
  private maxEdgeFreq = new BehaviorSubject<number>(1);
  private currEdgeFreq = new BehaviorSubject<number>(0);
  private diseaseToBeHighlighted = new BehaviorSubject<string>('');
  private displayAllNodes = new BehaviorSubject<boolean>(false);
  private isDisplayAllNodesDisabled = new BehaviorSubject<boolean>(false);
  private selectedNode = new BehaviorSubject<string>(undefined);
  private selectedEdge = new BehaviorSubject<ConnectedNode>(undefined);

  private connectedNodes = new BehaviorSubject<ConnectedNode[]>([]);
  private connectedNodeFilter = new BehaviorSubject<string>('');

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
  readonly currEdgeFreq$ = this.currEdgeFreq.asObservable();
  readonly diseaseToBeHighlighted$ = this.diseaseToBeHighlighted.asObservable();
  readonly displayAllNodes$ = this.displayAllNodes.asObservable();
  readonly isDisplayAllNodesDisabled$ = this.isDisplayAllNodesDisabled.asObservable();
  readonly selectedNode$ = this.selectedNode.asObservable();
  readonly selectedEdge$ = this.selectedEdge.asObservable();
  readonly onZoomIn$ = this.onZoomIn.asObservable();
  readonly onZoomOut$ = this.onZoomOut.asObservable();
  readonly resetGraph$ = this.resetGraph.asObservable();
  readonly savePNG$ = this.savePNG.asObservable();

  readonly connectedNodes$ = this.connectedNodes.asObservable();
  readonly connectedNodeFilter$ = this.connectedNodeFilter.asObservable();

  constructor(
    private apiService: ApiService,
  ) {

    this.filteredGraph$.pipe(
      map(graph => graph.edges
        .filter(({from, to}) => {
          return from === this.disease.value || to === this.disease.value;
        })
        .map(({from, to, ...rest}) => {
          return {
            ...rest,
            from,
            to,
            node: (from === this.disease.value ? to : from) as string,
          };
        })
        .sort((a, b) => b.weight - a.weight))).subscribe((edgesOfConnectedNodes) => {
      this.connectedNodes.next(edgesOfConnectedNodes);
    });

    this.graph$.pipe(
      map(graph => graph.edges
        .filter(({from, to}) => {
          return from === this.disease.value || to === this.disease.value;
        })
        .map(({from, to, ...rest}) => {
          return {
            ...rest,
            from,
            to,
            node: (from === this.disease.value ? to : from) as string,
          };
        })
        .sort((a, b) => b.weight - a.weight)))
      .subscribe((edgesOfConnectedNodes) => {
        if (edgesOfConnectedNodes.length === 0) {
          return;
        }
        const min = Number(edgesOfConnectedNodes[edgesOfConnectedNodes.length - 1].weight);
        const max = Number(edgesOfConnectedNodes[0].weight);

        console.log('min max', min, max)
        // const min = Number(graph.edges[graph.edges.length - 1].weight);
        // const max = Number(graph.edges[0].weight);

        let currVal = this.currEdgeFreq.getValue();
        if (this.currEdgeFreq.value > max) {
          currVal = max;
        } else if (this.currEdgeFreq.value < min) {
          currVal = min;
        }

        this.currEdgeFreq.next(currVal);


        this.minEdgeFreq.next(min);
        this.maxEdgeFreq.next(max);
      });
  }

  /**
   * Setting Graph, FilteredGraph and slider min max values
   * @param graph
   * @private
   */
  private _setGraph(graph: GRAPH): void {
    this.graph.next(graph);
    this.maxEdgeFreq.next(Number(graph.edges[0].weight));

    this._filterOriginalGraph(this.currEdgeFreq.getValue()).then(fg => this.filteredGraph.next(fg));


    // persist highlighting
    // TODO: not sure why i need this here, seems if statement always to be false
    // if (fg.diseases.includes(this.diseaseToBeHighlighted.value)) {
    //   setTimeout(() => {
    //     this.updateDiseaseToBeHighlighted(this.diseaseToBeHighlighted.value);
    //   }, 400);
    // }
    // this.minEdgeFreq.next(min);
    // this.maxEdgeFreq.next(max);
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

  private _setDisplayAllNodesDisabled(disabled: boolean): void {
    this.isDisplayAllNodesDisabled.next(disabled);
  }

  private async _filterOriginalGraph(sliderLimit: number): Promise<GRAPH> {
    console.log('ww', this.disease.value);
    const graphInstance = this.graph.getValue();
    let finalNodesSet = new Set<string>();


    let finalEdges: EDGE[];
    let finalNodes;
    finalEdges = graphInstance.edges.slice().filter((edge: EDGE) => edge.weight >= sliderLimit);
    for (const edge of finalEdges) {
      finalNodesSet.add(edge.from as string);
      finalNodesSet.add(edge.to as string);
    }
    finalNodes = Array.from(finalNodesSet).map(nodeId => graphInstance.nodes.find(node => node.id === nodeId));

    if (this.disease.value) {

      const adjacencyList = loadGraphAsAdjacencyList({
        nodes: graphInstance.nodes.map(node => node.disease),
        edges: graphInstance.edges.map(({from, to, weight}) => ({
          from: from as string,
          to: to as string,
          value: +weight
        }))
      });

      const arrayOfSets = await bfsAsync(adjacencyList, this.disease.value, 1, this.currEdgeFreq.value);
      finalNodesSet = arrayOfSets[arrayOfSets.length - 1];
      const nodeArr = [...finalNodesSet];


      // Override finalNodes & finalEdges
      finalNodes = nodeArr.map(nodeId => graphInstance.nodes.find(node => node.id === nodeId));
      finalEdges = graphInstance.edges
        .filter(({
                   from,
                   to,
                   weight
                 }) => weight >= sliderLimit && (finalNodesSet.has(from as string) && finalNodesSet.has(to as string)));
      console.log('aw', finalEdges);
    }

    return new Promise(resolve => {
      resolve({
        nodes: finalNodes,
        edges: finalEdges,
        diseases: Array.from(finalNodesSet)
      });
    });
  }

  fetchNetwork(diseaseId?: string): Observable<GRAPH> {
    if (!diseaseId) {
      return this.apiService.getPhenonet()
        .pipe(tap(graph => this._setGraph(graph)));
    }
    return this.apiService.getPhenonetDiseaseNeighborsAtDepth(diseaseId, 1)
      .pipe(tap(() => this.updateDisease(diseaseId)), tap(graph => this._setGraph(graph)));
  }


  updateDisplayAllNodesDisabled(disabled: boolean): void {
    this._setDisplayAllNodesDisabled(disabled);
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
    this.updateDiseaseToBeHighlighted('');
    this._setSlider(sliderLimit);
    this._filterOriginalGraph(sliderLimit).then(filteredOriginalGraph => this.filteredGraph.next(filteredOriginalGraph));
    // const filteredOriginalGraph = this._filterOriginalGraph(sliderLimit);
    // this.filteredGraph.next(filteredOriginalGraph);
  }

  resetGraphFilters(): void {
    this.displayAllNodes.next(false);
    this.updateCurrEdgeFreq(this.minEdgeFreq.value);
    this.updateDiseaseToBeHighlighted('');
  }

  updateConnectedNodeFilter(f: string): void {
    this.connectedNodeFilter.next(f);
  }
}
