import {Component, Input, OnInit} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {DATASET} from 'src/app/models/graph.model';
import {ApiService} from 'src/app/services/api.service';

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

  // TODO: Create a pipe because these functions get called continiously
  requestDownloadData(studies: string[]): string {
    console.log('a');
    return ApiService.getStudiesFilesURL(studies, 'data');
  }

  requestDownloadAnnotations(studies: string[]): string {
    console.log('v');
    return ApiService.getStudiesFilesURL(studies, 'annotation');
  }
}
