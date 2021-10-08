import {Component, Input, OnInit} from '@angular/core';
import {DATASET_PAIRS} from 'src/app/models/graph.model';
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

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
  }

  requestDownloadData(studies: string[]): string {
    return this.apiService.getStudiesFilesURL(studies, 'data');
  }

  requestDownloadAnnotations(studies: string[]): string {
    return this.apiService.getStudiesFilesURL(studies, 'annotation');
  }
}
