import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';


export const DEPTH_DEGREE_ARR = [1, 2 , 3 , 'all'] as const;
export type DEPTH_DEGREE = typeof DEPTH_DEGREE_ARR[any];

@Injectable({
  providedIn: 'root'
})
export class GraphFilterBarService {

  // Make _puppiesSource private so it's not accessible from the outside,
  // expose it as puppies$ observable (read-only) instead.
  // Write to _puppiesSource only through specified store methods below.
  private depthDegree = new BehaviorSubject<DEPTH_DEGREE>(1);

  // Exposed observable (read-only).
  readonly depthDegree$ = this.depthDegree.asObservable();

  constructor() {}

  // Get last value without subscribing to the puppies$ observable (synchronously).
  getDepthDegree(): DEPTH_DEGREE {
    return this.depthDegree.getValue();
  }

  private _setDepthDegree(degree: DEPTH_DEGREE): void {
    this.depthDegree.next(degree);
  }

  updateDepthDegree(degree: DEPTH_DEGREE): void {
    this._setDepthDegree(degree);
  }
}
