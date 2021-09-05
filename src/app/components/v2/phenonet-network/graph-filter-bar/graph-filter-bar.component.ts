import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatSliderChange} from '@angular/material/slider';

@Component({
  selector: 'app-graph-filter-bar',
  templateUrl: './graph-filter-bar.component.html',
  styleUrls: ['./graph-filter-bar.component.scss']
})
export class GraphFilterBarComponent implements OnInit {

  @Input() minGraphEdgeFreq: number;
  @Input() maxGraphEdgeFreq: number;

  @Output() onSliderInput = new EventEmitter<number>();

  currSliderValue: number;

  constructor() { }

  ngOnInit(): void {

    this.minGraphEdgeFreq = this.currSliderValue;
  }

  handleSliderInput($event: MatSliderChange): void {
    let limit: number;
    if ($event instanceof MatSliderChange) {
      limit = $event.value;
    } else {
      limit = $event;
    }

    this.onSliderInput.emit(limit);
  }
}
