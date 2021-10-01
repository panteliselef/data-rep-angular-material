import { Component, OnInit } from '@angular/core';
import {ApiService} from 'src/app/services/api.service';

@Component({
  selector: 'app-dataset-top-bar',
  templateUrl: './dataset-top-bar.component.html',
  styleUrls: [
    './dataset-top-bar.component.scss',
    '../../phenonet-network-page/phenonet-top-bar/phenonet-top-bar.component.scss'
  ]
})
export class DatasetTopBarComponent implements OnInit {

  searchFocused: boolean;
  searchRecommendations: string[];
  searchBarValue: string;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.searchRecommendations = [];
  }
  onSearch($event): void{
    this.searchBarValue = $event;

    // TODO: make this part of DatasetNetworkService
    this.apiService
      .getPhenonetSearchResults(this.searchBarValue)
      .subscribe((recommendations: string[]) => {
        this.searchRecommendations = recommendations;
        console.log(recommendations);
      });
    console.log(this.searchBarValue);
  }

}
