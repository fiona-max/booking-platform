import {Component, OnInit, Renderer2} from '@angular/core';
import {RouterLink} from '@angular/router';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-navbar-component',
  imports: [
    RouterLink,
    NgOptimizedImage
  ],
  templateUrl: './navbar-component.html',
  styleUrl: './navbar-component.scss'
})
export class NavbarComponent implements OnInit {

  isDarkMode = false;

  constructor() {}
  ngOnInit(): void {
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }

}
