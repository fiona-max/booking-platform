import { Component } from '@angular/core';
import {NavbarComponent} from '../../shared/components/navbar-component/navbar-component';
import {FooterComponent} from '../../shared/components/footer-component/footer-component';

@Component({
  selector: 'app-landing-page',
  imports: [
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss'
})
export class LandingPage {

}
