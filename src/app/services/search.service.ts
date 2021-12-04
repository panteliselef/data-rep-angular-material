import {Injectable} from '@angular/core';
import {ApiService} from './api.service';
import {BehaviorSubject, combineLatest, Observable, Subject, Subscription} from 'rxjs';
import {SEARCH_FILTER, SEARCH_FILTER_ARR, SearchResult} from 'src/app/models/search.model';
import {debounceTime, delay, distinctUntilChanged, map, startWith, switchMap} from 'rxjs/operators';
import {SearchResultStudy} from '../models/postgres.model';
import {DatabaseService} from './database.service';

interface Cursor {
  value: number;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private loadingSearchResults = new BehaviorSubject<boolean>(false);
  readonly loadingSearchResults$ = this.loadingSearchResults.asObservable();

  private loadingSearchResultsAutocomplete = new BehaviorSubject<boolean>(false);
  readonly loadingSearchResultsAutocomplete$ = this.loadingSearchResultsAutocomplete.asObservable();

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

  private searchResultsAutocomplete = new BehaviorSubject<SearchResult[]>([]);
  readonly searchResultsAutocomplete$ = this.searchResultsAutocomplete.asObservable();

  private searchKeyword = new BehaviorSubject<string>('');
  readonly searchKeyword$ = this.searchKeyword.asObservable();

  readonly cursor$ = combineLatest([this.keyboardCursor.asObservable(), this.hoverCursor.asObservable()])
    .pipe(map(([$a, $b]) => $a.timestamp > $b.timestamp ? $a.value : $b.value));

  constructor(private apiService: ApiService, private db: DatabaseService) {

    this.searchKeyword$.pipe(
      startWith('as'),
      debounceTime(300),
      distinctUntilChanged(),
      // tap(() => this.loadingSearchResults.next(true)),
      switchMap((searchKeyword) => this.db.searchKeyword(searchKeyword))
    ).subscribe(results => {

      const f = [
        ...(this.searchFilters.getValue().length > 0 ? this.searchFilters.getValue() : SEARCH_FILTER_ARR)
      ];

      const searchResults = [] as SearchResult[];

      if (f.includes('phenotype')) {
        searchResults.push(...results.unique_disease.slice(0, 10).map<SearchResult>(disease => ({
          name: disease,
          foundIn: 'phenonet'
        })));
      }

      if (f.includes('study')) {
        searchResults.push(...results.main_table.slice(0, 10)
          .map<SearchResult>((study) => {
            const s = study as SearchResultStudy;
            return ({name: s.studyid, foundIn: s.technologyid, categoryName: s.disease}) as SearchResult;
          }));
      }

      if (f.includes('technology')) {
        searchResults.push(...results.unique_technologyid.map<SearchResult>(technology => ({
          name: technology,
          foundIn: 'technology'
        })));
      }

      // this.loadingSearchResults.next(false);
      this.searchResults.next(searchResults);
    });
  }

  get cursorValue(): number {
    return this.keyboardCursor.getValue().value;
  }


  get searchKeywordValue(): string {
    return this.searchKeyword.getValue();
  }

  /**
   * @returns a snapshot of search results
   */
  get searchResultsValue(): SearchResult[] {
    return this.searchResults.getValue();
  }

  /**
   * @returns a snapshot of search results
   */
  get searchResultsAutoCompleteValue(): SearchResult[] {
    return this.searchResultsAutocomplete.getValue();
  }

  /**
   * @deprecated use searchWithFilters
   */
  searchWithFilter(filter: SEARCH_FILTER, keyword: string): Subscription {
    return this.apiService.getGlobalSearchResults(keyword).subscribe((results) => {
      this.searchResults.next(results);
    });
  }


  private _searchOldApi(filters: SEARCH_FILTER[], keyword: string): Observable<SearchResult[]> {
    this.searchKeyword.next(keyword);
    return this.apiService.getGlobalSearchResults(keyword, filters)
      .pipe(delay(1000)); // mimicking slow internet connection
  }

  /**
   * @deprecated use searchWithFilters
   */
  searchOldApi(filters: SEARCH_FILTER[], keyword: string): Subscription {
    this.loadingSearchResults.next(true);
    return this._searchOldApi(filters, keyword)
      .subscribe(results => {
        this.searchResults.next(results);
        this.loadingSearchResults.next(false);
      });
  }

  /**
   * @deprecated use searchWithFilters
   */
  searchOldApiAutocomplete(filters: SEARCH_FILTER[], keyword: string): Subscription {
    this.loadingSearchResultsAutocomplete.next(true);
    this.searchKeyword.next(keyword);
    return this.apiService.getQuickSearchRecommendations(keyword, filters)
      .pipe(delay(1000))// mimicking slow internet connection
      .subscribe(results => {
        this.searchResultsAutocomplete.next(results);
        this.loadingSearchResultsAutocomplete.next(false);
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
