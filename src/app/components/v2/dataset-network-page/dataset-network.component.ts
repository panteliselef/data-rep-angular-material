import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject, EMPTY, Observable, Subscription} from 'rxjs';
import {combineLatest} from 'rxjs';
import {LoadingService} from 'src/app/services/loading.service';
import {GplData, GPLEDGE, GPLNODE, Technology} from 'src/app/models/gplGraph.model';
import {DatasetNetworkService} from './dataset-network.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map, switchMap, withLatestFrom} from 'rxjs/operators';
import {MatTableDataSource} from '@angular/material/table';
import {ApiService} from 'src/app/services/api.service';
import groupsGPL570 from 'src/assets/groupColors/GPL570.json';
import groupsGPL96 from 'src/assets/groupColors/GPL96.json';
import {ElasticService} from '../../../services/elastic.service';

export type GENE = string;

@Component({
  selector: 'app-dataset-network2',
  templateUrl: './dataset-network.component.html',
  styleUrls: [
    './dataset-network.component.scss',
    '../phenonet-network-page/phenonet-network.component.scss'
  ],
  providers: [DatasetNetworkService]
})
export class DatasetNetworkPageComponent implements OnInit, OnDestroy {
  private studyId: string;

  /* Use ViewChild this way
   * why ?
   * this allows to get a reference of an element when is inside a block with ngIf
   */
  @ViewChild('userContent') set userContent(element) {
    if (element) {
      this.collapsible = element;
      // here you get access only when element is rendered (or destroyed)
    }
  }

  private routeSub: Subscription;
  private technologySub: Subscription;
  private gplGraphSub: Subscription;
  private networkNameSub: Subscription;
  private edgeOrGenesSub: Subscription;
  private selectedNodeSub: Subscription;


  collapsible: ElementRef;

  loadingGraphData$: Observable<boolean>;
  gplGraph$: Observable<GplData>;
  selectedNode$: Observable<GPLNODE>;
  selectedEdge$: Observable<GPLEDGE>;
  networkName$: Observable<string>;
  similarDatasets: MatTableDataSource<GPLEDGE>;
  tableData$: Observable<GPLEDGE[]>;

  // Use 'limitGenesSubject' and 'limitGenes$' if you need to listen to changes of 'limitGenes'
  private limitGenesSubject = new BehaviorSubject(100);
  readonly limitGenes$ = this.limitGenesSubject.asObservable();
  limitGenes = 100;
  limits: number[] = [100, 500, 1000, 2000];
  genesArray = [] as string[];


  downloadUrl = '';
  bestExplainingGene: MatTableDataSource<GENE>;
  isCollapsed = false;
  groupColors: any;

  constructor(
    private datasetNetworkService: DatasetNetworkService,
    private apiService: ApiService,
    private loadingService: LoadingService,
    private elastic: ElasticService,
    private router: Router,
    private route: ActivatedRoute) {
  }

  /**
   * @returns Observable<boolean> True if any edge or node is selected
   */
  get isEdgeNodeSelected$(): Observable<boolean> {
    return combineLatest([this.selectedNode$, this.selectedEdge$])
      .pipe(map(([a$, b$]) => typeof (a$ || b$) !== 'undefined'));
  }


  /**
   * Create url for requesting many files at once
   */
  public requestDataFiles(): string {
    return ApiService
      .getStudiesFilesURL(this.similarDatasets.data.map<string>(edge => edge.to as string), 'annotation');
  }

  /**
   * Based of an node get the edges for its immediate neighbors
   * @param ofNode
   * @private
   */
  private _filterNeighbors(ofNode: GPLNODE): Observable<GPLEDGE[]> {
    return this.datasetNetworkService.graph$
      .pipe(
        map(graph => graph.edges
          .filter(edge => edge.from === ofNode.id || edge.to === ofNode.id)
          .map(({from, to, value}) => ({
            to: to === ofNode.id ? from : to,
            from: ofNode.id,
            value
          }))
        ),
      );
  }

  /**
   * Subscribe to Observables on Init
   */
  ngOnInit(): void {
    this.networkName$ = this.route.paramMap.pipe(map(paramMap => paramMap.get('technology')?.toUpperCase()));
    this.routeSub = this.route.paramMap.pipe(map(paramMap => paramMap.get('study')?.toUpperCase())).subscribe(id => this.studyId = id);
    this.loadingGraphData$ = this.loadingService.loading$;
    this.gplGraph$ = this.datasetNetworkService.filteredGraph$;
    this.selectedEdge$ = this.datasetNetworkService.selectedEdge$;
    this.selectedNode$ = this.datasetNetworkService.selectedNode$;
    this.technologySub = this.datasetNetworkService.technology$.subscribe((technology) => {
      // TODO: complete with other colors
      if (!technology) {
        return;
      }
      switch (technology) {
        case 'GPL96':
          this.groupColors = groupsGPL96;
          break;
        case 'GPL570':
          this.groupColors = groupsGPL570;
          break;
        default:
          return;
      }
    });

    this.gplGraphSub = this.gplGraph$.subscribe((graph) => {
      if (!graph) {
        return;
      }
      const {nodes} = graph;
      const selectedNode = nodes.find(node => node.id === this.studyId);
      this.datasetNetworkService.updateSelectedNode(selectedNode);
    });


    // If a limit for genes or an edge is selected request Best Explaining Genes
    this.edgeOrGenesSub = combineLatest([this.selectedEdge$, this.limitGenes$])
      .pipe(switchMap(([selectedEdge]) => {
        if (!selectedEdge) {
          return EMPTY;
        }
        return this.elastic.getPlatformGenes(this.datasetNetworkService.technologyValue, selectedEdge);
      })).subscribe((geneData) => {
        let arr = [];
        switch (this.limitGenes) {
          case 100:
            arr = geneData.thres100;
            break;
          case 500:
            arr = geneData.thres500;
            break;
          case 1000:
            arr = geneData.thres1000;
            break;
          case 2000:
            arr = geneData.thres2000;
            break;
          default:
            break;
        }
        this.genesArray = arr;
        this.bestExplainingGene = new MatTableDataSource<GENE>(arr.slice(0, 10) as GENE[]);
      });

    this.selectedNodeSub = this.selectedNode$.pipe(
      switchMap((node: GPLNODE) => {
        if (!node) {
          return EMPTY;
        }
        return this._filterNeighbors(node);
      })
    ).subscribe((neighbors) => {
      this.similarDatasets = new MatTableDataSource<GPLEDGE>(
        neighbors.sort((a, b) => a.value - b.value)
      );
      this.downloadUrl = this.requestDataFiles();
    });

    this.networkNameSub = this.networkName$.subscribe(async (technology) => {
      // TODO: verify that technology exist
      if (!technology) {
        // TODO: handle behavior when technology parameter doesn't exist
        // a temporary solution is to fallback to technology GPL96
        await this.router.navigate(['GPL96'], {relativeTo: this.route});
        return;
      }
      this.datasetNetworkService.fetchNetwork(technology.toUpperCase() as Technology);
    });

    /**
     * @deprecated Now best Explaining genes are being fetched
     */
    // this.bestExplainingGene = new MatTableDataSource<GENE>(Array(12).fill('ZAP70' as GENE) as GENE[]);


    this.findWhenEdgeIsVisibleBetween('GSE5327', 'GSE1456');
  }

  ngOnDestroy(): void {
    this.networkNameSub.unsubscribe();
    this.selectedNodeSub.unsubscribe();
    this.edgeOrGenesSub.unsubscribe();
    this.gplGraphSub.unsubscribe();
    this.routeSub.unsubscribe();
    this.technologySub.unsubscribe();
    this.limitGenesSubject.unsubscribe();
  }

  private findWhenEdgeIsVisibleBetween(nodeId1: string, nodeId2: string): void {

    function areTheyConnected(graph: GplData): boolean {

      function getNeighbors(nodeId: string): [string] {
        return graph.edges
          .filter(edge => (edge.to === nodeId || edge.from === nodeId))
          .map(edge => nodeId === edge.to ? edge.from : edge.to) as [string];
      }

      const node1Neigh = getNeighbors(nodeId1);
      console.log(nodeId1, node1Neigh);
      const node2Neigh = getNeighbors(nodeId2);
      console.log(nodeId2, node2Neigh);
      let foundNode;
      if (node1Neigh.length > node2Neigh.length) {
        foundNode = node2Neigh.find(node => nodeId1 === node);
      } else {
        foundNode = node1Neigh.find(node => nodeId2 === node);
      }
      return !!foundNode;
    }


    this.datasetNetworkService.maxSliderValue$.pipe(withLatestFrom(this.datasetNetworkService.minSliderValue$))
      .subscribe(([max, ]) => {


        const graphSnapShot = this.datasetNetworkService.graphSnapshot;
        if (!graphSnapShot) {
          return;
        }
        const isConnected = areTheyConnected(graphSnapShot);
        if (!isConnected) {
          // TODO: the are not ever connected
          return;
        }
        console.log('Found', isConnected);


        const binarySearch = (original: number, left: number, filteredGraph: GplData): void => {

          console.log('searching in', left, original);
          const area = Math.floor((original - left) / 2);
          if (area === 0) {
            console.log('finally found at', left, original);
            return;
          }
          const fGraph = this.datasetNetworkService.filterGraph(filteredGraph, left);

          const found = areTheyConnected(fGraph);

          if (found) {
            return binarySearch(left, left - area, filteredGraph);
          } else {
            console.log('sum', left, area, left + area);
            // debugger;
            return binarySearch(original, left + area, filteredGraph);
          }

        };

        binarySearch(max, 0, graphSnapShot); // 85


      });

  }


  /**
   * Opens/Closes the collapsible
   * TODO: maybe convert this in a directive
   */
  toggle(): void {
    if (this.isCollapsed) {
      this.collapsible.nativeElement.style.maxHeight = '300px';
    } else {
      this.collapsible.nativeElement.style.maxHeight = this.collapsible.nativeElement.scrollHeight + 'px';
    }
    this.isCollapsed = !this.isCollapsed;
  }

  /**
   * Request a disease to be highlighted
   * @param id
   */
  highlightDisease(id: string): void {
    this.datasetNetworkService.updateDiseaseToBeHighlighted(id);
  }

  /**
   * Fetch genes based on pre-selected limitation
   */
  fetchGenes(): void {
    this.limitGenesSubject.next(this.limitGenes);
  }

  downloadGenes(): void {
    this.apiService.downloadGenesAsFile(this.genesArray, '').subscribe();
  }
}
