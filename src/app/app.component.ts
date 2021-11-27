import {Component, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {interval, Subscription} from 'rxjs';
import {take} from 'rxjs/operators';
import FontFaceObserver from 'fontfaceobserver';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  constructor(private renderer: Renderer2){

    /**
     * Importing material icons for acquiring space for the icons
     */
    const keyword = 'icons-material';
    const materialIcons = new FontFaceObserver('Material Icons Round');
    materialIcons.load(null, 3000)
      .then(() => this.renderer.addClass(document.body, `${keyword}-loaded`))
      .catch(() => this.renderer.addClass(document.body, `${keyword}-error`));
  }

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

