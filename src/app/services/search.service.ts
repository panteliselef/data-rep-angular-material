import { Injectable } from '@angular/core';
import {ApiService} from './api.service';
import {BehaviorSubject, Subscription} from 'rxjs';
import {SEARCH_FILTER, SearchResult} from 'src/app/models/search.model';
import {debounceTime, distinctUntilChanged, startWith, switchMap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private searchFilters = new BehaviorSubject<SEARCH_FILTER[]>(['none']);
  readonly searchFilters$ = this.searchFilters.asObservable();

  private searchResults = new BehaviorSubject<SearchResult[]>([]);
  readonly searchResults$ = this.searchResults.asObservable();


  private searchKeyword = new BehaviorSubject<string>('');
  readonly searchKeyword$ = this.searchKeyword.asObservable();

  constructor(private apiService: ApiService) {

    this.searchKeyword$.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((searchKeyword) => this.apiService.getGlobalSearchResults(searchKeyword, this.searchFilters.getValue()))
    ).subscribe(results => this.searchResults.next(results));
  }

  /**
   * @deprecated use searchWithFilters
   */
  searchWithFilter(filter: SEARCH_FILTER, keyword: string): Subscription {
    return this.apiService.getGlobalSearchResults(keyword).subscribe((results) => {
      this.searchResults.next(results);
    });
  }

  searchWithFilters(filters: SEARCH_FILTER[], keyword: string): void {
    this.searchFilters.next(filters);
    this.searchKeyword.next(keyword);
  }



}
