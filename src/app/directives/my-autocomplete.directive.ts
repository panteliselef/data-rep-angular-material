import {Directive, ElementRef, Input, OnDestroy} from '@angular/core';
import {fromEvent, Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {SearchService} from '../services/search.service';

@Directive({
  selector: '[appMyAutocomplete]',
})
export class MyAutocompleteDirective implements OnDestroy {

  cursor = -1;
  @Input() searchValue = '';
  private keyboardSub: Subscription;
  private resultsSub: Subscription;
  private cursorSub: Subscription;

  constructor(private el: ElementRef, private searchService: SearchService) {
    this.keyboardSub = fromEvent<KeyboardEvent>(this.el.nativeElement, 'keydown')
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

    this.resultsSub = this.searchService.searchResults$.subscribe(_ => this.searchService.updateKeyboardCursor(-1));
    this.cursorSub = this.searchService.cursor$.subscribe(n => this.cursor = n);
  }

  ngOnDestroy(): void{
    this.keyboardSub.unsubscribe();
    this.resultsSub.unsubscribe();
    this.cursorSub.unsubscribe();
  }


  private onArrowDown(event): void {
    event.preventDefault();
    const l = this.searchService.searchResultsValue.length;
    let c = this.cursor;
    if (c + 1 >= l) {
      c = -1;
      this.cursor = c;
      this.searchService.updateKeyboardCursor(c);
      return;
    } else {
      c++;
    }
    this.cursor = c;
    this.searchService.updateKeyboardCursor(c);
  }

  private onArrowUp(event): void {
    event.preventDefault();
    const l = this.searchService.searchResultsValue.length;
    let c = this.cursor;
    if (c - 1 === -1) {
      c = -1;
      this.cursor = c;
      this.searchService.updateKeyboardCursor(c);
      return;
    } else if (c - 1 < 0) {
      c = l - 1;
    } else {
      c--;
    }
    this.cursor = c;
    this.searchService.updateKeyboardCursor(c);
  }

  private onEnter(event: KeyboardEvent): void {
    event.preventDefault();
    return this.searchService.updateSelectedCursor(this.cursor);
  }

  private _onEscape(): void {
    this.searchService.updateFocus(false);
  }

}
