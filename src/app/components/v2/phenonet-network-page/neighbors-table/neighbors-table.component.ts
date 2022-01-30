import {Component, Input, OnInit} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {ConnectedNode} from 'src/app/models/graph.model';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {Router} from '@angular/router';
import {PhenonetPageService} from '../../../v3/phenonet-page/phenonet-page.service';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';

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
export class NeighborsTableComponent implements OnInit {

  @Input() connectedNodes: MatTableDataSource<ConnectedNode>;
  @Input() mainDisease: string;
  expandedElement: any;

  constructor(private router: Router, private phenonetService: PhenonetPageService) {
  }

  ngOnInit(): void {
    this.connectedNodes.filterPredicate = (data, filter: string): boolean => {
      return data.node.toLowerCase().includes(filter);
    };

    this.phenonetService.connectedNodeFilter$
      .pipe(
        debounceTime(100),
        distinctUntilChanged(),
      )
      .subscribe(v => {
        this.connectedNodes.filter = v;
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
}
