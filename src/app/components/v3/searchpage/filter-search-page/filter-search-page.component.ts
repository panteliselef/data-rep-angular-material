import {Component, Input, OnInit} from '@angular/core';
import {SEARCH_FILTER} from '../../../../models/search.model';

@Component({
  selector: 'app-filter-search-page',
  templateUrl: './filter-search-page.component.html',
  styleUrls: ['./filter-search-page.component.scss']
})
export class FilterSearchPageComponent implements OnInit {

  @Input() resultsCount = 0;
  @Input() selectedFilter: SEARCH_FILTER;
  @Input() filter: SEARCH_FILTER;

  constructor() {
  }

  ngOnInit(): void { }

}
