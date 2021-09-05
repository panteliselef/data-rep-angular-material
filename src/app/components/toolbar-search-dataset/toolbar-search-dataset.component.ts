import {Component, ElementRef, HostListener, Input, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-toolbar-search-dataset',
  templateUrl: './toolbar-search-dataset.component.html',
  styleUrls: ['./toolbar-search-dataset.component.scss', '../toolbar-search/toolbar-search.component.scss']
})
export class ToolbarSearchDatasetComponent implements OnInit {


  constructor(private httpService: HttpClient, private eRef: ElementRef) { }
  @Input() value: string;
  @Input() mode: string;
  networks: string[];
  isToolbarSearchFocused = false;

  @ViewChild('toolbarSearch') toolbarSearch;

  @HostListener('document:click', ['$event'])
  clickout(event): void {
    this.isToolbarSearchFocused = !!this.eRef.nativeElement.contains(event.target);
  }

  ngOnInit(): void {
    if (!this.mode) { throw new Error(`Attribute 'mode' is required in component 'app-toolbar-search'`); }
    this.networks = [];
  }

  async searchDatasetNetworks($event: KeyboardEvent): Promise<void> {
    this.networks = await this.httpService
      .get<string[]>(`${environment.apiUrl}getGPLs?q=${($event.target as HTMLInputElement).value}`)
      .toPromise();
    console.log(this.networks);
  }

}
