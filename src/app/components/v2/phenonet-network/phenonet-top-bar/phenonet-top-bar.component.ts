import {Component, Input, OnInit} from '@angular/core';
import {ApiService} from 'src/app/services/api.service';

@Component({
  selector: 'app-phenonet-top-bar',
  templateUrl: './phenonet-top-bar.component.html',
  styleUrls: ['./phenonet-top-bar.component.scss']
})
export class PhenonetTopBarComponent implements OnInit {
  @Input() searchBarPhenotype: string;

  searchFocused: boolean;
  searchRecommendations: string[];

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.searchRecommendations = [];
  }
  onSearchPhenonet($event): void{
    this.searchBarPhenotype = $event;
    this.apiService
      .getPhenonetSearchResults(this.searchBarPhenotype)
      .subscribe((recommendations: string[]) => {
        this.searchRecommendations = recommendations;
        console.log(recommendations);
      });
    console.log(this.searchBarPhenotype);
  }


}
