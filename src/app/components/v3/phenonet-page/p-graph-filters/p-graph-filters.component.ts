import {Component, ElementRef, HostListener, OnInit} from '@angular/core';
import {PhenonetPageService} from '../phenonet-page.service';
import {Observable, Subscription} from 'rxjs';
import {MatSliderChange} from '@angular/material/slider';
import {FormControl} from '@angular/forms';
import {map, startWith} from 'rxjs/operators';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {openClose, openClose2, openClose3, queryShake} from '../../../../shared/animations';

@Component({
  selector: 'app-p-graph-filters',
  templateUrl: './p-graph-filters.component.html',
  styleUrls: ['./p-graph-filters.component.scss'],
  animations: [
    openClose,
    openClose2,
    openClose3,
    queryShake
  ],
})

export class PGraphFiltersComponent implements OnInit {
  isGraphFilterMenuOpen = false;
  highlightDiseaseControl = new FormControl();
  minEdgeFreq$: Observable<number>;
  currEdgeFreq$: Observable<number>;
  maxEdgeFreq$: Observable<number>;
  filteredOptions$: Observable<string[]>;
  diseasesInGraph$: Observable<string[]>;
  displayAll$: Observable<boolean>;
  displayAllDisabled$: Observable<boolean>;

  private diseasesSub: Subscription;

  constructor(private phenonetService: PhenonetPageService,
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
    this.minEdgeFreq$ = this.phenonetService.minEdgeFreq$;
    this.maxEdgeFreq$ = this.phenonetService.maxEdgeFreq$;
    this.currEdgeFreq$ = this.phenonetService.currEdgeFreq$;
    this.displayAll$ = this.phenonetService.displayAllNodes$;
    this.displayAllDisabled$ = this.phenonetService.isDisplayAllNodesDisabled$;
    this.phenonetService.diseaseToBeHighlighted$.subscribe((disease) => this.highlightDiseaseControl.setValue(disease));

    // Get diseases that exist in the displayed graph
    this.diseasesInGraph$ = this.phenonetService.filteredGraph$.pipe(
      map((graph) => graph?.diseases)
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

  zoomIn(): void {
    this.phenonetService.updateZoomIn();
  }

  zoomOut(): void {
    this.phenonetService.updateZoomOut();
  }

  savePng(): void {
    this.phenonetService.requestPNGSave();
  }

  reset(): void {
    this.phenonetService.requestResetGraph();
  }


  setNeighborDegree($event: boolean): void {
    this.phenonetService.updateDisplayAllNodes($event);
  }

  /**
   * Emit disease to be highlighted to service subscribers
   * @param $event disease user selected to highlight
   */
  emitSelectedOption($event: MatAutocompleteSelectedEvent | string): void {
    const diseaseName = $event instanceof MatAutocompleteSelectedEvent ? $event.option.value : $event;
    this.phenonetService.updateDiseaseToBeHighlighted(diseaseName);
  }

  handleSliderInput($event: MatSliderChange | number): void {
    const limit = $event instanceof MatSliderChange ? $event.value : $event;
    this.phenonetService.updateCurrEdgeFreq(limit);
  }

  resetFilters(): void {
    this.phenonetService.resetGraphFilters();
  }
}
