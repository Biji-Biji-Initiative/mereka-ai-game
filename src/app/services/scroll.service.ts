import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  constructor(private router: Router) {
    // Subscribe to router events to detect navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.scrollToTop();
    });
  }

  /**
   * Scrolls the window to the top of the page
   * @param behavior The scrolling behavior ('auto' or 'smooth')
   */
  scrollToTop(behavior: ScrollBehavior = 'auto'): void {
    window.scrollTo({
      top: 0,
      behavior
    });
  }

  /**
   * Scrolls to a specific element by ID
   * @param elementId The ID of the element to scroll to
   * @param behavior The scrolling behavior ('auto' or 'smooth')
   */
  scrollToElement(elementId: string, behavior: ScrollBehavior = 'smooth'): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior });
    }
  }
}
