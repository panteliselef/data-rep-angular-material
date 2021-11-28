import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import {SearchService} from '../../../services/search.service';
import {SEARCH_FILTER, SearchResult} from '../../../models/search.model';

@Component({
  selector: 'app-searchpage',
  templateUrl: './searchpage.component.html',
  styleUrls: ['./searchpage.component.scss']
})
export class SearchpageComponent implements OnInit, OnDestroy {
  private routeSub: Subscription;
  searchResults$: Observable<SearchResult[]>;

  constructor(
    private route: ActivatedRoute,
    private searchService: SearchService
  ) {
  }


  ngOnInit(): void {

    this.searchResults$ = this.searchService.searchResults$;


    this.routeSub = this.route.queryParamMap
      .subscribe((paramMap) => {
        if (paramMap.has('q') && paramMap.has('f')) {
          const q = paramMap.get('q');
          const f = paramMap.get('f');
          this.searchService.searchOldApi([f as SEARCH_FILTER], q);
          this.searchService.searchOldApiAutocomplete([f as SEARCH_FILTER], q);
        }
        else if (paramMap.has('q')) {
          const q = paramMap.get('q');
          this.searchService.searchOldApi([], q);
          this.searchService.searchOldApiAutocomplete([], q);
        }
      });
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }

}
