import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';
import {DiseaseEdge, ElasticModel, GeneData, PlatformEdge} from '../models/elastic.model';
import {map} from 'rxjs/operators';
import {GPLEDGE, GPLNODE, Technology} from '../models/gplGraph.model';

@Injectable({
  providedIn: 'root'
})
export class ElasticService {

  constructor(private http: HttpClient) {}

  /**
   * Get full disease graph or graph with 1st degree neighbors of a disease
   * @param disease Optional Disease name
   */
  public getPhenonet(disease?: string): Observable<DiseaseEdge[]> {
    return this.http.get<ElasticModel>(`${environment.vmUrl}get_phenonet_data/${disease ? `?q=${disease}` : ''}`)
      .pipe(
        map((data) => data.hits.hits.map<DiseaseEdge>((hitEntity) => hitEntity._source as DiseaseEdge))
      );
  }


  /**
   * Request dataset networks with all nodes and edges
   * @param technology each technology corresponds to a graph
   */
  public getPlatformGraph(technology: Technology): Observable<PlatformEdge[]> {
    let params = new HttpParams();
    params = params.append('q', technology);
    return this.http.get<ElasticModel>(`${environment.vmUrl}get_platform_net_data/`, {params})
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

    let params = new HttpParams();
    params = params.append('q', `${technology},${edge.from},${edge.to}`);
    return this.http.get<ElasticModel>(`${environment.vmUrl}get_platform_net_data/`, {params})
      .pipe(
        map((data) => data.hits.hits.map<GeneData>((hitEntity) => hitEntity._source as GeneData)[0])
      );
  }

}
