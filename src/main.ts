import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routes } from './app/app.routes'; // Đảm bảo export routes từ app-routing.module.ts
import { HttpClientModule } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(RouterModule.forRoot(routes)),
    importProvidersFrom(HttpClientModule)
  ]
}).catch(err => console.error(err));
