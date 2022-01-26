import {Component, Input, OnInit} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {PostgresStudy} from 'src/app/models/postgres.model';
import {StudyMetadata} from '../../../../services/api.service';

@Component({
  selector: 'app-studies-table',
  templateUrl: './studies-table.component.html',
  styleUrls: ['./studies-table.component.scss']
})
export class StudiesTableComponent implements OnInit {

  @Input() studies: MatTableDataSource<StudyMetadata>;
  studiesTableColumns: string[] = ['id', 'samples', 'entity', 'type'];

  constructor() { }

  ngOnInit(): void {
  }
}
