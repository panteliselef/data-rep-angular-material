import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {EMPTY, Observable} from 'rxjs';
import { combineLatest } from 'rxjs';
import {LoadingService} from 'src/app/services/loading.service';
import {GplData, GPLEDGE, GPLNODE, Technology} from 'src/app/models/gplGraph.model';
import {DatasetNetworkService} from './dataset-network.service';
import {ActivatedRoute, Router} from '@angular/router';
import {map, switchMap} from 'rxjs/operators';
import {MatTableDataSource} from '@angular/material/table';
import {ApiService} from 'src/app/services/api.service';
import groupsGPL570 from 'src/assets/groupColors/GPL570.json';
import groupsGPL96 from 'src/assets/groupColors/GPL96.json';

type GENE = string;
@Component({
  selector: 'app-dataset-network2',
  templateUrl: './dataset-network.component.html',
  styleUrls: [
    './dataset-network.component.scss',
    '../phenonet-network-page/phenonet-network.component.scss'
  ],
  providers: [DatasetNetworkService]
})
export class DatasetNetworkPageComponent implements OnInit {
  private studyId: string;

  /* Use ViewChild this way
   * why ?
   * this allows to get a reference of an element when is inside a block with ngIf
   */
  @ViewChild('userContent') set userContent(element) {
    if (element) {
      this.collapsible = element;
      // here you get access only when element is rendered (or destroyed)
      console.log(element);
    }
  }

  collapsible: ElementRef;

  loadingGraphData$: Observable<boolean>;
  gplGraph$: Observable<GplData>;
  selectedNode$: Observable<GPLNODE>;
  selectedEdge$: Observable<GPLEDGE>;
  networkName$: Observable<string>;
  similarDatasets: MatTableDataSource<GPLEDGE>;
  tableData$: Observable<GPLEDGE[]>;

  limitGenes = 100;
  limits: number[] = [100, 500, 1000, 2000];
  downloadUrl = '';

  bestExplainingGene: MatTableDataSource<GENE>;

  isCollapsed = false;

  groupColors: any;

  constructor(
    private datasetNetworkService: DatasetNetworkService,
    private apiService: ApiService,
    private loadingService: LoadingService,
    private router: Router,
    private route: ActivatedRoute) {
  }

  get isEdgeNodeSelected$(): Observable<GPLNODE | GPLEDGE> {
    return combineLatest([this.selectedNode$, this.selectedEdge$])
      .pipe(map(([a$, b$]) => a$ || b$));
  }

  public requestDataFiles(): string {
    console.log('heee');
    return this.apiService
      .getStudiesFilesURL(this.similarDatasets.data.map<string>(edge => edge.to as string), 'annotation');
  }

  private _filterNeighbors(ofNode: GPLNODE): Observable<GPLEDGE[]> {
    return this.datasetNetworkService.graph$
      .pipe(
        map(graph => graph.edges
          .filter(edge => edge.from === ofNode.id || edge.to === ofNode.id)
          .map( ({from, to, value}) => ({
            to: to === ofNode.id ? from : to,
            from: ofNode.id,
            value
          }))
        ),
      );
  }

  ngOnInit(): void {
    this.networkName$ = this.route.paramMap.pipe(map(paramMap => paramMap.get('technology')?.toUpperCase()));
    this.route.paramMap.pipe(map(paramMap => paramMap.get('study')?.toUpperCase())).subscribe(id => this.studyId = id);
    this.loadingGraphData$ = this.loadingService.loading$;
    this.gplGraph$ = this.datasetNetworkService.filteredGraph$;
    this.selectedEdge$ = this.datasetNetworkService.selectedEdge$;
    this.selectedNode$ = this.datasetNetworkService.selectedNode$;
    this.datasetNetworkService.technology$.subscribe((technology) => {
      if (!technology) { return; }
      switch (technology) {
        case 'GPL96': this.groupColors = groupsGPL96; break;
        case 'GPL570': this.groupColors = groupsGPL570; break;
        default: return;
      }
    });

    this.gplGraph$.subscribe((graph) => {
      if (!graph) { return; }
      const {nodes} = graph;
      const selectedNode = nodes.find( node => node.id === this.studyId);
      this.datasetNetworkService.updateSelectedNode(selectedNode);
    });

    this.selectedNode$.pipe(
      switchMap((node: GPLNODE) => {
        if (!node) { return EMPTY; }
        return this._filterNeighbors(node);
      }),
    ).subscribe((neighbors) => {
      this.similarDatasets = new MatTableDataSource<GPLEDGE>(neighbors);
      this.downloadUrl = this.requestDataFiles();
    });

    this.networkName$.subscribe(async (technology) => {
      // TODO: verify that technology exist
      if (!technology) {
        // TODO: handle behavior when technology parameter doesn't exist
        // a temporary solution is to fallback to technology GPL96
        await this.router.navigate(['GPL96'], { relativeTo: this.route });
        return;
      }
      this.datasetNetworkService.fetchNetwork(technology.toUpperCase() as Technology);
    });

    this.bestExplainingGene = new MatTableDataSource<GENE>(Array(	12).fill('ZAP70' as GENE) as GENE[]);
  }

  toggle(): void {
    if (this.isCollapsed) {
      this.collapsible.nativeElement.style.maxHeight = '300px';
    }else {
      this.collapsible.nativeElement.style.maxHeight = this.collapsible.nativeElement.scrollHeight + 'px';
    }
    this.isCollapsed = !this.isCollapsed;
  }

    highlightDisease(id: string): void {
        this.datasetNetworkService.updateDiseaseToBeHighlighted(id);
    }
}
