import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {MatSliderChange} from '@angular/material/slider';
import {FormControl} from '@angular/forms';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {map, startWith} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {DEPTH_DEGREE, DEPTH_DEGREE_ARR, GraphFilterBarService} from 'src/app/services/graph-filter-bar.service';

@Component({
  selector: 'app-graph-filter-bar',
  templateUrl: './graph-filter-bar.component.html',
  styleUrls: ['./graph-filter-bar.component.scss']
})
export class GraphFilterBarComponent implements OnInit, OnChanges {

  @Input() minGraphEdgeFreq: number;
  @Input() maxGraphEdgeFreq: number;
  @Input() dropdownItems: Array<string>;

  @Output() sliderChange = new EventEmitter<number>();
  @Output() highlightDisease = new EventEmitter<string>();

  @Output() neighborDegree = new EventEmitter<DEPTH_DEGREE>();

  currSliderValue: number;
  highlightDiseaseControl = new FormControl();
  filteredOptions: Observable<string[]>;

  depthDegreeValues = DEPTH_DEGREE_ARR;

  depthDegree: DEPTH_DEGREE;

  constructor(private graphFilterBarService: GraphFilterBarService) {
  }

  ngOnInit(): void {
    this.depthDegree = 'all';
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


  setNeighborDegree(degree: DEPTH_DEGREE): void {
    this.depthDegree = degree;
    this.graphFilterBarService.updateDepthDegree(degree);
    this.neighborDegree.emit(degree);
  }
}
