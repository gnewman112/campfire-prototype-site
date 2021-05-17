import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, EMPTY, from, Observable, of, throwError } from 'rxjs';
import { catchError, flatMap, map, take, tap } from 'rxjs/operators';
import { RedditStream } from '../../utility-classes/account_classes';
import { Link, RedditComment } from '../../utility-classes/reddit_classes';
import { OktaAuthService } from '@okta/okta-angular';
import { Router } from '@angular/router';
import { AppConfigService } from 'src/app/services/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class RedditService {
  public subredditMap: Map<string, object>;
  public subredditNames: Array<string>;
  public baseSubreddits: Array<string>;
  public redditAccountExists: BehaviorSubject<boolean> = new BehaviorSubject(null);

  private apiBaseUrl: string;

  constructor(
    public oktaAuth: OktaAuthService,
    private http: HttpClient,
    private router: Router,
    private appConfig: AppConfigService
  ) {
    this.apiBaseUrl = this.appConfig.apiBaseUrl;
    this.subredditMap = new Map();
  }

  private request(method: string, relativeUrl: string, options?: { data?: any, headers?: HttpHeaders}) {
    let token$ = from(this.oktaAuth.getAccessToken());

    let result$ = token$.pipe(
      flatMap(token => {
        if (!token) { this.router.navigate(['/login']); return null; }

        let headers: HttpHeaders;
        if (options && options.headers) { headers = options.headers} else { headers = new HttpHeaders() }
        const _headers = headers.append( 'Authorization', `Bearer ${token}`);
    
        const data = options?.data ? options.data : undefined;
        const url = this.apiBaseUrl + relativeUrl;
        
        const result = this.http.request(method, url, {
          body: data,
          responseType: 'json',
          observe: 'body',
          headers: _headers
        }).pipe(
          catchError( (err, caught) => {
            if (err instanceof HttpErrorResponse && err.status == 401) {
              this.router.navigate(['/login']);
              return EMPTY;
            } else if (err instanceof HttpErrorResponse && err.status == 403) {
              this.redditAccountExists.next(false);
              return EMPTY
            } else { return throwError(err); }
          })
        );
  
        return result;
      })
    );

    return result$;
  }

  addRedditAccount(): void {
    this.request('get', '/api/reddit/oauth_start').subscribe((response: {url: string}) => {
      if (response.url) {
        window.open(response.url, '_self', 'noopener');
      } else { throw new Error('No redirect url received. Unable to add new account')}
    })
  }

  getSubreddits(refresh?: boolean): Observable<string[]> {
    if (!this.subredditMap.size || refresh) {
      let subredditResponse$ = this.request('get', '/api/reddit/subreddits').pipe(
        map( (subredditObjects: Array<any>) => {
          Object.values(subredditObjects).forEach(object => { this.subredditMap.set(object.display_name, object);})
          this.subredditNames = Array.from(this.subredditMap.keys()).sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
          });
          return this.subredditNames;
        }),
        tap( (subredditNames) => {
          if (subredditNames.length) {
            this.baseSubreddits = Array.of('Home', 'All');
          }
        }),
        take(1)
      );
      return subredditResponse$;
    } else if (this.subredditNames.length) {
      return of(this.subredditNames);
    } else {
      return;
    }
  }

  /**
   * Will get 100 reddit posts. If stream.after is set, will get the next 100 posts.
   * @param stream The RedditStream describing the sparks to fetch
   */
  sparkStream(stream: RedditStream): Observable<[Array<Link>, string, RedditStream]> {
    if (!stream.sort) { throw new Error( 'Field "sort" in stream must be defined to request posts from Reddit')}
    if (!stream.subreddit) { throw new Error( 'Field "subreddit" in stream must be defined to request posts from Reddit')}

    let _headers = new HttpHeaders()
      .append('subreddit', stream.subreddit)
      .append('sort', stream.sort);
    if (stream.time) { _headers = _headers.append('time', stream.time); }
    if (stream.after) { _headers = _headers.append('after', stream.after); }

    let sparkStream$: Observable<[Array<Link>, string, RedditStream]> = this.request('get', '/api/reddit/spark_feed', {headers: _headers}).pipe(
      map((response: {sparks: Array<Object>, after: string}) => {
        let returnSparks: Array<Link> = new Array();
        response.sparks.forEach(responseObject => {
          returnSparks.push(new Link(responseObject))
        });

        return [returnSparks, response.after, stream];
      })
    )
    return sparkStream$;
  }

  commentStream(name: string): Observable<Array<RedditComment>> {
    let headers = new HttpHeaders().append('submissionname', name);

    let commentStream$: Observable<Array<RedditComment>> = this.request('get', '/api/reddit/submission_comments', {headers: headers}).pipe( 
      map( (response: Array<Object>) => {
        let comments: Array<RedditComment> = new Array();
        response.forEach( res => {
          comments.push(new RedditComment(res));
        })
        return comments;
      })
    )

    return commentStream$;
  }

  /** 
   * Submits a new vote to reddit or changes an existing vote
   * @param like True for upvote. False for downvote
   * @param likes The current state. Most likely spark.likes
   * @param name The name of the post or comment Most likely spark.name
   */ 
  vote(like: boolean, likes: boolean, name: string): boolean {
    let dir: string, result: boolean;
    if ( like == likes ) {
      dir = '0';
      result = null;
    } else if (like) {
      dir = '1';
      result = like;
    } else {
      dir = '-1';
      result = like;
    }

    let headers = new HttpHeaders().append('id', name).append('dir', dir);
    this.request('get', '/api/reddit/vote', {headers: headers}).subscribe(
      res => console.log(res),
      err => console.error(err)
    );
    
    return result;
  }
}