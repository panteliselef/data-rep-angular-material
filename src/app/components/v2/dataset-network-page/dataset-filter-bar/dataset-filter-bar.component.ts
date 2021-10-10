import {Component, OnInit} from '@angular/core';
import {MatSliderChange} from '@angular/material/slider';
import {DatasetNetworkService} from '../dataset-network.service';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {FormControl} from '@angular/forms';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';

@Component({
  selector: 'app-dataset-filter-bar',
  templateUrl: './dataset-filter-bar.component.html',
  styleUrls: [
    './dataset-filter-bar.component.scss',
    '../../phenonet-network-page/graph-filter-bar/graph-filter-bar.component.scss'
  ]
})
export class DatasetFilterBarComponent implements OnInit {

  minSliderValue$: Observable<number>;
  maxSliderValue$: Observable<number>;
  diseasesInGraph$: Observable<string[]>;
  filteredOptions$: Observable<string[]>;

  diseasesInGraph: string[];

  highlightDiseaseControl = new FormControl();


  constructor(private datasetNetworkService: DatasetNetworkService) { }


  /**
   * Subscribe to Observables
   */
  ngOnInit(): void {
    this.minSliderValue$ = this.datasetNetworkService.minSliderValue$;
    this.maxSliderValue$ = this.datasetNetworkService.maxSliderValue$;

    // Get diseases that exist in the displayed graph
    this.diseasesInGraph$ = this.datasetNetworkService.filteredGraph$.pipe(
      map( (gplGraph) => gplGraph?.categories.map(category => category.name))
    );


    /**
     * Once you get the diseases start listening for when user types and filter
     * those diseases based on the user input
     */
    this.diseasesInGraph$.subscribe((diseases) => {
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


  /**
   * Emit slider event to subscribers
   * @param $event new slider value
   */
  handleSliderInput($event: MatSliderChange | number): void {
    const limit = $event instanceof MatSliderChange ? $event.value : $event;
    this.datasetNetworkService.updateSliderEdgeLimit(limit);
  }


  /**
   * Emit disease to be highlighted to service subscribers
   * @param $event disease user selected to highlight
   */
  emitSelectedOption($event: MatAutocompleteSelectedEvent | string): void {
    const diseaseName = $event instanceof MatAutocompleteSelectedEvent ? $event.option.value : $event;
    this.datasetNetworkService.updateDiseaseToBeHighlighted(diseaseName);
  }

}
