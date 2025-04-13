import { BrowserModule } from '@angular/platform-browser';
import { NgModule, inject, provideAppInitializer } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { APP_BASE_HREF } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MudModule } from './mud/mud.module';
import { WINDOW_PROVIDERS } from './shared/WINDOW_PROVIDERS';
import { NonportalModule } from './nonportal/nonportal.module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ModelessModule } from './modeless/modeless.module';
// import { ServiceWorkerModule } from '@angular/service-worker';
// import { environment } from '../environments/environment';
import { MudConfigService } from './mud-config.service';
import { getBaseLocation } from './app-common-functions';
/* eslint @typescript-eslint/ban-types: "warn" */
export function setupAppConfigServiceFactory(
  service: MudConfigService,
): Function {
  // console.log("LOADING Config");
  return () => service.load();
}

@NgModule({ declarations: [AppComponent],
    bootstrap: [AppComponent], imports: [BrowserModule,
        MudModule,
        NonportalModule,
        ModelessModule,
        AppRoutingModule], providers: [
        WINDOW_PROVIDERS,
        CookieService,
        provideAppInitializer(() => {
        const initializerFn = (setupAppConfigServiceFactory)(inject(MudConfigService));
        return initializerFn();
      }),
        {
            provide: APP_BASE_HREF,
            useFactory: getBaseLocation,
        },
        provideHttpClient(withInterceptorsFromDi()),
    ] })
export class AppModule {}
