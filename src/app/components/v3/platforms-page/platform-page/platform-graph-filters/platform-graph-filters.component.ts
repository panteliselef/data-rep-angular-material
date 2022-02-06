import {Component, ElementRef, HostListener, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable, Subscription} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatSliderChange} from '@angular/material/slider';
import {PlatformPageService} from '../platform-page.service';
import {openClose, openClose2, openClose3, queryShake} from '../../../../../shared/animations';

@Component({
  selector: 'app-platform-graph-filters',
  templateUrl: './platform-graph-filters.component.html',
  styleUrls: ['./platform-graph-filters.component.scss'],
  animations: [
    openClose,
    openClose2,
    openClose3,
    queryShake
  ]
})
export class PlatformGraphFiltersComponent implements OnInit, OnDestroy {
  isGraphFilterMenuOpen = false;
  highlightDiseaseControl = new FormControl();
  minSliderValue$: Observable<number>;
  maxSliderValue$: Observable<number>;
  currSliderValue$: Observable<number>;
  filteredOptions$: Observable<string[]>;
  diseasesInGraph$: Observable<string[]>;

  private diseasesSub: Subscription;

  constructor(private platformService: PlatformPageService,
              private eRef: ElementRef) {
  }

  @HostListener('document:click', ['$event'])
  clickOut(event): void {
    /**
     * Making sure that if user clicks inside the component, the component will not lose focus
     */
    const componentChildren = Array.from<HTMLElement>(this.eRef.nativeElement.firstChild.children);
    const isChildArray = componentChildren[0].contains(event.target);
    this.isGraphFilterMenuOpen = (isChildArray && this.isGraphFilterMenuOpen);
  }

  ngOnInit(): void {
    this.minSliderValue$ = this.platformService.minSliderValue$;
    this.maxSliderValue$ = this.platformService.maxSliderValue$;
    this.currSliderValue$ = this.platformService.currSliderValue$;
    this.platformService.diseaseToBeHighlighted$.subscribe((disease) => this.highlightDiseaseControl.setValue(disease));

    // Get diseases that exist in the displayed graph
    this.diseasesInGraph$ = this.platformService.filteredGraph$.pipe(
      map( (gplGraph) => gplGraph?.categories.map(category => category.name))
    );

    /**
     * Once you get the diseases start listening for when user types and filter
     * those diseases based on the user input
     */
    this.diseasesSub = this.diseasesInGraph$.subscribe((diseases) => {
      if (!diseases) {
        return;
      }
      this.filteredOptions$ = this.highlightDiseaseControl.valueChanges
        .pipe(
          startWith(''), // this populates array with every disease
          map((value: string) => {
            const filterValue = value.toLowerCase();
            return diseases.filter(option => option.toLowerCase().includes(filterValue));
          })
        );
    });
  }

  ngOnDestroy(): void {
    this.diseasesSub.unsubscribe();
  }

  zoomIn(): void {
    this.platformService.updateZoomIn();
  }

  zoomOut(): void {
    this.platformService.updateZoomOut();
  }

  savePng(): void {
    this.platformService.requestPNGSave();
  }

  reset(): void {
    this.platformService.requestResetGraph();
  }

  /**
   * Emit disease to be highlighted to service subscribers
   * @param $event disease user selected to highlight
   */
  emitSelectedOption($event: MatAutocompleteSelectedEvent | string): void {
    const diseaseName = $event instanceof MatAutocompleteSelectedEvent ? $event.option.value : $event;
    this.platformService.updateDiseaseToBeHighlighted(diseaseName);
  }

  handleSliderInput($event: MatSliderChange | number): void {
    const limit = $event instanceof MatSliderChange ? $event.value : $event;
    this.platformService.updateCurrEdgeFreq(limit);
  }

  resetFilters(): void {
    this.platformService.resetGraphFilters();
  }

}
