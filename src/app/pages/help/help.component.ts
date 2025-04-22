import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface FAQItem {
    id: string;
    question: string;
    answer: string;
}

interface KeyboardShortcut {
    id: string;
    keys: string[];
    description: string;
}

@Component({
    selector: 'app-help',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">Help Center</h1>

      <!-- Search Section -->
      <div class="mb-8">
        <div class="relative">
          <input
            type="text"
            placeholder="Search for help..."
            class="w-full px-4 py-2 border rounded-lg"
          >
          <button class="absolute right-2 top-2">
            🔍
          </button>
        </div>
      </div>

      <!-- Quick Links -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="card cursor-pointer hover:shadow-lg transition-shadow">
          <div class="card-body">
            <h3 class="text-xl font-semibold mb-2">Getting Started</h3>
            <p class="text-gray-600">Learn the basics of AI Fight Club</p>
          </div>
        </div>
        <div class="card cursor-pointer hover:shadow-lg transition-shadow">
          <div class="card-body">
            <h3 class="text-xl font-semibold mb-2">Challenges</h3>
            <p class="text-gray-600">Understand how challenges work</p>
          </div>
        </div>
        <div class="card cursor-pointer hover:shadow-lg transition-shadow">
          <div class="card-body">
            <h3 class="text-xl font-semibold mb-2">Tournaments</h3>
            <p class="text-gray-600">Learn about tournament rules</p>
          </div>
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <div class="space-y-4">
          <div *ngFor="let faq of faqs" class="card">
            <div class="card-body">
              <h3 class="text-lg font-semibold mb-2">{{ faq.question }}</h3>
              <p class="text-gray-600">{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Keyboard Shortcuts -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold mb-4">Keyboard Shortcuts</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div *ngFor="let shortcut of keyboardShortcuts" class="card">
            <div class="card-body">
              <div class="flex items-center gap-2 mb-2">
                <span *ngFor="let key of shortcut.keys" class="px-2 py-1 bg-gray-100 rounded">
                  {{ key }}
                </span>
              </div>
              <p class="text-gray-600">{{ shortcut.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Support -->
      <div class="card">
        <div class="card-body">
          <h2 class="text-2xl font-bold mb-4">Still Need Help?</h2>
          <p class="text-gray-600 mb-4">
            Our support team is here to help you with any questions or issues you might have.
          </p>
          <button class="btn btn-primary">Contact Support</button>
        </div>
      </div>
    </div>
  `
})
export class HelpComponent {
    faqs: FAQItem[] = [
        {
            id: '1',
            question: 'How do I start a challenge?',
            answer: 'To start a challenge, navigate to the Challenges page and click on any available challenge. Follow the instructions provided to complete the challenge.'
        },
        {
            id: '2',
            question: 'How are scores calculated?',
            answer: 'Scores are based on your performance in various aspects of the challenge, including accuracy, speed, and adherence to best practices.'
        },
        {
            id: '3',
            question: 'Can I participate in multiple tournaments?',
            answer: 'Yes, you can participate in multiple tournaments simultaneously, as long as they don\'t have overlapping schedules.'
        }
    ];

    keyboardShortcuts: KeyboardShortcut[] = [
        {
            id: '1',
            keys: ['⌘', 'H'],
            description: 'Navigate to home page'
        },
        {
            id: '2',
            keys: ['⌘', 'D'],
            description: 'Navigate to dashboard'
        },
        {
            id: '3',
            keys: ['⌘', 'C'],
            description: 'Navigate to challenges'
        },
        {
            id: '4',
            keys: ['⌘', 'T'],
            description: 'Navigate to tournaments'
        },
        {
            id: '5',
            keys: ['⌘', 'R'],
            description: 'Navigate to results'
        },
        {
            id: '6',
            keys: ['⌘', '?'],
            description: 'Open help center'
        }
    ];
}
