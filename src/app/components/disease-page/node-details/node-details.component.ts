import {Component, Input, Output, OnChanges, OnInit, SimpleChanges, EventEmitter} from '@angular/core';
import {ConnectedNode} from 'src/app/models/graph.model';
import {MatTableDataSource} from '@angular/material/table';
import {IdType} from 'vis';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {TableEntry} from '../../disease-network/disease-network.component';
import {FormControl} from '@angular/forms';
import {SelectedItemNodeInfo} from '../disease-page.component';

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
  // tslint:disable-next-line:no-input-rename
  @Input('nodeDetails') data: SelectedItemNodeInfo;
  @Input('nodesInGraph') nodesInGraph: number;
  @Output() nodeFocused = new EventEmitter<any>();
  @Output() edgeFocused = new EventEmitter<{ id: string, node: IdType }>();

  connectedNodes: MatTableDataSource<ConnectedNode>;
  displayedColumns: string[] = ['GSE', 'Samples', 'Entity', 'Type'];
  datasets: any[];
  expandedElement: any;
  searchInputControl = new FormControl();
  constructor() {
    this.connectedNodes = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    // this.connectedNodes = new MatTableDataSource<ConnectedNode>(this.data.connectedNodes);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.data) { return; }
    const data: SelectedItemNodeInfo  = (changes.data.currentValue as SelectedItemNodeInfo);
    this.connectedNodes = new MatTableDataSource<any>(data.connectedNodes
        .sort((a, b) => b.weight - a.weight));

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

  focusNode(nodeId: IdType): void {
    this.nodeFocused.emit(nodeId);
  }

  focusEdge(element: ConnectedNode): void {
    const {id, node} =  element;
    console.log(element);
    this.edgeFocused.emit({id, node});
  }
}
