import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

interface UserContext {
  name: string;
  email: string;
  professionalTitle: string;
  location: string;
}

@Component({
  selector: 'app-context',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './context.component.html',
  styleUrl: './context.component.scss'
})
export class ContextComponent {
  userContext: UserContext = {
    name: '',
    email: '',
    professionalTitle: '',
    location: ''
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { }

  onSubmit() {
    console.log('Form submitted:', this.userContext);
    // TODO: Save user context
    const nextRoute = this.route.snapshot.data['next'];
    this.router.navigate(['/' + nextRoute]);
  }
}
