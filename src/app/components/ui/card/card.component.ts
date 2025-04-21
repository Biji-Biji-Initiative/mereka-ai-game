import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm dark:border-gray-700">
      <ng-content></ng-content>
    </div>
  `,
  styles: []
})
export class CardComponent { }

@Component({
  selector: 'app-card-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col space-y-1.5 p-6">
      <ng-content></ng-content>
    </div>
  `,
  styles: []
})
export class CardHeaderComponent { }

@Component({
  selector: 'app-card-title',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h3 class="text-2xl font-semibold leading-none tracking-tight text-gray-900 dark:text-gray-100">
      <ng-content></ng-content>
    </h3>
  `,
  styles: []
})
export class CardTitleComponent { }

@Component({
  selector: 'app-card-description',
  standalone: true,
  imports: [CommonModule],
  template: `
    <p class="text-sm text-gray-500 dark:text-gray-400">
      <ng-content></ng-content>
    </p>
  `,
  styles: []
})
export class CardDescriptionComponent { }

@Component({
  selector: 'app-card-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 pt-0">
      <ng-content></ng-content>
    </div>
  `,
  styles: []
})
export class CardContentComponent { }

@Component({
  selector: 'app-card-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center p-6 pt-0">
      <ng-content></ng-content>
    </div>
  `,
  styles: []
})
export class CardFooterComponent { }
