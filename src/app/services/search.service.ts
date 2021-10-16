import {Injectable} from '@angular/core';
import {ApiService} from './api.service';
import {BehaviorSubject, combineLatest, Subject, Subscription} from 'rxjs';
import {SEARCH_FILTER, SEARCH_FILTER_ARR, SearchResult} from 'src/app/models/search.model';
import {debounceTime, distinctUntilChanged, map, startWith, switchMap} from 'rxjs/operators';
import {SearchResultStudy} from '../models/postgres.model';

interface Cursor {
  value: number;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private keyboardCursor = new BehaviorSubject<Cursor>({value: -1, timestamp: 1});
  readonly keyboardCursor$ = this.keyboardCursor.asObservable().pipe(map(v => v.value));

  private hoverCursor = new BehaviorSubject<Cursor>({value: -1, timestamp: 0});
  readonly hoverCursor$ = this.hoverCursor.asObservable();

  private searchSelectedCursor = new Subject<number>();
  readonly searchSelectedCursor$ = this.searchSelectedCursor.asObservable();

  private isInFocus = new BehaviorSubject<boolean>(false);
  readonly isInFocus$ = this.isInFocus.asObservable();

  private searchFilters = new BehaviorSubject<SEARCH_FILTER[]>([]);
  readonly searchFilters$ = this.searchFilters.asObservable();

  private searchResults = new BehaviorSubject<SearchResult[]>([]);
  readonly searchResults$ = this.searchResults.asObservable();


  private searchKeyword = new BehaviorSubject<string>('');
  readonly searchKeyword$ = this.searchKeyword.asObservable();

  readonly cursor$ = combineLatest([this.keyboardCursor.asObservable(), this.hoverCursor.asObservable()])
    .pipe(map(([$a, $b]) => $a.timestamp > $b.timestamp ? $a.value : $b.value));

  constructor(private apiService: ApiService) {

    this.searchKeyword$.pipe(
      startWith('as'),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((searchKeyword) => this.apiService.getPostgresSearchResults(searchKeyword))
    ).subscribe(results => {

      const f = [
        ...(this.searchFilters.getValue().length > 0 ? this.searchFilters.getValue() : SEARCH_FILTER_ARR)
      ];

      const searchResults = [] as SearchResult[];

      if (f.includes('study')) {
        searchResults.push(...results.main_table.slice(0, 10)
          .map<SearchResult>((study) => {
            const s = study as SearchResultStudy;
            return ({name: s.studyid, foundIn: s.technologyid, categoryName: s.disease}) as SearchResult;
          }));
      }

      if (f.includes('phenotype')) {
        searchResults.push(...results.unique_disease.slice(0, 10).map<SearchResult>(disease => ({name: disease, foundIn: 'phenonet'})));
      }

      if (f.includes('technology')) {
        searchResults.push(...results.unique_technologyid.map<SearchResult>(technology => ({name: technology, foundIn: 'technology'})));
      }
      this.searchResults.next(searchResults);
    });
  }

  get cursorValue(): number {
    return this.keyboardCursor.getValue().value;
  }


  /**
   * @returns a snapshot of search results
   */
  get searchResultsValue(): SearchResult[] {
    return this.searchResults.getValue();
  }

  /**
   * @deprecated use searchWithFilters
   */
  searchWithFilter(filter: SEARCH_FILTER, keyword: string): Subscription {
    return this.apiService.getGlobalSearchResults(keyword).subscribe((results) => {
      this.searchResults.next(results);
    });
  }


  /**
   * Pushes parameters to Subjects and as a result a Search request will be performed
   * Make sure you have subscribed to searchResults$
   * @param filters array of filters to specify search
   * @param keyword the term to look for
   */
  searchWithFilters(filters: SEARCH_FILTER[], keyword: string): void {
    this.searchFilters.next(filters);
    this.searchKeyword.next(keyword);
  }


  updateKeyboardCursor(value: number): void {
    this.keyboardCursor.next({
      value,
      timestamp: Date.now()
    });
  }

  updateHoverCursor(value: number): void {
    this.hoverCursor.next({
      value,
      timestamp: Date.now()
    });
  }

  updateSelectedCursor(n: number): void {
    this.searchSelectedCursor.next(n);
  }


  updateFocus(b: boolean): void {
    this.isInFocus.next(b);
  }
}
