import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from 'src/environments/environment';
import {forkJoin, Observable} from 'rxjs';
import {GRAPH} from 'src/app/models/graph.model';
import {DEPTH_DEGREE} from 'src/app/services/graph-filter-bar.service';
import {DiseaseEdge, ElasticModel, GeneData, PlatformEdge} from 'src/app/models/elastic.model';
import {SEARCH_FILTER, SearchResult} from 'src/app/models/search.model';
import {GplData, GPLEDGE, GPLNODE, Technology} from 'src/app/models/gplGraph.model';
import {map, tap} from 'rxjs/operators';
import {PostgresResponse, PostgresStudy} from 'src/app/models/postgres.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) {
  }

  private apiURL = environment.apiUrl;

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
    return this.http.post(`${this.apiURL}genes`, {
      genes
    }, {
      responseType: 'blob',
    }).pipe(
      tap(ApiService.invokeBlobDownload)
    );
  }


  public getPostgresSearchResults(query: string): Observable<PostgresResponse> {
    console.log('a', query);
    let params = new HttpParams();
    params = params.append('q', `arbitary_term,${query}`);
    return this.http.get<PostgresResponse>(`http://snf-880201.vm.okeanos.grnet.gr:8000/get_relational_data_json_data/`, {params});
  }



  /**
   * @deprecated
   * Request 1rst degree neighbors of a disease in phenonet
   * @param disease Disease name e.g. sepsis
   */
  public getPhenonetDiseaseNeighbors(disease: string): Observable<GRAPH> {
    return this.http.get<GRAPH>(`${this.apiURL}getPhenoNeighbors?q=${disease}`);
  }

  /**
   * @deprecated hehe
   * @param disease Disease name e.g. sepsis
   * @param depth Number of levels deep to search for
   */
  public getPhenonetDiseaseNeighborsAtDepth(disease: string, depth: DEPTH_DEGREE): Observable<GRAPH> {
    return this.http.get<GRAPH>(`${this.apiURL}getPhenoNeighborsAtDepth?q=${disease}&d=${depth}`);
  }

  /**
   * @deprecated use elastic version instead
   * @returns Graph with all nodes and edges
   */
  public getPhenonet(): Observable<GRAPH> {
    return this.http.get<GRAPH>(`${this.apiURL}visjs/phenonet`);
  }

  /**
   * @deprecated use v2 instead
   * @param query Keyword to search for
   */
  public getPhenonetSearchResults(query: string): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUrl}search?q=${query}`);
  }

  /**
   * Get full disease graph or graph with 1st degree neighbors of a disease
   * @param disease Optional Disease name
   */
  public getPhenonetElastic(disease?: string): Observable<DiseaseEdge[]> {
    return this.http.get<ElasticModel>(`http://snf-880201.vm.okeanos.grnet.gr:8000/get_phenonet_data/${disease ? `?q=${disease}` : ''}`)
      .pipe(
        map((data) => data.hits.hits.map<DiseaseEdge>((hitEntity) => hitEntity._source as DiseaseEdge))
      );
  }


  /**
   * Get annotation data for studies/datasets
   * @param studyIds Array of studies e.g. GSE123,GSE890
   */
  public getBiodataomeStudies(studyIds: string[]): Observable<Array<PostgresStudy>> {
    const requests = studyIds.map(id => this.http.get<PostgresResponse>(`http://snf-880201.vm.okeanos.grnet.gr:8000/get_relational_data_json_data/?q=${id}`));
    return forkJoin(requests).pipe(map(responses => responses.map(r => r.main_table[0] as PostgresStudy)));
  }


  /**
   * Search a keyword and apply filters to limit your search options
   * @param query keyword to look up
   * @param filters Optional filtering that limits your search
   */
  public getGlobalSearchResults(query: string, filters?: SEARCH_FILTER[]): Observable<SearchResult[]> {
    let params = new HttpParams();
    params = params.append('q', query);
    if (filters) {
      params = params.append('filters', filters.join(','));
    }
    return this.http.get<SearchResult[]>(`${environment.apiUrl}searchV2`, {params});
  }


  /**
   * Request dataset networks with all nodes and edges
   * @deprecated Use Elastic version instead
   * @param technology each technology corresponds to a graph
   */
  public getTechnologyGraph(technology: Technology): Observable<GplData> {
    return this.http.get<GplData>(`${environment.apiUrl}visjs/${technology}`);
  }

  /**
   * Request dataset networks with all nodes and edges
   * @param technology each technology corresponds to a graph
   */
  public getTechnologyGraphElastic(technology: Technology): Observable<PlatformEdge[]> {
    return this.http.get<ElasticModel>(`http://snf-880201.vm.okeanos.grnet.gr:8000/get_platform_net_data/?q=${technology}`)
      .pipe(
        map((data) => data.hits.hits.map<PlatformEdge>((hitEntity) => hitEntity._source as PlatformEdge))
      );
  }

  /**
   * Request genes that created the connection between two studies
   * @param technology Specify the platform
   * @param edge Edge that connects the two studies
   */
  public getPlatformGenes(technology: Technology, edge: GPLEDGE): Observable<GeneData> {
    // TODO: There is an side effect that occurs when this method is called with an edge that comes from the graph-component
    // The following lines fiix the side effect but it would be nice to find a better solution
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
}
