import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {fromEvent, Observable} from 'rxjs';
import {SearchService} from 'src/app/services/search.service';
import {SearchResult} from 'src/app/models/search.model';
import {filter} from 'rxjs/operators';

@Component({
  selector: 'app-homepage-searchbar',
  templateUrl: './homepage-searchbar.component.html',
  styleUrls: ['./homepage-searchbar.component.scss']
})
export class HomepageSearchbarComponent implements OnInit {

  @ViewChild('toolbarSearchInput', {static: true}) toolbarSearchInput: ElementRef;

  searchResults$: Observable<SearchResult[]>;

  searchValue = '';
  savedSearchValue = '';
  isToolbarSearchFocused = false;
  cursor = -1;

  constructor(private httpService: HttpClient,
              private searchService: SearchService,
              private eRef: ElementRef) {
  }


  @HostListener('document:click', ['$event'])
  clickOut(event): void {
    this.cursor = -1; // Restart cursor
    this.isToolbarSearchFocused = !!this.eRef.nativeElement.contains(event.target);
  }

  private onArrowDown(event): void {
    event.preventDefault();
    const l = this.searchService.searchResultsValue.length;
    let c = this.cursor;
    if (c === -1) {
      this.savedSearchValue = this.searchValue;
    }

    if (c + 1 >= l) {
      c = -1;
      this.cursor = c;
      this.searchValue = this.savedSearchValue;
      return;
    } else {
      c++;
    }
    this.cursor = c;
    this.searchValue = this.searchService.searchResultsValue[c].name;
  }

  private onArrowUp(event): void {
    event.preventDefault();
    const l = this.searchService.searchResultsValue.length;
    let c = this.cursor;
    if (c === -1) {
      this.savedSearchValue = this.searchValue;
    }

    if (c - 1 === -1) {
      c = -1;
      this.cursor = c;
      this.searchValue = this.savedSearchValue;
      return;
    } else if (c - 1 < 0) {
      c = l - 1;
    } else {
      c--;
    }
    this.cursor = c;
    this.searchValue = this.searchService.searchResultsValue[c].name;
  }

  private onEnter(event): void {
    event.preventDefault();
    return this._redirectToSearchResult(this.cursor);
  }

  private _onEscape(): void {
    this.isToolbarSearchFocused = false;
  }

  private _redirectToSearchResult(index: number): void {
    if (index < 0) {
      return;
    }
    console.log('selecting', this.searchService.searchResultsValue[this.cursor].name);
  }

  ngOnInit(): void {
    this.searchResults$ = this.searchService.searchResults$;

    fromEvent<KeyboardEvent>(this.toolbarSearchInput.nativeElement, 'keydown')
      .pipe(
        filter((event: KeyboardEvent) => {
          return ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft', 'Enter', 'Escape'].includes(event.code);
        }),
        // tap((event: KeyboardEvent) => event.preventDefault()),
        // map((event: KeyboardEvent) => event.code)
      )
      .subscribe((event) => {
        switch (event.code) {
          case 'ArrowDown':
            this.onArrowDown(event);
            break;
          case 'ArrowUp':
            this.onArrowUp(event);
            break;
          case 'Enter':
            this.onEnter(event);
            break;
          case 'Escape':
            this._onEscape();
            break;
        }

      });

  }

  searchDiseases($event: string): void {
    this.searchValue = $event;
    this.searchService.searchWithFilter('none', this.searchValue);
  }

  onSearchResultMouseOver($event: MouseEvent, indexToBeCursor: number): void {
    this.cursor = indexToBeCursor;
  }
}
