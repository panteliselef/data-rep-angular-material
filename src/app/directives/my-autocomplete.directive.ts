import {Directive, ElementRef, Input} from '@angular/core';
import {fromEvent} from 'rxjs';
import {filter} from 'rxjs/operators';
import {SearchService} from '../services/search.service';

@Directive({
  selector: '[appMyAutocomplete]',
})
export class MyAutocompleteDirective {

  cursor = -1;
  @Input() searchValue = '';

  constructor(private el: ElementRef, private searchService: SearchService) {
    fromEvent<KeyboardEvent>(this.el.nativeElement, 'keydown')
      .pipe(
        filter(() => this.searchService.searchResultsValue.length > 0),
        filter((event: KeyboardEvent) => {
          return ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft', 'Enter', 'Escape'].includes(event.code);
        })
      )
      .subscribe((event) => {
        console.log(this.searchValue);
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

    this.searchService.searchCursor$.subscribe(n => this.cursor = n);
  }


  private onArrowDown(event): void {
    event.preventDefault();
    const l = this.searchService.searchResultsValue.length;
    let c = this.cursor;
    if (c + 1 >= l) {
      c = -1;
      this.cursor = c;
      this.searchService.updateSearchCursor(c);
      return;
    } else {
      c++;
    }
    this.cursor = c;
    this.searchService.updateSearchCursor(c);
  }

  private onArrowUp(event): void {
    event.preventDefault();
    const l = this.searchService.searchResultsValue.length;
    let c = this.cursor;
    if (c - 1 === -1) {
      c = -1;
      this.cursor = c;
      this.searchService.updateSearchCursor(c);
      return;
    } else if (c - 1 < 0) {
      c = l - 1;
    } else {
      c--;
    }
    this.cursor = c;
    this.searchService.updateSearchCursor(c);
  }

  private onEnter(event): void {
    event.preventDefault();
    return this.searchService.updateSelectedCursor(this.cursor);
  }

  private _onEscape(): void {
    this.searchService.updateFocus(false);
  }

}
