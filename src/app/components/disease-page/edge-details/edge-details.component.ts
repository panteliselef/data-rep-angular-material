import {Component, Input, OnInit} from '@angular/core';
import {EDGE} from 'src/app/models/graph.model';

@Component({
  selector: 'app-edge-details',
  templateUrl: './edge-details.component.html',
  styleUrls: ['./edge-details.component.scss']
})
export class EdgeDetailsComponent implements OnInit {

  @Input('edgeDetails') edgeDetails: EDGE;
  constructor() { }

  ngOnInit(): void {
  }

  focusNode(edgeFrom: any): void {

  }
}
