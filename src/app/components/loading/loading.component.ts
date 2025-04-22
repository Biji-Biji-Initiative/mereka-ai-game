import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../services/loading.service';

@Component({
    selector: 'app-loading',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div *ngIf="isLoading" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg text-center">
        <div class="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-700 font-medium">Loading...</p>
      </div>
    </div>
  `
})
export class LoadingComponent implements OnInit {
    isLoading = false;

    constructor(private loadingService: LoadingService) { }

    ngOnInit() {
        this.loadingService.loading$.subscribe(loading => {
            this.isLoading = loading;
        });
    }
}
