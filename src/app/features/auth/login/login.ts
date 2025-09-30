import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {AuthService} from '../../../core/services/auth/auth-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  email = '';
  password = '';

  constructor(private auth: AuthService) {}

  onLogin() {
    this.auth.login(this.email, this.password).subscribe({
      next: user => console.log('Logged in:', user),
      error: err => console.error(err)
    });
  }
}
