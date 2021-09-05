import {Component, ElementRef, HostListener, Input, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from 'src/environments/environment';

@Component({
  selector: 'app-toolbar-search',
  templateUrl: './toolbar-search.component.html',
  styleUrls: ['./toolbar-search.component.scss']
})
export class ToolbarSearchComponent implements OnInit {


  constructor(private httpService: HttpClient, private eRef: ElementRef) { }
  @Input() value: string;
  @Input() mode: string;
  searchSuggestions: string[];
  isToolbarSearchFocused = false;

  @ViewChild('toolbarSearch') toolbarSearch;

  @HostListener('document:click', ['$event'])
  clickout(event): void {
    this.isToolbarSearchFocused = !!this.eRef.nativeElement.contains(event.target);
  }

  ngOnInit(): void {
    // if (!this.mode) { throw new Error(`Attribute 'mode' is required in component 'app-toolbar-search'`); }
    this.searchSuggestions = [];
  }

  async searchDiseases($event: KeyboardEvent): Promise<void> {
    this.searchSuggestions = await this.httpService
      .get<string[]>(`${environment.apiUrl}search?q=${($event.target as HTMLInputElement).value}`)
      .toPromise();
    console.log(this.searchSuggestions);
  }

}
