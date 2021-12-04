import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-empty-illustration',
  templateUrl: './empty-illustration.component.html',
  styleUrls: ['./empty-illustration.component.scss']
})
export class EmptyIllustrationComponent implements OnInit {

  @Input() issueText = '';
  @Input() solutionText = '';

  constructor() {
  }

  ngOnInit(): void {
  }

}
