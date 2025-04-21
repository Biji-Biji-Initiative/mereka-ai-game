import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthFormComponent } from '../../../components/auth/auth-form/auth-form.component';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, AuthFormComponent],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {

}
