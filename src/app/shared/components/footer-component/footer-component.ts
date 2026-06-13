import { Component } from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {RouterLink} from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-footer-component',
  imports: [
    TranslateModule,
    RouterLink,
    LucideAngularModule
  ],
  templateUrl: './footer-component.html',
  styleUrl: './footer-component.scss'
})
export class FooterComponent {
  protected address: string = "Douala, Palais Dika Akwa";
  protected phoneNumber: string = "+640-234-326";
  protected currentYear: string = '' + new Date().getFullYear() + ' ';
  protected email : string = "contacts@alliance-society.com"
}
