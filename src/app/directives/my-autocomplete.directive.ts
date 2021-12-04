import {Directive, ElementRef, Input, OnDestroy} from '@angular/core';
import {fromEvent, Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {SearchAutocompleteService} from '../services/search-autocomplete.service';

@Directive({
  selector: '[appMyAutocomplete]',
})
export class MyAutocompleteDirective implements OnDestroy {

  cursor = -1;
  @Input() searchValue = '';
  private keyboardSub: Subscription;
  private resultsSub: Subscription;
  private cursorSub: Subscription;

  constructor(private el: ElementRef, private autocompleteService: SearchAutocompleteService) {
    this.keyboardSub = fromEvent<KeyboardEvent>(this.el.nativeElement, 'keydown')
      .pipe(
        // This line was preventing for user to search on Enter if the array was empty
        // user should be able to search on enter at any time, he will see an error message later
        // filter(() => this.searchService.searchResultsAutoCompleteValue.length > 0),
        filter((event: KeyboardEvent) => {
          return ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft', 'Enter', 'Escape'].includes(event.code);
        })
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

    this.resultsSub = this.autocompleteService.recommendations$.subscribe(_ => this.autocompleteService.updateKeyboardCursor(-1));
    this.cursorSub = this.autocompleteService.cursor$.subscribe(n => this.cursor = n);
  }

  ngOnDestroy(): void {
    this.keyboardSub.unsubscribe();
    this.resultsSub.unsubscribe();
    this.cursorSub.unsubscribe();
  }


  private onArrowDown(event): void {
    event.preventDefault();
    const l = this.autocompleteService.recommendationsValue.length;
    let c = this.cursor;
    if (c + 1 >= l) {
      c = -1;
      this.cursor = c;
      this.autocompleteService.updateKeyboardCursor(c);
      return;
    } else {
      c++;
    }
    this.cursor = c;
    this.autocompleteService.updateKeyboardCursor(c);
  }

  private onArrowUp(event): void {
    event.preventDefault();
    const l = this.autocompleteService.recommendationsValue.length;
    let c = this.cursor;
    if (c - 1 === -1) {
      c = -1;
      this.cursor = c;
      this.autocompleteService.updateKeyboardCursor(c);
      return;
    } else if (c - 1 < 0) {
      c = l - 1;
    } else {
      c--;
    }
    this.cursor = c;
    this.autocompleteService.updateKeyboardCursor(c);
  }

  private onEnter(event: KeyboardEvent): void {
    console.log('enter', this.cursor);
    event.preventDefault();
    console.log(this.searchValue.trim());
    if (this.searchValue.trim() !== '') {
      this.autocompleteService.updateSelectedCursor(this.cursor);
    }
  }

  private _onEscape(): void {
    this.autocompleteService.updateFocus(false);
  }

}
