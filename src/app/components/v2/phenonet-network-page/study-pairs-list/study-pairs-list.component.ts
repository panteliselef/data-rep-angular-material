import {Component, Input, OnInit} from '@angular/core';
import {DATASET_PAIR} from 'src/app/models/graph.model';
import {ApiService} from 'src/app/services/api.service';
import {Router} from '@angular/router';

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

  constructor(private apiService: ApiService, private router: Router) {
  }

  ngOnInit(): void {
  }

  navigateToPlatform(studyPair: DATASET_PAIR): void {
    console.log(studyPair);
    this.apiService.getPlatformOfEdge(studyPair.dA, studyPair.dB)
      .subscribe(({platform, error}) => {
        if (error) {
          return;
        }

        this.router.navigate(['v3', 'platforms', platform, studyPair.dA], {
          queryParams: {
            edgeWith: studyPair.dB
          }
        });
      });
  }
}
