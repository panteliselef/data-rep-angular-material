import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {SearchService} from 'src/app/services/search.service';
import {Router} from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import {SEARCH_FILTER, SEARCH_FILTER_ARR, SearchResult} from 'src/app/models/search.model';
import {SearchResultUrlPipe} from 'src/app/pipes/search-result-url.pipe';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
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

  constructor(private searchService: SearchService,
              private eRef: ElementRef,
              private router: Router) {
  }

  @HostListener('document:click', ['$event'])
  clickOut(event): void {
    this.searchService.updateKeyboardCursor(-1);

    /**
     * Making sure that if user clicks inside the component, the component will not lose focus
     */
    const componentChildren = Array.from<HTMLElement>(this.eRef.nativeElement.firstChild.children);
    const isChildArray = componentChildren.map(child => child.contains(event.target));
    this.isToolbarSearchFocused = isChildArray.includes(true);
  }

  private _redirectToSearchResult(index: number): void {
    if (index < 0) {
      return;
    }
    this.router.navigate(
      [new SearchResultUrlPipe().transform(this.searchService.searchResultsValue[index])]
    ).then();
  }

  ngOnInit(): void {
    this.cursor$ = this.searchService.cursor$;

    this.searchResults$ = this.searchService.searchResults$;

    this.focusSub = this.searchService.isInFocus$.subscribe(b => this.isToolbarSearchFocused = b);

    this.cursorSub = this.searchService.keyboardCursor$.subscribe(
      n => n !== -1
        ? this.searchValue = this.searchService.searchResultsValue[n].name
        : this.searchValue = this.savedSearchValue);

    this.selectedCursorSub = this.searchService.searchSelectedCursor$.subscribe((index: number) => {

      /*
      * When user selects search results from keyboard
      * lose focus
      * */
      this.searchValue = this.searchService.searchResultsValue[index]?.name;
      this.savedSearchValue = this.searchService.searchResultsValue[index]?.name;
      this.searchService.updateFocus(false);
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
    this.searchService.updateFocus(true);

    // Using the old Api and considering filtering options
    this.searchService.searchWithFiltersOldApi(this.searchFiltersInUse, this.searchValue);
  }

  onSearchResultMouseOver($event: MouseEvent, indexToBeCursor: number): void {
    this.searchService.updateHoverCursor(indexToBeCursor);
  }

  removeResultMouseOver(): void {
    this.searchService.updateHoverCursor(-1);
  }


  selectResult(name: string): void {
    this.searchService.updateFocus(false);
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
    this.searchService.searchWithFiltersOldApi(this.searchFiltersInUse, this.searchValue);
  }
}
