import { Component, signal } from '@angular/core';
import {RouterModule, RouterOutlet} from '@angular/router';
import {CommonModule} from '@angular/common';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('booking-app');

  constructor(private translate: TranslateService) {
    this.translate.addLangs(['en', 'fr', 'ar']);
    this.translate.setDefaultLang('en');

    const browserLang = translate.getBrowserLang();
    translate.use(browserLang?.match(/en|fr|ar/) ? browserLang : 'en');

  }
}
