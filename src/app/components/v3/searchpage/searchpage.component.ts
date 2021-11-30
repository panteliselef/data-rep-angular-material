import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import {SearchService} from '../../../services/search.service';
import {SEARCH_FILTER, SEARCH_FILTER_ARR, SearchResult} from '../../../models/search.model';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';

@Component({
  selector: 'app-searchpage',
  templateUrl: './searchpage.component.html',
  styleUrls: ['./searchpage.component.scss']
})
export class SearchpageComponent implements OnInit, OnDestroy {
  private routeSub: Subscription;
  searchResults$: Observable<SearchResult[]>;

  appliedFilter: SEARCH_FILTER;
  searchKeyword$: Observable<string>;

  phenotypeResults = [] as SearchResult[];
  studyResults = [] as SearchResult[];
  platformResults = [] as SearchResult[];


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private searchService: SearchService
  ) {
  }


  onQueryParamChange(paramMap: ParamMap): void {
    let q;
    let f;
    if (paramMap.has('q')) {
      q = paramMap.get('q');
    }
    if (paramMap.has('f')) {
      f = paramMap.get('f');
      if (([...SEARCH_FILTER_ARR] as string[]).includes(f)) {
        // filter is valid and can be used
        this.appliedFilter = f as SEARCH_FILTER;
      } else {
        // filter is not valid, so remove it from url
        this.updateFilterOnUrl(undefined);
      }
    } else {
      // filter is not provided
      this.appliedFilter = undefined;
    }
    if (q) {
      const filterArr = this.appliedFilter ? [this.appliedFilter] : [];
      this.searchService.searchOldApi(filterArr, q);
      this.searchService.searchOldApiAutocomplete(filterArr, q);
    }
  }


  ngOnInit(): void {

    this.searchKeyword$ = this.searchService.searchKeyword$;
    this.searchResults$ = this.searchService.searchResults$;

    this.routeSub = this.route.queryParamMap
      .pipe(
        debounceTime(100),
        distinctUntilChanged(),
      )
      .subscribe(this.onQueryParamChange.bind(this));

    this.searchService.searchResults$.subscribe((results) => {
      this.phenotypeResults = results.filter(r => r.foundIn === 'phenonet');
      this.studyResults = results.filter(r => r.categoryName);
      this.platformResults = results.filter(r => r.foundIn === 'technology');
    });

  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }

  private updateFilterOnUrl(filter: SEARCH_FILTER | undefined): Promise<boolean> {
    return this.router.navigate([],
      {
        relativeTo: this.route,
        queryParams: {
          f: filter
        },
        queryParamsHandling: 'merge'
      });
  }

  async toggleFilter(filter: SEARCH_FILTER): Promise<void> {
    if (filter === this.appliedFilter) {
      await this.removeFilter();
    } else {
      await this.updateFilterOnUrl(filter);
    }
  }

  async removeFilter(): Promise<void> {
    await this.updateFilterOnUrl(undefined);
  }
}
