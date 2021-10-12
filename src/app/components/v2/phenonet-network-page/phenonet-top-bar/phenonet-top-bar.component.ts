import {Component, Input, OnInit} from '@angular/core';
import {ApiService} from 'src/app/services/api.service';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {SearchResult} from 'src/app/models/search.model';
import {SearchService} from 'src/app/services/search.service';
import {startWith} from 'rxjs/operators';

@Component({
  selector: 'app-phenonet-top-bar',
  templateUrl: './phenonet-top-bar.component.html',
  styleUrls: ['./phenonet-top-bar.component.scss', '../../../homepage-searchbar/homepage-searchbar.component.scss']
})
export class PhenonetTopBarComponent implements OnInit {
  @Input() searchBarPhenotype: string;
  searchRecommendations$: Observable<SearchResult[]>;

  searchKeyword = new FormControl();
  searchKeyword$ = this.searchKeyword.valueChanges as Observable<string>;
  searchFocused = false;

  constructor(private apiService: ApiService, private searchService: SearchService) { }

  ngOnInit(): void {

    // Listen to search results updates
    this.searchRecommendations$ = this.searchService.searchResults$;

    // Request search with empty string to get default results
    this.searchKeyword$
      .pipe(startWith(''))
      .subscribe(searchKeyword => this.searchService.searchWithFilters(['phenotype'], searchKeyword));
  }
}
