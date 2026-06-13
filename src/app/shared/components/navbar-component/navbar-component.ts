import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { LocationService } from '../../../core/services/location.service';

@Component({
  selector: 'app-navbar-component',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    TranslateModule,
    LucideAngularModule
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
  protected isMenuOpen: boolean = false;
  protected userAvatar: any;

  // 📍 Location and Currency signals linked to shared service
  userLocation = computed(() => this.locationService.selectedLocation());
  userCurrency = computed(() => this.locationService.selectedCurrency());

  constructor(
    private translate: TranslateService,
    private locationService: LocationService
  ) {
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

    // 📍 Detect location and currency
    this.locationService.getCurrencyFromIP().subscribe();
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

  // 💰 Currency switcher (cycles through common currencies for demo)
  toggleCurrency(): void {
    const currencies = ['USD', 'EUR', 'GBP', 'AED', 'SAR', 'JPY'];
    const currentIndex = currencies.indexOf(this.userCurrency());
    const nextIndex = (currentIndex + 1) % currencies.length;
    this.locationService.updateCurrency(currencies[nextIndex]);
  }
}
