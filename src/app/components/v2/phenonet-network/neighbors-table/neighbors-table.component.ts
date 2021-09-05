import {Component, Input, OnInit} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {ConnectedNode} from 'src/app/models/graph.model';
import {animate, state, style, transition, trigger} from '@angular/animations';

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

  constructor() { }

  ngOnInit(): void {
  }

}
