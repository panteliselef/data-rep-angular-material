import { Injectable } from '@angular/core';
import {ApiService} from './api.service';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {SEARCH_RESULT} from 'src/app/models/search.model';


export const SEARCH_FILTER_ARR = ['Phenotype', 'Study', 'Technology' , 'none'] as const;
export type SEARCH_FILTER = typeof SEARCH_FILTER_ARR[any];

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

  searchWithSelectedFilter(): void {

  }



}
