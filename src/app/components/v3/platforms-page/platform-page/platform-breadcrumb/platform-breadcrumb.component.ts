import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {PlatformPageService} from '../platform-page.service';
import {GPLEDGE, GPLNODE} from '../../../../../models/gplGraph.model';

@Component({
  selector: 'app-platform-breadcrumb',
  templateUrl: './platform-breadcrumb.component.html',
  styleUrls: ['./platform-breadcrumb.component.scss']
})
export class PlatformBreadcrumbComponent implements OnInit {
  platform$: Observable<string>;
  selectedNode$: Observable<GPLNODE>;
  selectedEdge$: Observable<GPLEDGE>;

  constructor(
    private platformService: PlatformPageService,
  ) {  }

  ngOnInit(): void {
    this.platform$ = this.platformService.technology$;
    this.selectedNode$ = this.platformService.selectedNode$;
    this.selectedEdge$ = this.platformService.selectedEdge$;

    this.platformService.selectedEdge$.subscribe(console.log);
  }

}
