import {Component, ElementRef, HostListener, Input, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from 'src/environments/environment';
import {Observable} from 'rxjs';
import {ApiService} from 'src/app/services/api.service';

@Component({
  selector: 'app-toolbar-search',
  templateUrl: './toolbar-search.component.html',
  styleUrls: ['./toolbar-search.component.scss']
})
export class ToolbarSearchComponent implements OnInit {


  constructor(private httpService: HttpClient,
              private apiService: ApiService,
              private eRef: ElementRef) {
  }

  @Input() value: string;
  @Input() mode: string;
  searchSuggestions: string[];
  isToolbarSearchFocused = false;

  searchAllResults$: Observable<any>;

  @ViewChild('toolbarSearch') toolbarSearch;

  @HostListener('document:click', ['$event'])
  clickout(event): void {
    this.isToolbarSearchFocused = !!this.eRef.nativeElement.contains(event.target);
  }

  ngOnInit(): void {
    this.searchSuggestions = [];
  }

  async searchDiseases($event: KeyboardEvent): Promise<void> {

    const q = ($event.target as HTMLInputElement).value;
    this.searchSuggestions = await this.httpService
      .get<string[]>(`${environment.apiUrl}search?q=${q}`)
      .toPromise();
    console.log(this.searchSuggestions);




    this.apiService.getGlobalSearchResults(q).subscribe(results => {
      console.log('all', results);
    });
  }

}
