import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthFormComponent } from '../../../components/auth/auth-form/auth-form.component';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, AuthFormComponent],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent {

}
