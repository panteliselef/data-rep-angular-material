import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ApiService} from 'src/app/services/api.service';
import {FormControl} from '@angular/forms';
import {Observable, Subscription} from 'rxjs';
import {SearchResult} from 'src/app/models/search.model';
import {SearchService} from 'src/app/services/search.service';
import {startWith} from 'rxjs/operators';
import {SearchResultUrlPipe} from 'src/app/pipes/search-result-url.pipe';
import {Router} from '@angular/router';

@Component({
  selector: 'app-phenonet-top-bar',
  templateUrl: './phenonet-top-bar.component.html',
  styleUrls: ['./phenonet-top-bar.component.scss', '../../../homepage-searchbar/homepage-searchbar.component.scss']
})
export class PhenonetTopBarComponent implements OnInit, OnDestroy {
  @Input() searchBarPhenotype: string;
  searchRecommendations$: Observable<SearchResult[]>;

  searchKeyword = new FormControl();
  searchKeyword$ = this.searchKeyword.valueChanges as Observable<string>;
  cursor$: Observable<number>;
  private isInFocus$: Observable<boolean>;
  private selectedCursorSub: Subscription;
  private searchSub: Subscription;

  constructor(
    private apiService: ApiService,
    private searchService: SearchService,
    private router: Router) { }

  ngOnInit(): void {

    this.cursor$ = this.searchService.cursor$;
    this.isInFocus$ = this.searchService.isInFocus$;
    this.selectedCursorSub = this.searchService.searchSelectedCursor$.subscribe(this._redirectToSearchResult.bind(this));

    // Listen to search results updates
    this.searchRecommendations$ = this.searchService.searchResults$;

    // Request search with empty string to get default results
    this.searchSub = this.searchKeyword$
      .pipe(startWith(''))
      .subscribe(searchKeyword => this.searchService.searchWithFilters(['phenotype'], searchKeyword));
  }

  ngOnDestroy(): void {
    this.searchSub.unsubscribe();
    this.selectedCursorSub.unsubscribe();
  }

  private _redirectToSearchResult(index: number): void {
    if (index < 0) {
      return;
    }
    this.router.navigate(
      [new SearchResultUrlPipe().transform(this.searchService.searchResultsValue[this.searchService.cursorValue])]
    ).then();
  }

  onFocusIn(): void {
    this.searchService.updateFocus(true);
  }
  onFocusOut(): void {
    this.searchService.updateFocus(false);
  }

  onSearchResultMouseOver($event: MouseEvent, indexToBeCursor: number): void {
    this.searchService.updateHoverCursor(indexToBeCursor);
  }

  removeResultMouseOver(): void {
    this.searchService.updateHoverCursor(-1);
  }
}
