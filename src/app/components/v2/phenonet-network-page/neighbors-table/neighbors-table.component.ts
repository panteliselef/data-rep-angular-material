import {AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {ConnectedNode} from 'src/app/models/graph.model';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {Router} from '@angular/router';
import {PhenonetPageService} from '../../../v3/phenonet-page/phenonet-page.service';
import {distinctUntilChanged, throttleTime} from 'rxjs/operators';
import {MatPaginator} from '@angular/material/paginator';

@Component({
  selector: 'app-neighbors-table',
  templateUrl: './neighbors-table.component.html',
  styleUrls: ['./neighbors-table.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class NeighborsTableComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() connectedNodes: MatTableDataSource<ConnectedNode>;
  @Input() mainDisease: string;
  expandedElement: any;

  pageSize = 10;
  pageItemIndexFirst = 1;
  pageItemIndexLast = 1;
  hasPrevious = false;
  hasNext = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private router: Router, private phenonetService: PhenonetPageService) {
  }

  ngAfterViewInit(): void {
    this.connectedNodes.paginator = this.paginator;
    this.connectedNodes.paginator.page.subscribe((l) => {
      this.pageItemIndexFirst = 1 + l.pageIndex * this.pageSize;
      this.pageItemIndexLast = this.pageSize + l.pageIndex * this.pageSize;
      this.pageItemIndexLast = Math.min(this.pageItemIndexLast, l.length);
      this.hasPrevious = this.connectedNodes.paginator.hasPreviousPage();
      this.hasNext = this.connectedNodes.paginator.hasNextPage();
    });
  }

  ngOnChanges({connectedNodes}: SimpleChanges): void {
    if (!connectedNodes) {
      return;
    }
    this.hasNext = connectedNodes.currentValue.filteredData.length > this.pageSize;
    this.pageItemIndexLast = connectedNodes.currentValue.filteredData.length > this.pageSize
      ? this.pageSize
      : connectedNodes.currentValue.filteredData.length;

    // paginator need to be registered after datasource has changed
    this.connectedNodes.paginator = this.paginator;
    if (this.connectedNodes.paginator) {
      this.connectedNodes.paginator.firstPage();
    }
  }

  ngOnInit(): void {
    this.connectedNodes.filterPredicate = (data, filter: string): boolean => {
      return data.node.toLowerCase().includes(filter);
    };

    this.phenonetService.connectedNodeFilter$
      .pipe(
        throttleTime(200),
        distinctUntilChanged(),
      )
      .subscribe(v => {
        this.connectedNodes.filter = v;
        if (this.connectedNodes.paginator) {
          this.connectedNodes.paginator.firstPage();
        }
        this.hasNext = this.connectedNodes.filteredData.length > this.pageSize;
        this.pageItemIndexFirst = 1;
        this.pageItemIndexLast = this.connectedNodes.filteredData.length > this.pageSize
          ? this.pageSize
          : this.connectedNodes.filteredData.length;
      });
  }

  openNewTab(disease: string): void {
    // Converts the route into a string that can be used
    // with the window.open() function
    const url = this.router.serializeUrl(
      this.router.createUrlTree([`/v3/phenonet/${disease}`])
    );
    window.open(url, '_blank');
  }

  nextPage(): void {
    this.connectedNodes.paginator.nextPage();
  }

  prevPage(): void {
    this.connectedNodes.paginator.previousPage();
  }
}
