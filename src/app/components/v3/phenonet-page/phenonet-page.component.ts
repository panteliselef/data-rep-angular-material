import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {Subscription} from 'rxjs';
import {ApiService} from 'src/app/services/api.service';
import {HttpErrorResponse} from '@angular/common/http';
import {PhenonetPageService} from './phenonet-page.service';

@Component({
  selector: 'app-phenonet-page',
  templateUrl: './phenonet-page.component.html',
  styleUrls: ['./phenonet-page.component.scss'],
  providers: [
    PhenonetPageService
  ]
})
export class PhenonetPageComponent implements OnInit, OnDestroy {
  private routeSub: Subscription;

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

    this.apiService.getPhenonetDiseaseNeighborsAtDepth(diseaseId, 1)
      .subscribe((phenotypeGraph) => {
        console.log(phenotypeGraph);
        this.titleService.setTitle(`${diseaseId.capitalize()} | Phenonet`);
        this.phenonetService.updateDisease(diseaseId);
      }, (err: HttpErrorResponse) => {
        if (err.status === 400) {

          this.router.navigate(['/v3/error'], {
            queryParams: {
              fromPage: 'phenonet',
              fromPageArg: diseaseId
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

    /* Meanwhile set up the rest elements */
    if (!diseaseId) {
      this.titleService.setTitle('Phenonet');
    }
  }

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(this.onParamsChange.bind(this));
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }

}
