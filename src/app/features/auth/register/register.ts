import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth-service';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  email = '';
  password = '';

  constructor(private auth: AuthService) {}
  // toggleDarkMode(): void {
  //   this.isDarkMode = !this.isDarkMode;
  //   if (this.isDarkMode) {
  //     this.renderer.addClass(document.body, 'dark');
  //     localStorage.setItem('theme', 'dark');
  //   } else {
  //     this.renderer.removeClass(document.body, 'dark');
  //     localStorage.setItem('theme', 'light');
  //   }
  // }

  onSubmit(form: any) {
    if (form.valid) {
      console.log('Form submitted', form.value);
    }
  }
  onRegister() {
    this.auth.register(this.email, this.password).subscribe({
      next: user => console.log('Registered:', user),
      error: err => console.error(err)
    });
  }
}
