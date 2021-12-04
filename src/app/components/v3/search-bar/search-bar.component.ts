import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {Router} from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import {SEARCH_FILTER, SEARCH_FILTER_ARR, SearchResult} from 'src/app/models/search.model';
import {SearchResultUrlPipe} from 'src/app/pipes/search-result-url.pipe';
import {SearchAutocompleteService} from '../../../services/search-autocomplete.service';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput', {static: false}) searchInput: ElementRef<HTMLInputElement>;

  searchResults$: Observable<SearchResult[]>;

  searchValue = '';
  savedSearchValue = '';
  isToolbarSearchFocused = false;
  cursor$: Observable<number>;


  /*
    Variables for filtering options
   */
  readonly searchFiltersAvailable = SEARCH_FILTER_ARR;
  searchFiltersInUse = [] as SEARCH_FILTER[];

  private focusSub: Subscription;
  private cursorSub: Subscription;
  private selectedCursorSub: Subscription;

  loadingSearchResults$: Observable<boolean>;

  constructor(private autocompleteService: SearchAutocompleteService,
              private eRef: ElementRef,
              private router: Router) {
  }

  @HostListener('document:click', ['$event'])
  clickOut(event): void {
    this.autocompleteService.updateKeyboardCursor(-1);

    /**
     * Making sure that if user clicks inside the component, the component will not lose focus
     */
    const componentChildren = Array.from<HTMLElement>(this.eRef.nativeElement.firstChild.children);
    const isChildArray = componentChildren.map(child => child.contains(event.target));
    this.isToolbarSearchFocused = isChildArray.includes(true);
  }

  private _redirectToSearchResult(index: number): void {
    if (index < 0) {
      this.redirectToSearchPage(this.searchValue);
    } else {
      this.router.navigate(
        [new SearchResultUrlPipe().transform(this.autocompleteService.recommendationsValue[index])]
      ).then();
    }
  }

  ngOnInit(): void {
    this.autocompleteService.searchKeyword$.subscribe(keyword => this.savedSearchValue = this.searchValue = keyword);

    this.loadingSearchResults$ = this.autocompleteService.isLoading$;

    this.cursor$ = this.autocompleteService.cursor$;

    this.searchResults$ = this.autocompleteService.recommendations$;

    this.focusSub = this.autocompleteService.isInFocus$.subscribe(b => this.isToolbarSearchFocused = b);

    this.cursorSub = this.autocompleteService.keyboardCursor$.subscribe(
      n => n !== -1
        ? this.searchValue = this.autocompleteService.recommendationsValue[n].name
        : this.searchValue = this.savedSearchValue);

    this.selectedCursorSub = this.autocompleteService.searchSelectedCursor$.subscribe((index: number) => {

      /*
      * When user selects search results from keyboard
      * lose focus
      * */
      if (index > 0) {
        this.searchValue = this.autocompleteService.recommendationsValue[index]?.name;
        this.savedSearchValue = this.autocompleteService.recommendationsValue[index]?.name;
      } else {
        this.searchValue = this.savedSearchValue;
      }
      this.autocompleteService.updateFocus(false);
      this.searchInput.nativeElement.blur();

      /*
       * Then navigate to the results
       */
      this._redirectToSearchResult(index);
    });
  }


  ngOnDestroy(): void {
    this.focusSub.unsubscribe();
    this.cursorSub.unsubscribe();
    this.selectedCursorSub.unsubscribe();
  }

  searchDiseases($event: string): void {
    this.searchValue = $event;
    this.savedSearchValue = $event;
    this.autocompleteService.updateFocus(true);

    if (this.searchValue.trim() !== '') {
      // Using the old Api and considering filtering options
      this.autocompleteService.getRecommendations(this.searchFiltersInUse, this.searchValue.trim());
    }
  }

  onSearchResultMouseOver($event: MouseEvent, indexToBeCursor: number): void {
    this.autocompleteService.updateHoverCursor(indexToBeCursor);
  }

  removeResultMouseOver(): void {
    this.autocompleteService.updateHoverCursor(-1);
  }


  selectResult(name: string): void {
    this.autocompleteService.updateFocus(false);
    this.searchValue = name;
    this.savedSearchValue = name;
  }

  toggleFilter(filter: SEARCH_FILTER): void {
    if (this.searchFiltersInUse.includes(filter)) {
      this.searchFiltersInUse = this.searchFiltersInUse.filter(f => f !== filter);
    } else {
      this.searchFiltersInUse = [...this.searchFiltersInUse, filter];
    }

    // Perform a new search with the up-to-date filters
    this.autocompleteService.getRecommendations(this.searchFiltersInUse, this.searchValue);
  }

  private redirectToSearchPage(term: string): void {
    this.router.navigate(['/v3/search'], {
      queryParams: {
        q: term
      },
      queryParamsHandling: ''
    });
  }

  performSearch(): void {
    this.autocompleteService.updateFocus(false);
    this.redirectToSearchPage(this.searchValue);
  }
}
