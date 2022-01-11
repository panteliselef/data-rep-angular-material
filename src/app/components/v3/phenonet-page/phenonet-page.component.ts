import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {Observable, Subscription} from 'rxjs';
import {ApiService} from 'src/app/services/api.service';
import {HttpErrorResponse} from '@angular/common/http';
import {PhenonetPageService} from './phenonet-page.service';
import {MatTableDataSource} from '@angular/material/table';
import {ConnectedNode, GRAPH} from '../../../models/graph.model';
import {map} from 'rxjs/operators';
import {PostgresStudy} from '../../../models/postgres.model';

@Component({
  selector: 'app-phenonet-page',
  templateUrl: './phenonet-page.component.html',
  styleUrls: ['./phenonet-page.component.scss'],
  providers: [
    PhenonetPageService
  ]
})
export class PhenonetPageComponent implements OnInit, OnDestroy {

  mainDisease = 'sepsis';
  private routeSub: Subscription;

  filteredGraph$: Observable<GRAPH>;
  connectedNodes$: Observable<MatTableDataSource<ConnectedNode>>;
  studies$: Observable<MatTableDataSource<PostgresStudy>>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private phenonetService: PhenonetPageService,
    private titleService: Title) {
  }


  /**
   * Fetch new graph for disease in parameters
   * With elastic API
   * @param params contains :diseaseId
   */
  onParamsChange(params: Params): void {
    const {diseaseId} = params;
    this.mainDisease = diseaseId;

    /* Meanwhile set up the rest elements */
    if (!diseaseId) {
      this.titleService.setTitle('Phenonet');
    }
  }

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(this.onParamsChange.bind(this));


    /*
    * Fetch Edges and Nodes
    * and listen to switch and fetch again
    */
    this.phenonetService.displayAllNodes$.subscribe((display) => {
      this.phenonetService.fetchNetwork(display ? '' : this.mainDisease)
        .subscribe(_ => {
          this.titleService.setTitle(`${this.mainDisease.capitalize()} | Phenonet`);
          this.phenonetService.updateDisease(this.mainDisease);
        }, (err: HttpErrorResponse) => {
          if (err.status === 400) {

            this.router.navigate(['/v3/error'], {
              queryParams: {
                fromPage: 'phenonet',
                fromPageArg: this.mainDisease
              },
              skipLocationChange: true
            });
          } else {
            this.router.navigate(['/v3/error'], {
              queryParams: {
                errorCode: '404',
                withErrorCode: true
              },
              skipLocationChange: true
            });

          }
        });
    });


    this.filteredGraph$ = this.phenonetService.filteredGraph$;
    this.connectedNodes$ = this.phenonetService.graph$.pipe(
      map(graph => graph.edges
        .filter(({from, to}) => {
          return from === this.mainDisease || to === this.mainDisease;
        })
        .map(({from, to, ...rest}) => {
          return {
            ...rest,
            from,
            to,
            node: (from === this.mainDisease ? to : from) as string,
          };
        })
        .sort((a, b) => b.weight - a.weight)),
      map(formattedEdges => new MatTableDataSource<ConnectedNode>(formattedEdges))
    );
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }

}
