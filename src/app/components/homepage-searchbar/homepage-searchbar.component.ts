import {Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {SearchService} from 'src/app/services/search.service';
import {SearchResult} from 'src/app/models/search.model';
import {Router} from '@angular/router';
import {SearchResultUrlPipe} from 'src/app/pipes/search-result-url.pipe';

@Component({
  selector: 'app-homepage-searchbar',
  templateUrl: './homepage-searchbar.component.html',
  styleUrls: ['./homepage-searchbar.component.scss']
})
export class HomepageSearchbarComponent implements OnInit, OnDestroy {

  @ViewChild('toolbarSearchInput', {static: true}) toolbarSearchInput: ElementRef;

  searchResults$: Observable<SearchResult[]>;

  searchValue = '';
  savedSearchValue = '';
  isToolbarSearchFocused = false;
  cursor$: Observable<number>;
  private focusSub: Subscription;
  private cursorSub: Subscription;
  private selectedCursorSub: Subscription;

  constructor(private searchService: SearchService,
              private eRef: ElementRef,
              private router: Router) {
  }


  @HostListener('document:click', ['$event'])
  clickOut(event): void {
    this.searchService.updateSearchCursor(-1);
    this.isToolbarSearchFocused = !!this.eRef.nativeElement.contains(event.target);
  }


  private _redirectToSearchResult(index: number): void {
    if (index < 0) {
      return;
    }
    this.router.navigate(
      [new SearchResultUrlPipe().transform(this.searchService.searchResultsValue[this.searchService.cursorValue])]
    ).then();
  }

  ngOnInit(): void {
    this.cursor$ = this.searchService.searchCursor$;

    this.searchResults$ = this.searchService.searchResults$;

    this.focusSub = this.searchService.isInFocus$.subscribe(b => this.isToolbarSearchFocused = b);

    this.cursorSub = this.cursor$.subscribe(
      n => n !== -1
        ? this.searchValue = this.searchService.searchResultsValue[n].name
        : this.searchValue = this.savedSearchValue);

    this.selectedCursorSub = this.searchService.searchSelectedCursor$.subscribe(this._redirectToSearchResult.bind(this));
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
    this.searchService.searchWithFilter('none', this.searchValue);
  }

  onSearchResultMouseOver($event: MouseEvent, indexToBeCursor: number): void {
    this.searchService.updateSearchCursor(indexToBeCursor);
  }
}
