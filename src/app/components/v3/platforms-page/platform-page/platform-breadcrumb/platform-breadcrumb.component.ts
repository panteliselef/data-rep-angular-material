import { Component, OnInit } from '@angular/core';
import {combineLatest, Observable} from 'rxjs';
import {PlatformPageService} from '../platform-page.service';
import {GPLEDGE, GPLNODE} from '../../../../../models/gplGraph.model';
import {map} from 'rxjs/operators';

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

  /**
   * @returns Observable<boolean> True if any edge or node is selected
   */
  get isEdgeNodeSelected$(): Observable<boolean> {
    return combineLatest([this.selectedNode$, this.selectedEdge$])
      .pipe(map(([a$, b$]) => typeof (a$ || b$) !== 'undefined'));
  }

  ngOnInit(): void {
    this.platform$ = this.platformService.technology$;
    this.selectedNode$ = this.platformService.selectedNode$;
    this.selectedEdge$ = this.platformService.selectedEdge$;
  }

}
