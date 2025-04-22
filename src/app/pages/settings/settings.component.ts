import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface NotificationSetting {
    id: string;
    title: string;
    description: string;
    enabled: boolean;
}

interface ThemeSetting {
    id: string;
    title: string;
    value: string;
}

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">Settings</h1>

      <!-- Theme Settings -->
      <div class="card mb-8">
        <div class="card-body">
          <h2 class="text-xl font-semibold mb-4">Theme</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium">Color Theme</h3>
                <p class="text-sm text-gray-600">Choose your preferred color theme</p>
              </div>
              <select [(ngModel)]="selectedTheme" class="select">
                <option *ngFor="let theme of themes" [value]="theme.value">
                  {{ theme.title }}
                </option>
              </select>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium">Dark Mode</h3>
                <p class="text-sm text-gray-600">Toggle dark mode</p>
              </div>
              <label class="switch">
                <input type="checkbox" [(ngModel)]="darkMode">
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Notification Settings -->
      <div class="card mb-8">
        <div class="card-body">
          <h2 class="text-xl font-semibold mb-4">Notifications</h2>
          <div class="space-y-4">
            <div *ngFor="let setting of notificationSettings" class="flex items-center justify-between">
              <div>
                <h3 class="font-medium">{{ setting.title }}</h3>
                <p class="text-sm text-gray-600">{{ setting.description }}</p>
              </div>
              <label class="switch">
                <input type="checkbox" [(ngModel)]="setting.enabled">
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Privacy Settings -->
      <div class="card mb-8">
        <div class="card-body">
          <h2 class="text-xl font-semibold mb-4">Privacy</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium">Profile Visibility</h3>
                <p class="text-sm text-gray-600">Control who can see your profile</p>
              </div>
              <select [(ngModel)]="profileVisibility" class="select">
                <option value="public">Public</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium">Show Online Status</h3>
                <p class="text-sm text-gray-600">Display when you're active</p>
              </div>
              <label class="switch">
                <input type="checkbox" [(ngModel)]="showOnlineStatus">
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div class="flex justify-end">
        <button class="btn btn-primary">Save Changes</button>
      </div>
    </div>
  `,
    styles: [`
    .switch {
      position: relative;
      display: inline-block;
      width: 60px;
      height: 34px;
    }

    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: .4s;
      border-radius: 34px;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }

    input:checked + .slider {
      background-color: #2196F3;
    }

    input:checked + .slider:before {
      transform: translateX(26px);
    }

    .select {
      @apply px-3 py-2 border rounded-md;
    }
  `]
})
export class SettingsComponent {
    themes: ThemeSetting[] = [
        { id: '1', title: 'Light', value: 'light' },
        { id: '2', title: 'Dark', value: 'dark' },
        { id: '3', title: 'System', value: 'system' }
    ];

    selectedTheme = 'light';
    darkMode = false;
    profileVisibility = 'public';
    showOnlineStatus = true;

    notificationSettings: NotificationSetting[] = [
        {
            id: '1',
            title: 'Challenge Invitations',
            description: 'Get notified when you receive new challenge invitations',
            enabled: true
        },
        {
            id: '2',
            title: 'Tournament Updates',
            description: 'Receive updates about tournaments you\'re participating in',
            enabled: true
        },
        {
            id: '3',
            title: 'Achievement Unlocked',
            description: 'Get notified when you unlock new achievements',
            enabled: true
        },
        {
            id: '4',
            title: 'Friend Activity',
            description: 'See when friends complete challenges or join tournaments',
            enabled: false
        }
    ];
}
