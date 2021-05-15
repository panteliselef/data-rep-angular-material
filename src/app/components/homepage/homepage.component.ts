import {Component, OnInit, ViewChild} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {
  searchSuggestions: string[];

  @ViewChild('toolbarSearch') toolbarSearch;

  constructor(private httpService: HttpClient) { }

  async ngOnInit(): Promise<void> {
    this.searchSuggestions = [];
  }

  async searchDiseases($event: KeyboardEvent): Promise<void> {

    this.searchSuggestions = await this.httpService
      .get<string[]>(`${environment.apiUrl}search?q=${($event.target as HTMLInputElement).value}`)
      .toPromise();
    console.log(this.searchSuggestions);
  }
}
