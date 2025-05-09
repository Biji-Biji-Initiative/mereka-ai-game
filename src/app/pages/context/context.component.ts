import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { GoogleMapsService } from '../../services/google-maps.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-context',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './context.component.html',
  styleUrl: './context.component.scss'
})
export class ContextComponent implements OnInit {
  contextForm: FormGroup;
  isSubmitting = false;
  locationSuggestions: any[] = [];
  showSuggestions = false;
  isEditMode = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private googleMapsService: GoogleMapsService,
    private fb: FormBuilder
  ) {
    this.contextForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      professionalTitle: ['', [Validators.required, Validators.minLength(2)]],
      location: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  async ngOnInit() {
    this.setupLocationAutocomplete();
    await this.loadExistingUserData();
  }

  private async loadExistingUserData() {
    const userId = this.userService.getCurrentUserId();
    if (!userId) return;

    try {
      const user = await this.userService.getUser(userId);
      if (user) {
        this.isEditMode = true;
        this.contextForm.patchValue({
          name: user.name,
          email: user.email,
          professionalTitle: user.professionalTitle,
          location: user.location
        }, { emitEvent: false });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  private setupLocationAutocomplete() {
    this.contextForm.get('location')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(value => this.googleMapsService.getPlacePredictions(value))
      )
      .subscribe(predictions => {
        this.locationSuggestions = predictions;
        this.showSuggestions = predictions.length > 0;
      });
  }

  get formControls() {
    return this.contextForm.controls;
  }

  selectLocation(suggestion: any) {
    this.showSuggestions = false;
    this.contextForm.patchValue({
      location: suggestion.description
    }, { emitEvent: false });
  }

  async onSubmit() {
    if (this.contextForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    try {
      const userId = this.userService.getCurrentUserId();
      if (!userId) {
        // Create new user if no userId exists
        await this.userService.createUser(this.contextForm.value);
      } else {
        // Update existing user
        await this.userService.updateUser(userId, this.contextForm.value);
        window.history.back();
        return;
      }

      const nextRoute = this.route.snapshot.data['next'];
      this.router.navigate([nextRoute]);
    } catch (error) {
      console.error('Error saving context:', error);
    } finally {
      this.isSubmitting = false;
    }
  }
}
