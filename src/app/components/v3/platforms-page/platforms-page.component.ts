import { Component, OnInit } from '@angular/core';
import {ApiService} from '../../../services/api.service';
import {PlatformMetadata} from '../../../models/gplGraph.model';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-platforms-page',
  templateUrl: './platforms-page.component.html',
  styleUrls: ['./platforms-page.component.scss']
})
export class PlatformsPageComponent implements OnInit {
  platforms$: Observable<PlatformMetadata[]>;

  constructor(
    private apiService: ApiService
  ) { }

  ngOnInit(): void {

    this.platforms$ = this.apiService.getPlatforms();
  }

}
