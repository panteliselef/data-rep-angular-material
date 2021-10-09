import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import {SearchService} from 'src/app/services/search.service';
import {SearchResult} from 'src/app/models/search.model';
@Component({
  selector: 'app-homepage-searchbar',
  templateUrl: './homepage-searchbar.component.html',
  styleUrls: ['./homepage-searchbar.component.scss']
})
export class HomepageSearchbarComponent implements OnInit {

  constructor(private httpService: HttpClient,
              private searchService: SearchService,
              private eRef: ElementRef) {
  }
  searchValue = '';
  searchSuggestions: string[];
  isToolbarSearchFocused = false;

  searchResults$: Observable<SearchResult[]>;

  @ViewChild('toolbarSearch') toolbarSearch;

  @HostListener('document:click', ['$event'])
  clickOut(event): void {
    this.isToolbarSearchFocused = !!this.eRef.nativeElement.contains(event.target);
  }

  ngOnInit(): void {
    this.searchSuggestions = [];
    this.searchResults$ = this.searchService.searchResults$;
  }

  searchDiseases($event: string): void {
    this.searchValue = $event;
    this.searchService.searchWithFilter('none', this.searchValue);
  }

}
