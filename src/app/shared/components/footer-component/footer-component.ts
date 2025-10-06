import { Component } from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';

@Component({
  selector: 'app-footer-component',
  imports: [
    TranslateModule
  ],
  templateUrl: './footer-component.html',
  styleUrl: './footer-component.scss'
})
export class FooterComponent {
  year: string = '' + new Date().getFullYear() + ' ';

}
