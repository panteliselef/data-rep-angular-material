import {Component, OnInit} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {PhenonetPageService} from '../phenonet-page.service';

@Component({
  selector: 'app-p-graph-filters',
  templateUrl: './p-graph-filters.component.html',
  styleUrls: ['./p-graph-filters.component.scss'],
  animations: [
    trigger('openClose', [
      state('true', style({opacity: 1, transform: 'translateY(0)', visibility: 'visible'})),
      state('false', style({opacity: 0, transform: 'translateY(10px)', visibility: 'hidden'})),
      transition('false <=> true', animate('400ms cubic-bezier(0.68,-0.55,0.27,1.55)'))
    ])
  ],
})
export class PGraphFiltersComponent implements OnInit {
  isGraphFilterMenuOpen = false;

  // TODO: support clickout
  constructor(private phenonetService: PhenonetPageService) {
  }

  ngOnInit(): void {
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
}
