import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  // Looks for JSON translation files under /assets/i18n/
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
