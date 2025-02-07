import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import {HttpClientModule, provideHttpClient, withFetch, withInterceptors} from "@angular/common/http";
import {provideAnimationsAsync} from "@angular/platform-browser/animations/async";
import {importProvidersFrom} from "@angular/core";

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(HttpClientModule), // Add HttpClientModule here
    ...appConfig.providers, provideAnimationsAsync(),  // Spread existing providers from appConfig
  ]
}).catch((err) => console.error(err));

