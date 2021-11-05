import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule, OnAuthRequired } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

//Okta Auth
import { OktaAuthModule, OKTA_CONFIG } from '@okta/okta-angular';

//Material Imports
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';

import { SharedModule } from './modules/shared/shared.module';
import { AppConfigService } from './services/app-config.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    OktaAuthModule,
    SharedModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatMenuModule
  ],
  providers: [
    { 
      provide: APP_INITIALIZER,
      multi: true,
      deps: [AppConfigService],
      useFactory: (appConfigService: AppConfigService) => {
        return () => {
          return appConfigService.loadAppConfig();
        }
      }
    },
    { 
      provide: OKTA_CONFIG,
      useFactory: (appConfigService: AppConfigService) => {
        const oktaConfig = {
          issuer: 'https://dev-847026.okta.com/oauth2/default',
          clientId: appConfigService.getOktaConfig(),
          redirectUri: window.location.origin + '/implicit/callback',
          pkce: true,
          onAuthRequired: OnAuthRequired,
          logo: 'assets\Name.png'
        }
        return oktaConfig
      },
      deps: [AppConfigService]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
