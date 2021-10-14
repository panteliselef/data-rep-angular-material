import {Injectable} from '@angular/core';
import {ApiService} from 'src/app/services/api.service';
import {DiseaseEdge, DiseaseNode} from 'src/app/models/elastic.model';
import {ConnectedNode, DATASET_PAIR, EDGE, GRAPH, NODE} from 'src/app/models/graph.model';
import {BehaviorSubject, Subscription} from 'rxjs';


/**
 * A service for managing the state of phenonet-network page
 */
@Injectable()
export class PhenonetNetworkService {


  // Behavior Subjects
  private graph = new BehaviorSubject<GRAPH>(undefined);
  private filteredGraph = new BehaviorSubject<GRAPH>(undefined);
  private minEdgeFreq = new BehaviorSubject<number>(0);
  private maxEdgeFreq = new BehaviorSubject<number>(1);
  private currEdgeFreq = new BehaviorSubject<number>(0);
  private diseaseToBeHighlighted = new BehaviorSubject<string>('');
  private displayAllNodes = new BehaviorSubject<boolean>(false);
  private isDisplayAllNodesDisabled = new BehaviorSubject<boolean>(false);
  private selectedNode = new BehaviorSubject<string>(undefined);
  private selectedEdge = new BehaviorSubject<ConnectedNode>(undefined);


  // Exposed observable (read-only).
  readonly graph$ = this.graph.asObservable();
  readonly filteredGraph$ = this.filteredGraph.asObservable();
  readonly minEdgeFreq$ = this.minEdgeFreq.asObservable();
  readonly maxEdgeFreq$ = this.maxEdgeFreq.asObservable();
  readonly diseaseToBeHighlighted$ = this.diseaseToBeHighlighted.asObservable();
  readonly displayAllNodes$ = this.displayAllNodes.asObservable();
  readonly isDisplayAllNodesDisabled$ = this.isDisplayAllNodesDisabled.asObservable();
  readonly selectedNode$ = this.selectedNode.asObservable();
  readonly selectedEdge$ = this.selectedEdge.asObservable();


  constructor(
    private apiService: ApiService
  ) {
  }

  private _setDisplayAllNodes(degree: boolean): void {
    this.displayAllNodes.next(degree);
  }

  private _setDisplayAllNodesDisabled(disabled: boolean): void {
    this.isDisplayAllNodesDisabled.next(disabled);
  }

  /**
   * Setting Graph, FilteredGraph and slider min max values
   * @param graph
   * @private
   */
  private _setGraph(graph: GRAPH): void {
    console.warn('setting GRAPH');
    this.graph.next(graph);
    this.filteredGraph.next(graph);
    this.minEdgeFreq.next(graph.edges[graph.edges.length - 1].weight);
    this.maxEdgeFreq.next(graph.edges[0].weight);
  }

  private mapElasticModelToGraph(diseaseEdges: DiseaseEdge[], cb?: () => void): GRAPH {

    const diseaseSet = new Set<string>();
    const nodes = new Array<NODE>();
    for (const pair of diseaseEdges) {
      const pairNodes = [pair.node1, pair.node2];

      pairNodes.forEach((node: DiseaseNode) => {
        if (diseaseSet.has(node.disease)) {
          return;
        }
        diseaseSet.add(node.disease);
        nodes.push({
          id: node.disease,
          disease: node.disease,
          label: node.disease,
          datasets: node.corr_data_table_ids
        });
      });
    }

    const edges = diseaseEdges.map<EDGE>((source: DiseaseEdge) => {
      return {
        from: source.node1.disease,
        to: source.node2.disease,
        value: source.frequency,
        weight: source.frequency,
        datasetPairs: source.corr_data_table_conn.map<DATASET_PAIR>((pair) => {
          return {
            dA: (pair[0] as string),
            dB: (pair[1] as string),
          };
        })
      };
    })
      .sort((a: EDGE, b: EDGE) => b.weight - a.weight);

    if (cb) {
      cb();
    }

    return {
      nodes,
      edges,
      diseases: Array.from(diseaseSet)
    };
  }

  fetchNetwork(diseaseId?: string): Subscription {
    console.log('fetching', diseaseId);
    return this.apiService.getPhenonetElastic(diseaseId || '')
      .subscribe((edges: DiseaseEdge[]) => {
        const graph = this.mapElasticModelToGraph(edges);
        this._setGraph(graph);
      });
  }

  updateDisplayAllNodes(b: boolean): void {
    this._setDisplayAllNodes(b);
  }

  updateDisplayAllNodesDisabled(disabled: boolean): void {
    this._setDisplayAllNodesDisabled(disabled);
  }

  /**
   * Setting selected slider value
   * @param count
   * @private
   */
  private _setSlider(count: number): void {
    this.currEdgeFreq.next(count);
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

  /**
   * Updating selected disease that you want to highlight
   * @param disease
   */
  updateDiseaseToBeHighlighted(disease: string): void {
    this.diseaseToBeHighlighted.next(disease);
  }

  private _filterOriginalGraph(sliderLimit: number): GRAPH {
    const graphInstance = this.graph.getValue();
    const finalNodesSet = new Set<string>();
    const finalEdges = graphInstance.edges.slice().filter((edge: EDGE) => edge.weight >= sliderLimit);
    for (const edge of finalEdges) {
      finalNodesSet.add(edge.from);
      finalNodesSet.add(edge.to);
    }
    const finalNodes = Array.from(finalNodesSet).map(nodeId => graphInstance.nodes.find(node => node.id === nodeId));
    return {
      nodes: finalNodes,
      edges: finalEdges
    };
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
}
