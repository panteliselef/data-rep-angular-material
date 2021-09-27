import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from 'src/environments/environment';
import {Observable} from 'rxjs';
import {DATASET, GRAPH} from 'src/app/models/graph.model';
import {DEPTH_DEGREE} from 'src/app/services/graph-filter-bar.service';
import {ElasticModel} from "../models/elastic.model";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiURL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  public getPhenonetDiseaseNeighbors(disease: string): Observable<GRAPH>{
    return this.http.get<GRAPH>(`${this.apiURL}getPhenoNeighbors?q=${disease}`);
  }

  public getPhenonetDiseaseNeighborsAtDepth(disease: string, depth: DEPTH_DEGREE): Observable<GRAPH>{
    return this.http.get<GRAPH>(`${this.apiURL}getPhenoNeighborsAtDepth?q=${disease}&d=${depth}`);
  }

  public getPhenonet(): Observable<GRAPH> {
    return this.http.get<GRAPH>(`${this.apiURL}visjs/phenonet`);
  }

  public getPhenonetSearchResults(query: string): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUrl}search?q=${query}`);
  }

  public getPhenonetElastic(disease: string): Observable<ElasticModel> {
    return this.http.get<ElasticModel>(`http://snf-880201.vm.okeanos.grnet.gr:8000/get_phenonet_data/${disease ? `?q=${disease}` : ''}`);
  }

  public getBiodataomeStudies(studyIds: string[]): Observable<Array<DATASET>> {
    return this.http.get<Array<DATASET>>(`${environment.apiUrl}biodataome?q=${studyIds.join(':')}`);
  }
}
