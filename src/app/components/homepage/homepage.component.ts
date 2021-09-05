import {Component, HostListener, Inject, OnInit, ViewChild} from '@angular/core';
import {DOCUMENT} from '@angular/common';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {

  constructor(@Inject(DOCUMENT) private document: Document) { }

  userHasScrolled = false;

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (document.body.scrollTop > 20 ||
      document.documentElement.scrollTop > 20) {
      this.userHasScrolled = true;
    }else {
      this.userHasScrolled = false;
    }
  }

  ngOnInit(): void {}

}
