import {Component, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Params} from '@angular/router';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-not-found-page',
  templateUrl: './not-found-page.component.html',
  styleUrls: ['./not-found-page.component.scss']
})
export class NotFoundPageComponent implements OnInit {
  private routeSub: Subscription;

  errorCode = '404';
  withErrorCode = true;
  fromPage: string;
  fromPageArg: string;

  constructor(
    private titleService: Title,
    private route: ActivatedRoute
  ) {
  }

  private onParamsChange(params: Params): void {
    const {errorCode, withErrorCode, fromPage, fromPageArg} = params;

    if (withErrorCode) {
      this.withErrorCode = true;
      this.errorCode = errorCode;
      this.titleService.setTitle(`Error ${errorCode}`);
    } else if (fromPage) {
      this.withErrorCode = false;
      this.fromPage = fromPage;
      this.fromPageArg = fromPageArg;
    } else {
      this.titleService.setTitle(`Error${errorCode ? ` ${errorCode}` : ''}`);
    }


  }

  ngOnInit(): void {
    this.routeSub = this.route.queryParams.subscribe(this.onParamsChange.bind(this));
  }

}
