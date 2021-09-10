import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {MatSliderChange} from '@angular/material/slider';
import {FormControl} from '@angular/forms';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {map, startWith} from 'rxjs/operators';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-graph-filter-bar',
  templateUrl: './graph-filter-bar.component.html',
  styleUrls: ['./graph-filter-bar.component.scss']
})
export class GraphFilterBarComponent implements OnInit, OnChanges{

  @Input() minGraphEdgeFreq: number;
  @Input() maxGraphEdgeFreq: number;
  @Input() dropdownItems: Array<string>;

  @Output() sliderChange = new EventEmitter<number>();
  @Output() highlightDisease = new EventEmitter<string>();

  currSliderValue: number;
  highlightDiseaseControl = new FormControl();
  filteredOptions: Observable<string[]>;

  constructor() { }

  ngOnInit(): void {

    this.minGraphEdgeFreq = this.currSliderValue;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.dropdownItems.currentValue) {
      this.filteredOptions = this.highlightDiseaseControl.valueChanges
        .pipe(
          startWith(''),
          map(value => this._filter(value))
        );
    }
  }

  handleSliderInput($event: MatSliderChange): void {
    let limit: number;
    if ($event instanceof MatSliderChange) {
      limit = $event.value;
    } else {
      limit = $event;
    }
    this.sliderChange.emit(limit);
  }

  emitSelectedOption($event: MatAutocompleteSelectedEvent | string): void {
    const diseaseName = $event instanceof MatAutocompleteSelectedEvent ? $event.option.value : $event;
    this.highlightDisease.emit(diseaseName);
  }
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.dropdownItems.filter(option => option.toLowerCase().includes(filterValue));
  }
}
