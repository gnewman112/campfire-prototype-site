import { Component, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { OktaAuthService } from '@okta/okta-angular';
import * as OktaSignIn from '@okta/okta-signin-widget';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  signIn: any;

  constructor(private oktaAuth: OktaAuthService, router: Router) {
    this.signIn = new OktaSignIn({
      baseUrl: 'https://dev-847026.okta.com/',
      logo: 'assets/Name.png',
      logoText: 'Campfire',
      brandName: 'Campfire',
      colors: {
        brand: '#689f38'
      },
      authParams: {
        pkce: true
      },
      helpLinks: {
        help: '/about-this-site'
      }
    });

    router.events.forEach(event => {
      if(event instanceof NavigationStart &&  (event.url == '/implicit/callback' || event.url == '/login') ) {
        this.signIn.remove();
      }
    })
  }

  ngOnInit(): void {
    this.signIn.renderEl({
      el: '#widget-container'
    },
    (res) => {
      if (res.status === 'SUCCESS') {
        this.oktaAuth.loginRedirect('/fora', {sessionToken: res.session.token});
        this.signIn.hide();
      }
    },
    (err) => {
      throw err;
    })
  }

}
