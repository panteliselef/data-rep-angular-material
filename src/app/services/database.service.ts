import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from 'src/environments/environment';
import {forkJoin, Observable} from 'rxjs';
import {PostgresResponse, PostgresStudy} from '../models/postgres.model';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  constructor(private http: HttpClient) {}



  public searchKeyword(query: string): Observable<PostgresResponse> {
    let params = new HttpParams();
    params = params.append('q', `arbitary_term,${query}`);
    return this.http.get<PostgresResponse>(`${environment.vmUrl}get_relational_data_json_data/`, {params});
  }

  /**
   * Get annotation data for studies/datasets
   * @param studyIds Array of studies e.g. GSE123,GSE890
   */
  public getStudiesMetadata(studyIds: string[]): Observable<Array<PostgresStudy>> {
    const requests = studyIds.map(id => this.http.get<PostgresResponse>(`${environment.vmUrl}get_relational_data_json_data/?q=${id}`));
    return forkJoin(requests).pipe(map(responses => responses.map(r => r.main_table[0] as PostgresStudy)));
  }


}
