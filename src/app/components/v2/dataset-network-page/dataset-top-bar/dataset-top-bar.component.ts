import { Component, OnInit } from '@angular/core';
import {ApiService} from 'src/app/services/api.service';
import {Observable} from 'rxjs';
import {SEARCH_RESULT} from 'src/app/models/search.model';
import {SearchService} from 'src/app/services/search.service';

@Component({
  selector: 'app-dataset-top-bar',
  templateUrl: './dataset-top-bar.component.html',
  styleUrls: [
    './dataset-top-bar.component.scss',
    '../../../homepage-searchbar/homepage-searchbar.component.scss',
    '../../phenonet-network-page/phenonet-top-bar/phenonet-top-bar.component.scss'
  ]
})
export class DatasetTopBarComponent implements OnInit {

  searchFocused = false;
  searchBarValue = '';

  searchResults$: Observable<SEARCH_RESULT[]>;

  constructor(private apiService: ApiService, private searchService: SearchService) { }

  ngOnInit(): void {
    this.searchResults$ = this.searchService.searchResults$;
    this.searchService.searchWithFilters(['study', 'technology'], this.searchBarValue);
  }
  onSearch($event): void{
    this.searchBarValue = $event;
    this.searchService.searchWithFilters(['study', 'technology'], this.searchBarValue);
  }
}
