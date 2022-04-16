import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ApiService} from '../../../../services/api.service';
import {LoadingService} from '../../../../services/loading.service';
import {ElasticService} from '../../../../services/elastic.service';
import {ActivatedRoute, Router} from '@angular/router';
import {BehaviorSubject, combineLatest, EMPTY, Observable, Subscription} from 'rxjs';
import {debounceTime, filter, map, switchMap, tap} from 'rxjs/operators';
import {MatTableDataSource} from '@angular/material/table';
import {GplData, GPLEDGE, GPLNODE, Technology} from '../../../../models/gplGraph.model';
import groupsGPL96 from '../../../../../assets/groupColors/GPL96.json';
import groupsGPL570 from '../../../../../assets/groupColors/GPL570.json';
import {GENE} from '../../../v2/dataset-network-page/dataset-network.component';
import {PlatformPageService} from './platform-page.service';
import {toastSliding} from '../../../../shared/animations';
import {HttpErrorResponse} from '@angular/common/http';
import {Location} from '@angular/common';
import {MatPaginator} from '@angular/material/paginator';


@Component({
  selector: 'app-platform-page',
  templateUrl: './platform-page.component.html',
  styleUrls: ['./platform-page.component.scss'],
  providers: [PlatformPageService],
  animations: [
    toastSliding
  ]
})
export class PlatformPageComponent implements OnInit, AfterViewInit, OnDestroy {

  studyId: string;
  private secondStudyId: string;
  isShown = false;

  pageSize = 15;
  pageItemIndexFirst = 1;
  pageItemIndexLast = 1;
  hasPrevious = false;
  hasNext = false;

  waitingForGeneFile = false;

  private paginator: MatPaginator;

  @ViewChild(MatPaginator) set matPaginator(element: MatPaginator) {
    if (element) {
      this.paginator = element;
      this.paginator.page.subscribe((l) => {
        this.pageItemIndexFirst = 1 + l.pageIndex * this.pageSize;
        this.pageItemIndexLast = this.pageSize + l.pageIndex * this.pageSize;
        this.pageItemIndexLast = Math.min(this.pageItemIndexLast, l.length);
        this.hasPrevious = this.bestExplainingGene.paginator.hasPreviousPage();
        this.hasNext = this.bestExplainingGene.paginator.hasNextPage();
      });
    }
  }


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

  collapsible: ElementRef;

  private routeSub: Subscription;
  private queryUrlSub: Subscription;
  private technologySub: Subscription;
  private gplGraphSub: Subscription;
  private networkNameSub: Subscription;
  private edgeOrGenesSub: Subscription;
  private selectedNodeSub: Subscription;

  loadingGraphData$: Observable<boolean>;
  gplGraph$: Observable<GplData>;
  selectedNode$: Observable<GPLNODE>;
  selectedEdge$: Observable<GPLEDGE>;
  similarDatasets: MatTableDataSource<GPLEDGE>;
  tableData$: Observable<GPLEDGE[]>;

  // Use 'limitGenesSubject' and 'limitGenes$' if you need to listen to changes of 'limitGenes'
  private limitGenesSubject = new BehaviorSubject(100);
  readonly limitGenes$ = this.limitGenesSubject.asObservable();
  limitGenes = 100;
  limits: number[] = [100, 500, 1000, 2000];
  genesArray = [] as string[];

  downloadUrl = '';
  bestExplainingGene: MatTableDataSource<GENE> = new MatTableDataSource<GENE>();
  isCollapsed = false;
  groupColors: any;

  constructor(
    private location: Location,
    private platformService: PlatformPageService,
    private apiService: ApiService,
    private loadingService: LoadingService,
    private elastic: ElasticService,
    private router: Router,
    private route: ActivatedRoute) {
  }

  ngAfterViewInit(): void {
    this.bestExplainingGene.paginator = this.paginator;
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
   * Based of a node get the edges for its immediate neighbors
   * @param ofNode
   * @private
   */
  private _filterNeighbors(ofNode: GPLNODE): Observable<GPLEDGE[]> {
    return this.platformService.graph$
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
    this.networkNameSub = this.route.paramMap.pipe(map(paramMap => paramMap.get('technology')?.toUpperCase()))
      .subscribe(async (technology) => {
        this.platformService.fetchNetwork(technology.toUpperCase() as Technology)
          .subscribe(
            () => {
            },
            (error: HttpErrorResponse) => {
              if (error.status === 400) {
                this.router.navigate(['/v3/error'], {
                  queryParams: {
                    fromPage: 'platforms',
                    fromPageArg: technology
                  },
                  skipLocationChange: true
                });
              }
            }
          );
      });

    this.routeSub = this.route.paramMap.pipe(map(paramMap => paramMap.get('study')?.toUpperCase())).subscribe(id => {
      this.platformService.urlStudyId = id;
      this.studyId = id;
    });
    this.queryUrlSub = this.route.queryParamMap
      .pipe(map(queryParamMap => queryParamMap.get('edgeWith')?.toUpperCase()))
      .subscribe(id => {
        this.platformService.urlStudyIdEdgeWith = id;
        this.secondStudyId = id;
      });
    this.loadingGraphData$ = this.loadingService.loading$;
    this.gplGraph$ = this.platformService.filteredGraph$;
    this.selectedEdge$ = this.platformService.selectedEdge$;
    this.selectedNode$ = this.platformService.selectedNode$;
    this.technologySub = this.platformService.technology$.subscribe((technology) => {
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

    // Get diseases that exist in the displayed graph
    combineLatest([this.selectedNode$, this.gplGraph$])
      .pipe(
        map(([selectedNode, graph]) => [selectedNode, graph.nodes]),
        map(([selectedNode, nodes]: [GPLNODE, GPLNODE[]]) => {
          if (!selectedNode) {
            return true;
          }
          return nodes.length === 0 ? true : !!nodes.find(node => node.id === selectedNode.id);
        })
      ).subscribe((isIncluded) => {
      this.isShown = !isIncluded;
    });

    /**
     * Handling selected edge or node from url
     */
    this.gplGraphSub = this.gplGraph$.subscribe((graph) => {
      if (!graph) {
        return;
      }
      const {nodes, edges} = graph;
      const selectedNode = nodes.find(node => node.id === this.studyId) as GPLNODE;

      // url contains a node which does not exist in graph
      if (!selectedNode) {
        // display error message to user about the node not being in the graph
        this.isShown = !!this.studyId;
        return;
      }


      // checking we need to display an existing edge between two nodes
      if (selectedNode && this.secondStudyId) {
        // checking both combinations while searching
        let selectedEdge = edges.find(edge => edge.to === this.studyId && edge.from === this.secondStudyId
          || edge.from === this.studyId && edge.to === this.secondStudyId);


        if (selectedEdge) {
          // get more info about the second node
          selectedEdge = {
            ...selectedEdge,
            from: selectedNode,
            to: nodes.find(node => node.id === this.secondStudyId) as GPLNODE
          };

          this.platformService.updateSelectedEdge(selectedEdge);
          setTimeout(() => {
            this.platformService.updateEdgeToBeHighlighted({
              ...selectedEdge,
              from: this.studyId,
              to: this.secondStudyId
            });
          }, 100);
        } else {
          // redirect user because there is not a valid edge between those edges
          // use the following to replace url and show warning message instead of redirecting
          // TODO: https://stackoverflow.com/questions/35618463/change-route-params-without-reloading-in-angular-2
          // this.router.navigate(['.'], {relativeTo: this.route}).then();
          this.platformService.updateSelectedNode(selectedNode);
        }
      } else {
        this.platformService.updateSelectedNode(selectedNode);
      }
    });


    // If a limit for genes or an edge is selected request Best Explaining Genes
    this.edgeOrGenesSub = combineLatest([this.selectedEdge$, this.limitGenes$])
      .pipe(
        // simulating slow connection
        debounceTime(1000),
        switchMap(([selectedEdge, limitGenes]) => {
          if (!selectedEdge) {
            return EMPTY;
          }
          return this.apiService.getPlatformEdgeGenes(this.platformService.technologyValue, limitGenes + '', selectedEdge);
        })).subscribe((geneData) => {
        this.genesArray = geneData;
        this.bestExplainingGene = new MatTableDataSource<GENE>(geneData as GENE[]);
        this.hasNext = this.bestExplainingGene.filteredData.length > this.pageSize;
        this.pageItemIndexLast = this.bestExplainingGene.filteredData.length > this.pageSize
          ? this.pageSize
          : this.bestExplainingGene.filteredData.length;

        // paginator need to be registered after datasource has changed
        this.bestExplainingGene.paginator = this.paginator;
        if (this.bestExplainingGene.paginator) {
          this.bestExplainingGene.paginator.firstPage();
        }
      });

    // Update url on node select without triggering a route event
    this.selectedNode$.pipe(filter(node => !!node))
      .subscribe(node => {
        this.location.go(this.router.url.replace(/(\/GSE).*/, '') + '/' + node.id);
      });

    this.selectedNodeSub = this.selectedNode$.pipe(
      tap(node => typeof node !== 'undefined' && (this.studyId = node?.id)),
      switchMap(
        (node: GPLNODE) => !node ? EMPTY : this._filterNeighbors(node)
      )
    ).subscribe((neighbors) => {
      this.similarDatasets = new MatTableDataSource<GPLEDGE>(
        neighbors.sort((a, b) => a.value - b.value)
      );
      this.downloadUrl = this.requestDataFiles();
    });


    // TODO: uncomment this for later
    // this.findWhenEdgeIsVisibleBetween('GSE5327', 'GSE1456');
    // this.findWhenEdgeIsVisibleBetween();
  }

  ngOnDestroy(): void {
    // this.networkNameSub.unsubscribe();
    // this.selectedNodeSub.unsubscribe();
    // this.edgeOrGenesSub.unsubscribe();
    // this.gplGraphSub.unsubscribe();
    // this.routeSub.unsubscribe();
    // this.technologySub.unsubscribe();
    // this.limitGenesSubject.unsubscribe();
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
    this.platformService.updateDiseaseToBeHighlighted(id);
  }

  /**
   * Fetch genes based on pre-selected limitation
   */
  fetchGenes(): void {
    this.limitGenesSubject.next(this.limitGenes);
  }

  downloadGenes(): void {
    this.waitingForGeneFile = true;
    const s = this.platformService.selectedEdgeSnapshot;
    const d = `${(s.from as GPLNODE).id}-${(s.to as GPLNODE).id}-${this.limitGenes}genes.txt`;
    this.apiService.downloadGenesAsFile(this.genesArray, d).subscribe(() => this.waitingForGeneFile = false);
  }

  nextPage(): void {
    this.bestExplainingGene.paginator.nextPage();
  }

  prevPage(): void {
    this.bestExplainingGene.paginator.previousPage();
  }

}
