import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppHeaderComponent } from './components/layout/app-header/app-header.component';
import { ScrollService } from './services/scroll.service';
import { LoadingComponent } from './components/loading/loading.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppHeaderComponent, LoadingComponent],
  template: `
    <app-loading></app-loading>
    <app-app-header></app-app-header>
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    main {
      flex: 1;
    }
  `]
})
export class AppComponent implements OnInit {
  constructor(private scrollService: ScrollService) { }

  ngOnInit() {
    // The ScrollService will automatically handle scrolling on navigation
  }
}
