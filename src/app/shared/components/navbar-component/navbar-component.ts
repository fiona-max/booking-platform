import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage, CommonModule } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar-component',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NgOptimizedImage,
    FormsModule,
    TranslateModule
  ],
  templateUrl: './navbar-component.html',
  styleUrls: ['./navbar-component.scss']
})
export class NavbarComponent implements OnInit {
  // 🌐 Supported languages
  langs = [
    { code: 'en', label: 'EN' },
    { code: 'fr', label: 'FR' },
    { code: 'ar', label: 'AR' }
  ];

  currentLang = 'en';
  isDarkMode = false;

  constructor(private translate: TranslateService) {
    // Ensure all languages are registered
    this.translate.addLangs(this.langs.map(l => l.code));
    this.translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    // 🌍 Load saved language or detect from browser
    const savedLang = localStorage.getItem('lang');
    const browserLang = this.translate.getBrowserLang();
    const initialLang = savedLang || (browserLang?.match(/en|fr|ar/) ? browserLang : 'en');
    this.currentLang = initialLang;
    this.translate.use(initialLang);

    // 🌓 Load saved theme
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }

  // 🌗 Theme switcher
  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  // 🌐 Language switcher
  switchLang(lang: string): void {
    this.translate.use(lang);
    this.currentLang = lang;
    localStorage.setItem('lang', lang);
  }
}
