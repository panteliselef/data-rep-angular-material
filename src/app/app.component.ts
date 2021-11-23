import {Component, OnDestroy, OnInit} from '@angular/core';
import {interval, Subscription} from 'rxjs';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  isLoaded = false;
  private loadingSub: Subscription;


  async ngOnInit(): Promise<void> {
    this.loadingSub = interval(1000).pipe(take(1),
    ).subscribe( _ => this.isLoaded = true);
  }


  public ngOnDestroy(): void {
    this.loadingSub.unsubscribe();
  }
}

