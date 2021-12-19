import { Component, OnInit } from '@angular/core';
import {PhenonetPageService} from '../phenonet-page.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-phenonet-breadcrumb',
  templateUrl: './phenonet-breadcrumb.component.html',
  styleUrls: ['./phenonet-breadcrumb.component.scss']
})
export class PhenonetBreadcrumbComponent implements OnInit {
  disease$: Observable<string>;

  constructor(
    private phenonetService: PhenonetPageService,
  ) { }

  ngOnInit(): void {
    this.disease$ = this.phenonetService.disease$;
  }

}
