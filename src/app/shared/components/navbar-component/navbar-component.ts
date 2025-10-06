import {Component, OnInit, Renderer2} from '@angular/core';

@Component({
  selector: 'app-navbar-component',
  imports: [],
  templateUrl: './navbar-component.html',
  styleUrl: './navbar-component.scss'
})
export class NavbarComponent implements OnInit {

  dark = false;

  constructor(private renderer: Renderer2) {}
  ngOnInit(): void {
  }

  toggleTheme() {
    this.dark = !this.dark;
    const root = document.documentElement;
    if (this.dark) {
      root.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
    }
  }

}
