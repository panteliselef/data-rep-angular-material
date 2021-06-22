import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ConnectedNode, SelectedItemNodeInfo} from '../disease-page.component';
import {MatTableDataSource} from '@angular/material/table';
import {IdType} from 'vis';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {TableEntry} from '../../disease-network/disease-network.component';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-node-details',
  templateUrl: './node-details.component.html',
  styleUrls: ['./node-details.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class NodeDetailsComponent implements OnInit, OnChanges{
  @Input('nodeDetails') data: SelectedItemNodeInfo;

  connectedNodes: MatTableDataSource<ConnectedNode>;
  displayedColumns: string[] = ['GSE', 'Samples', 'Entity', 'Type'];
  datasets: any[];
  expandedElement: any;
  searchInputControl = new FormControl();
  constructor() { }

  ngOnInit(): void {
    // this.connectedNodes = new MatTableDataSource<ConnectedNode>(this.data.connectedNodes);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const data: SelectedItemNodeInfo  = (changes.data.currentValue as SelectedItemNodeInfo);
    this.connectedNodes = new MatTableDataSource<any>(data.connectedNodes);
    this.datasets = Array
      .from<TableEntry>(data.selectedNode.datasets as any)
      .map(({GSE, Samples, Entity, Type}) => {
        return {
          GSE,
          Samples,
          Entity,
          Type,
        };
      });
  }

  applyNodeFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.connectedNodes.filter = filterValue.trim().toLowerCase();
  }

  clearNodeFilter(): void {
    (this.connectedNodes as MatTableDataSource<ConnectedNode>).filter = '';
  }

  focusNode(nodeId: IdType) {

  }

  focusEdge(element) {

  }
}
