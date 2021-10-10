import {Component, Input, OnInit} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {DATASET} from 'src/app/models/graph.model';

@Component({
  selector: 'app-studies-table',
  templateUrl: './studies-table.component.html',
  styleUrls: ['./studies-table.component.scss']
})
export class StudiesTableComponent implements OnInit {

  @Input() studies: MatTableDataSource<DATASET>;
  studiesTableColumns: string[] = ['id', 'samples', 'entity', 'type'];

  constructor() { }

  ngOnInit(): void {
  }
}
