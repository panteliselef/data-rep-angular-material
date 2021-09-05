import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from 'src/environments/environment';
import {Observable} from 'rxjs';
import {GRAPH} from 'src/app/models/graph.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiURL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  public getPhenonetDiseaseNeighbors(disease: string): Observable<GRAPH>{
    return this.http.get<GRAPH>(`${this.apiURL}getPhenoNeighbors?q=${disease}`);
  }

  public getPhenonet(): Observable<GRAPH> {
    return this.http.get<GRAPH>(`${this.apiURL}visjs/phenonet`);
  }

  public getPhenonetSearchResults(query: string): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUrl}search?q=${query}`);
  }
}
