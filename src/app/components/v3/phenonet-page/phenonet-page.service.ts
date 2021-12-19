import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable()
export class PhenonetPageService {

  private disease = new BehaviorSubject<string>('');
  readonly disease$ = this.disease.asObservable();

  constructor() {
  }


  updateDisease(d: string): void {
    this.disease.next(d);
  }
}
