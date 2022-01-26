import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from 'src/environments/environment';
import {Observable} from 'rxjs';
import {GRAPH} from 'src/app/models/graph.model';
import {DEPTH_DEGREE} from 'src/app/services/graph-filter-bar.service';
import {SEARCH_FILTER, SearchResult} from 'src/app/models/search.model';
import {GplData, Technology} from 'src/app/models/gplGraph.model';
import {tap} from 'rxjs/operators';

export interface StudyMetadata {
  id: string;
  GSE: string;
  Species: string;
  Entity: string;
  Technology: string;
  Type: string;
  Samples: string;
  Disease: string;
  DOLink: string;
  Dsetlink: string;
  Datapath: string;
  DataAnnot: string;
}


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) {}

  private static invokeBlobDownload(blob: Blob, filename?: string): void {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename || 'file';
    a.click();
  }

  /**
   * Generate url for requesting download of multiple files
   * @param studyIds array of studies
   * @param fileType if 'data' fetch raw data files, otherwise annotation files
   */
  public static getStudiesFilesURL(studyIds: string[], fileType: 'data' | 'annotation'): string {
    let params = new HttpParams();
    params = params.append('ids', studyIds.join(','));
    params = params.append('type', fileType);
    return `${environment.apiUrl}files?${params.toString()}`;
  }

  public downloadGenesAsFile(genes: string[]): Observable<any> {
    return this.http.post(`${environment.apiUrl}genes`, {
      genes
    }, {
      responseType: 'blob',
    }).pipe(
      tap(ApiService.invokeBlobDownload)
    );
  }

  /**
   * Get annotation data for studies/datasets
   * @param studyIds Array of studies e.g. GSE123,GSE890
   */
  public getStudiesMetadata(studyIds: string[]): Observable<StudyMetadata[]> {
    return this.http.get<StudyMetadata[]>(`${environment.apiUrl}biodataome/?q=${studyIds.length === 0 ? '' : studyIds.join(',')}`);
  }


  /**
   * @deprecated
   * Request 1rst degree neighbors of a disease in phenonet
   * @param disease Disease name e.g. sepsis
   */
  public getPhenonetDiseaseNeighbors(disease: string): Observable<GRAPH> {
    return this.http.get<GRAPH>(`${environment.apiUrl}getPhenoNeighbors?q=${disease}`);
  }

  /**
   * @deprecated hehe
   * @param disease Disease name e.g. sepsis
   * @param depth Number of levels deep to search for
   */
  public getPhenonetDiseaseNeighborsAtDepth(disease: string, depth: DEPTH_DEGREE): Observable<GRAPH> {
    return this.http.get<GRAPH>(`${environment.apiUrl}getPhenoNeighborsAtDepth?q=${disease}&d=${depth}`);
  }

  /**
   * @deprecated use elastic version instead
   * @returns Graph with all nodes and edges
   */
  public getPhenonet(): Observable<GRAPH> {
    return this.http.get<GRAPH>(`${environment.apiUrl}visjs/phenonet`);
  }

  /**
   * @deprecated use v2 instead
   * @param query Keyword to search for
   */
  public getPhenonetSearchResults(query: string): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUrl}search?q=${query}`);
  }


  private getSearchResults(url: string, query: string, filters?: SEARCH_FILTER[]): Observable<SearchResult[]> {
    let params = new HttpParams();
    params = params.append('q', query);
    if (filters && filters.length > 0) {
      params = params.append('filters', filters.join(','));
    }
    return this.http.get<SearchResult[]>(url, {params});
  }


  /**
   * Search a keyword and apply filters to limit your search options
   * @param query keyword to look up
   * @param filters Optional filtering that limits your search
   */
  public getGlobalSearchResults(query: string, filters?: SEARCH_FILTER[]): Observable<SearchResult[]> {
    return this.getSearchResults(`${environment.apiUrl}search/v2`, query, filters);
  }

  /**
   * Search a keyword and apply filters to limit your search options
   * @param query keyword to look up
   * @param filters Optional filtering that limits your search
   */
  public getQuickSearchRecommendations(query: string, filters?: SEARCH_FILTER[]): Observable<SearchResult[]> {
    return this.getSearchResults(`${environment.apiUrl}search/quick`, query, filters);
  }


  /**
   * Request dataset networks with all nodes and edges
   * @deprecated Use Elastic version instead
   * @param technology each technology corresponds to a graph
   */
  public getTechnologyGraph(technology: Technology): Observable<GplData> {
    return this.http.get<GplData>(`${environment.apiUrl}visjs/${technology}`);
  }
}
