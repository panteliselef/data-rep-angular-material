import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from 'src/environments/environment';
import {Observable} from 'rxjs';
import {DATASET, GRAPH} from 'src/app/models/graph.model';
import {DEPTH_DEGREE} from 'src/app/services/graph-filter-bar.service';
import {DiseaseEdge, ElasticModel, GeneData, PlatformEdge} from 'src/app/models/elastic.model';
import {SEARCH_FILTER, SEARCH_RESULT} from 'src/app/models/search.model';
import {GplData, GPLEDGE, GPLNODE, Technology} from 'src/app/models/gplGraph.model';
import {map} from 'rxjs/operators';

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

  public getPhenonetElastic(disease: string): Observable<DiseaseEdge[]> {
    return this.http.get<ElasticModel>(`http://snf-880201.vm.okeanos.grnet.gr:8000/get_phenonet_data/${disease ? `?q=${disease}` : ''}`)
      .pipe(
        map((data) => data.hits.hits.map<DiseaseEdge>( (hitEntity) => hitEntity._source as DiseaseEdge))
      );
  }

  public getBiodataomeStudies(studyIds: string[]): Observable<Array<DATASET>> {
    return this.http.get<Array<DATASET>>(`${environment.apiUrl}biodataome?q=${studyIds.join(':')}`);
  }

  public getGlobalSearchResults(query: string, filters?: SEARCH_FILTER[]): Observable<SEARCH_RESULT[]> {

    let params = new HttpParams();
    params = params.append('q', query);
    if (filters) {
      params = params.append('filters', filters.join(','));
    }
    return this.http.get<any>(`${environment.apiUrl}searchV2`, { params });
  }

  public getTechnologyGraph(technology: Technology): Observable<GplData> {
    return this.http.get<GplData>(`${environment.apiUrl}visjs/${technology}`);
  }

  public getTechnologyGraphElastic(technology: Technology): Observable<PlatformEdge[]> {
    return this.http.get<ElasticModel>(`http://snf-880201.vm.okeanos.grnet.gr:8000/get_platform_net_data/?q=${technology}`)
      .pipe(
        map((data) => data.hits.hits.map<PlatformEdge>((hitEntity) => hitEntity._source as PlatformEdge))
      );
  }

  public getPlatformGenes(technology: Technology, edge: GPLEDGE): Observable<GeneData> {
    edge = {
      from: (edge.from as GPLNODE)?.id || edge.from,
      to: (edge.to as GPLNODE)?.id || edge.to,
      value: edge.value
    };
    return this.http.get<ElasticModel>(`http://snf-880201.vm.okeanos.grnet.gr:8000/get_platform_net_data/?q=${technology},${edge.from},${edge.to}`)
      .pipe(
        map((data) => data.hits.hits.map<GeneData>((hitEntity) => hitEntity._source as GeneData)[0])
      );
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
