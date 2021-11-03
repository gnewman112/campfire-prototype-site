import { Component, OnInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { OktaAuthService } from '@okta/okta-angular';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('hamburguerX', [
      state('hamburguer', style({})),
      state('topX', style({
        transform: 'rotate(45deg)', 
        transformOrigin: 'left',
        margin: '6px'
      })),
      state('hide', style({
        opacity: 0
      })),
      state('bottomX', style({
        transform: 'rotate(-45deg)',
        transformOrigin: 'left',
        margin: '6px'
      })),
      transition('* => *', [
        animate('0.2s')
      ]),
    ]),
  ],
})

export class AppComponent implements OnInit {
  title = 'Campfire';
  isAuthenticated: boolean;
  isHamburger: boolean = true;
  onAboutPage: boolean = false;

  constructor(public oktaAuth: OktaAuthService, private router: Router) {
    this.oktaAuth.$authenticationState.subscribe( 
      (isAuthenticated: boolean) => this.isAuthenticated = isAuthenticated
    );
  }

  ngOnInit(): void {
    this.oktaAuth.isAuthenticated().then( auth => {
      this.isAuthenticated = auth;
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && event.url.includes('about_this_site')) {
        this.onAboutPage = true;
      } else if (event instanceof NavigationEnd) {
        this.onAboutPage = false;
      }
      
    })
  }

  logout() {
    this.oktaAuth.logout('/login');
  }

  toggleIcon(open: boolean): void {
    this.isHamburger = !open;
  }
}