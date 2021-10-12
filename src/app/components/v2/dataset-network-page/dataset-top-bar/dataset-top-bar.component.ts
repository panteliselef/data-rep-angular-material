import { Component, OnInit } from '@angular/core';
import {ApiService} from 'src/app/services/api.service';
import {Observable} from 'rxjs';
import {SearchResult} from 'src/app/models/search.model';
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

  searchResults$: Observable<SearchResult[]>;

  searchFocused = false;
  searchBarValue = '';


  constructor(private apiService: ApiService, private searchService: SearchService) { }

  ngOnInit(): void {
    // Listen to search results updates
    this.searchResults$ = this.searchService.searchResults$;
    // Request search with empty string to get default results
    this.searchService.searchWithFilters(['study', 'technology'], '');
  }

  /**
   * Search keyword with filters 'study' and 'technology'
   * @param keyword value user typed
   * TODO: Use RxJS and debounceTime to fire this event only after user has finished typing
   */
  onSearch(keyword: string): void{
    this.searchBarValue = keyword;
    this.searchService.searchWithFilters(['study', 'technology'], this.searchBarValue);
  }
}
