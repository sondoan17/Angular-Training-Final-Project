import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AuthService } from './app/services/auth.service';
import { authInterceptor } from './app/http-client.config';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(AuthService),
    importProvidersFrom(RouterModule.forRoot(routes)),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
  ],
}).catch((err) => console.error(err));
