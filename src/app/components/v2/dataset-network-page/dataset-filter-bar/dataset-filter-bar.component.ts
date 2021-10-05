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
  diseasesInGraph: string[];

  highlightDiseaseControl = new FormControl();
  filteredOptions$: Observable<string[]>;


  constructor(private datasetNetworkService: DatasetNetworkService) { }

  ngOnInit(): void {
    this.minSliderValue$ = this.datasetNetworkService.minSliderValue$;
    this.maxSliderValue$ = this.datasetNetworkService.maxSliderValue$;

    this.diseasesInGraph$ = this.datasetNetworkService.filteredGraph$.pipe(
      map( (gplGraph) => gplGraph?.categories.map(category => category.name))
    );

    this.diseasesInGraph$.subscribe((diseases) => {
      this.filteredOptions$ = this.highlightDiseaseControl.valueChanges
        .pipe(
          startWith(''),
          map((value: string) => {
            const filterValue = value.toLowerCase();
            return diseases.filter(option => option.toLowerCase().includes(filterValue));
          })
        );
    });



  }

  handleSliderInput($event: MatSliderChange): void {
    let limit: number;
    if ($event instanceof MatSliderChange) {
      limit = $event.value;
    } else {
      limit = $event;
    }
    this.datasetNetworkService.updateSliderEdgeLimit(limit);
  }


  emitSelectedOption($event: MatAutocompleteSelectedEvent | string): void {
    const diseaseName = $event instanceof MatAutocompleteSelectedEvent ? $event.option.value : $event;
    this.datasetNetworkService.updateDiseaseToBeHighlighted(diseaseName);
  }

}
