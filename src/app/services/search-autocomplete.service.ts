import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subject, Subscription} from 'rxjs';
import {debounceTime, delay, distinctUntilChanged, map, startWith, switchMap, tap} from 'rxjs/operators';
import {SEARCH_FILTER, SearchResult} from '../models/search.model';
import {ApiService} from './api.service';

interface Cursor {
  value: number;
  timestamp: number;
}


@Injectable()
export class SearchAutocompleteService {

  private isLoading = new BehaviorSubject<boolean>(false);
  readonly isLoading$ = this.isLoading.asObservable();

  private keyboardCursor = new BehaviorSubject<Cursor>({value: -1, timestamp: 1});
  readonly keyboardCursor$ = this.keyboardCursor.asObservable().pipe(map(v => v.value));

  private hoverCursor = new BehaviorSubject<Cursor>({value: -1, timestamp: 0});
  readonly hoverCursor$ = this.hoverCursor.asObservable();

  private searchSelectedCursor = new Subject<number>();
  readonly searchSelectedCursor$ = this.searchSelectedCursor.asObservable();

  private isInFocus = new BehaviorSubject<boolean>(false);
  readonly isInFocus$ = this.isInFocus.asObservable();

  private recommendations = new BehaviorSubject<SearchResult[]>([]);
  readonly recommendations$ = this.recommendations.asObservable();

  private searchKeyword = new BehaviorSubject<string>('');
  readonly searchKeyword$ = this.searchKeyword.asObservable();

  private recommendationFilters = new BehaviorSubject<SEARCH_FILTER[]>([]);
  readonly recommendationFilters$ = this.recommendationFilters.asObservable();

  readonly cursor$ = combineLatest([this.keyboardCursor.asObservable(), this.hoverCursor.asObservable()])
    .pipe(map(([$a, $b]) => $a.timestamp > $b.timestamp ? $a.value : $b.value));


  constructor(private apiService: ApiService) {

    combineLatest([
      this.searchKeyword$,
      this.recommendationFilters$
    ]).pipe(
      startWith(['', []] as [string, SEARCH_FILTER[]]),
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.isLoading.next(true)),
      switchMap(([keyword, filters]) => this.searchOldApiAutocomplete(filters, keyword))
    ).subscribe(results => {
      this.recommendations.next(results);
      this.isLoading.next(false);
    });
  }


  /**
   * @returns a snapshot of search results
   */
  get recommendationsValue(): SearchResult[] {
    return this.recommendations.getValue();
  }

  /**
   * @deprecated use searchWithFilters
   */
  private searchOldApiAutocomplete(filters: SEARCH_FILTER[], keyword: string): Observable<SearchResult[]> {
    return this.apiService.getQuickSearchRecommendations(keyword, filters)
      // mimicking slow internet connection
      .pipe(delay(1000));
  }

  /**
   * Pushes parameters to Subjects and as a result a Search request will be performed
   * Make sure you have subscribed to searchResults$
   * @param filters array of filters to specify search
   * @param keyword the term to look for
   */
  getRecommendations(filters: SEARCH_FILTER[], keyword: string): void {
    console.log('FIRING');
    this.recommendationFilters.next(filters);
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
