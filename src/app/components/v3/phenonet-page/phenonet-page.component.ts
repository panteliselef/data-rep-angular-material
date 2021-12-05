import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {LoadingService} from '../../../services/loading.service';
import {Title} from '@angular/platform-browser';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-phenonet-page',
  templateUrl: './phenonet-page.component.html',
  styleUrls: ['./phenonet-page.component.scss']
})
export class PhenonetPageComponent implements OnInit, OnDestroy {
  private routeSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loadingService: LoadingService,
    private titleService: Title) {}


  /**
   * Fetch new graph for disease in parameters
   * With elastic API
   * @param params contains :diseaseId
   */
  onParamsChange(params: Params): void {
    const {diseaseId} = params;
    /* Meanwhile set up the rest elements */
    if (!diseaseId) {
      this.titleService.setTitle('Phenonet');
    } else {
      this.titleService.setTitle(`${diseaseId.capitalize()} | Phenonet`);
    }
  }

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(this.onParamsChange.bind(this));
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }

}
