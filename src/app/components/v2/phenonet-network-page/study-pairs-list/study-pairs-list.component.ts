import {Component, Input, OnInit} from '@angular/core';
import {ApiService} from 'src/app/services/api.service';
import {DATASET_PAIR} from 'src/app/models/graph.model';

@Component({
  selector: 'app-study-pairs-list',
  templateUrl: './study-pairs-list.component.html',
  styleUrls: ['./study-pairs-list.component.scss']
})
export class StudyPairsListComponent implements OnInit {

  @Input() studyPairs: DATASET_PAIR[];
  @Input() parentComponentName = '';
  @Input() primaryDisease: string;
  @Input() secondaryDisease: string;

  constructor() { }

  ngOnInit(): void {
  }

  requestDownloadData(studies: string[]): string {
    console.log('h');
    return ApiService.getStudiesFilesURL(studies, 'data');
  }

  requestDownloadAnnotations(studies: string[]): string {
    console.log('b');
    return ApiService.getStudiesFilesURL(studies, 'annotation');
  }
}
