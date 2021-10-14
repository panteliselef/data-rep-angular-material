import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatSliderChange} from '@angular/material/slider';
import {FormControl} from '@angular/forms';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {map, startWith} from 'rxjs/operators';
import {Observable, Subscription} from 'rxjs';
import {PhenonetNetworkService} from '../phenonet-network.service';

@Component({
  selector: 'app-graph-filter-bar',
  templateUrl: './graph-filter-bar.component.html',
  styleUrls: ['./graph-filter-bar.component.scss']
})
export class GraphFilterBarComponent implements OnInit, OnDestroy {

  minEdgeFreq$: Observable<number>;
  maxEdgeFreq$: Observable<number>;
  diseasesInGraph$: Observable<string[]>;
  filteredOptions$: Observable<string[]>;
  isDisabled$: Observable<boolean>;
  displayAll$: Observable<boolean>;
  highlightDiseaseControl = new FormControl();

  private diseasesSub: Subscription;

  constructor(
    private phenonetService: PhenonetNetworkService) {
  }


  /**
   * Subscribe to Observables
   */
  ngOnInit(): void {

    this.isDisabled$ = this.phenonetService.isDisplayAllNodesDisabled$;
    this.displayAll$ = this.phenonetService.displayAllNodes$;
    this.minEdgeFreq$ = this.phenonetService.minEdgeFreq$;
    this.maxEdgeFreq$ = this.phenonetService.maxEdgeFreq$;

    // Get diseases that exist in the displayed graph
    this.diseasesInGraph$ = this.phenonetService.filteredGraph$.pipe(
      map( (graph) => graph?.diseases)
    );

    /**
     * Once you get the diseases start listening for when user types and filter
     * those diseases based on the user input
     */
    this.diseasesSub = this.diseasesInGraph$.subscribe((diseases) => {
      if (!diseases) { return; }
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

  handleSliderInput($event: MatSliderChange | number): void {
    const limit = $event instanceof MatSliderChange ? $event.value : $event;
    this.phenonetService.updateCurrEdgeFreq(limit);
  }

  /**
   * Emit disease to be highlighted to service subscribers
   * @param $event disease user selected to highlight
   */
  emitSelectedOption($event: MatAutocompleteSelectedEvent | string): void {
    const diseaseName = $event instanceof MatAutocompleteSelectedEvent ? $event.option.value : $event;
    this.phenonetService.updateDiseaseToBeHighlighted(diseaseName);
  }

  setNeighborDegree($event: boolean): void {
    this.phenonetService.updateDisplayAllNodes($event);
  }
}
