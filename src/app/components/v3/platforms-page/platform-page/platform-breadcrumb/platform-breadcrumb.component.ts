import {Component, OnInit} from '@angular/core';
import {combineLatest, Observable} from 'rxjs';
import {PlatformPageService} from '../platform-page.service';
import {GplData, GPLEDGE, GPLNODE} from '../../../../../models/gplGraph.model';
import {map} from 'rxjs/operators';

function areTheyConnected(graph: GplData, nodeId1: string, nodeId2: string): boolean {

  function getNeighbors(nodeId: string): [string] {
    return graph.edges
      .filter(edge => (edge.to === nodeId || edge.from === nodeId))
      .map(edge => nodeId === edge.to ? edge.from : edge.to) as [string];
  }

  const node1Neigh = getNeighbors(nodeId1);
  // console.log(nodeId1, node1Neigh);
  const node2Neigh = getNeighbors(nodeId2);
  // console.log(nodeId2, node2Neigh);
  let foundNode;
  if (node1Neigh.length > node2Neigh.length) {
    foundNode = node2Neigh.find(node => nodeId1 === node);
  } else {
    foundNode = node1Neigh.find(node => nodeId2 === node);
  }
  return !!foundNode;
}

@Component({
  selector: 'app-platform-breadcrumb',
  templateUrl: './platform-breadcrumb.component.html',
  styleUrls: ['./platform-breadcrumb.component.scss']
})
export class PlatformBreadcrumbComponent implements OnInit {
  platform$: Observable<string>;
  selectedNode$: Observable<GPLNODE>;
  selectedEdge$: Observable<GPLEDGE>;
  selectedEdgeSignificance$: Observable<number>;

  constructor(
    private platformService: PlatformPageService,
  ) {
  }

  /**
   * @returns Observable<boolean> True if any edge or node is selected
   */
  get isEdgeNodeSelected$(): Observable<boolean> {
    return combineLatest([this.selectedNode$, this.selectedEdge$])
      .pipe(map(([a$, b$]) => typeof (a$ || b$) !== 'undefined'));
  }

  ngOnInit(): void {

    this.selectedEdgeSignificance$ = combineLatest(
      [this.platformService.maxSliderValue$, this.platformService.selectedEdge$]
    )
      .pipe(map(([max, edge]) => {
        const graphSnapShot = this.platformService.graphSnapshot;
        if (!graphSnapShot) {
          return;
        }

        const getPos = (node1: string, node2: string): number => {
          const isConnected = areTheyConnected(graphSnapShot, node1, node2);
          if (!isConnected) {
            return -1;
          }


          const binarySearch = (original: number, left: number, filteredGraph: GplData): number => {
            // console.log('searching in', left, original);
            const area = Math.floor((original + 1 - left) / 2);
            if (area === 0) {
              // console.log('finally found at', left, original);
              return left;
            }
            const fGraph = this.platformService.filterGraph(filteredGraph, left);

            const found = areTheyConnected(fGraph, node1, node2);
            // console.log('area', area, found);

            if (found) {
              return binarySearch(left, left - area, filteredGraph);
            } else {
              // console.log('sum', left, area, left + area);
              // debugger;
              return binarySearch(original, left + area, filteredGraph);
            }

          };
          return binarySearch(max, 0, graphSnapShot);
        };

        if (edge) {
          return getPos((edge.from as GPLNODE).id, (edge.to as GPLNODE).id);
        }

        return 0;
      }));


    this.platform$ = this.platformService.technology$;
    this.selectedNode$ = this.platformService.selectedNode$;
    this.selectedEdge$ = this.platformService.selectedEdge$;
  }

}
