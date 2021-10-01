import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from 'src/environments/environment';
import {Observable} from 'rxjs';
import {GRAPH} from 'src/app/models/graph.model';
import {DEPTH_DEGREE} from 'src/app/services/graph-filter-bar.service';
import {GplData, Technology} from 'src/app/models/gplGraph.model';
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

  public getTechnologyGraph(technology: Technology): Observable<GplData> {
    return this.http.get<GplData>(`${environment.apiUrl}visjs/${technology}`);
  }

  public getStudiesFilesURL(studyIds: string[], fileType: 'data' | 'annotation'): string {
    let params = new HttpParams();
    params = params.append('ids', studyIds.join(','));
    params = params.append('type', fileType);
    return `${environment.apiUrl}files?${params.toString()}`;
  }

  // public getStudiesFiles(studyIds: string[]): Observable<any> {
  //   return this.http.get<any>(this.getStudiesFilesURL(studyIds));
  // }

}
