import {Component, Input, OnInit} from '@angular/core';
import {EDGE} from '../disease-page.component';

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
