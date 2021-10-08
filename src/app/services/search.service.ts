import { Injectable } from '@angular/core';
import {ApiService} from './api.service';
import {BehaviorSubject, Subscription} from 'rxjs';
import {SEARCH_FILTER, SEARCH_RESULT} from 'src/app/models/search.model';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private searchFilter = new BehaviorSubject<SEARCH_FILTER>('none');
  readonly searchFilter$ = this.searchFilter.asObservable();

  private searchResults = new BehaviorSubject<SEARCH_RESULT[]>([]);
  readonly searchResults$ = this.searchResults.asObservable();

  constructor(private apiService: ApiService) {}


  searchWithFilter(filter: SEARCH_FILTER, keyword: string): Subscription {
    return this.apiService.getGlobalSearchResults(keyword).subscribe((results) => {
      this.searchResults.next(results);
    });
  }

  searchWithFilters(filters: SEARCH_FILTER[], keyword: string): Subscription {
    return this.apiService.getGlobalSearchResults(keyword, filters).subscribe((results) => {
      this.searchResults.next(results);
    });
  }

  searchWithSelectedFilter(): void {

  }



}
