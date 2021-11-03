# campfire-prototype-site

Screenshots of this project are on my resume website [here](https://gregnewman.info/#ExampleWebsite).

## Introduction

'campfire-prototype-site' was the first website I ever made and my first Angular project. I have included it here as a sample of my work.

## Where to start

Either use the file structure diagram included below as a guide, or I'd recommend starting with the following two files. They showcase my ability to manage complexity and break problems into simple manageable steps (in both cases with Observables).

[src/app/modules/fora/components/ember/ember.component.ts](https://github.com/gnewman112/campfire-prototype-site/blob/main/src/app/modules/fora/components/ember/ember.component.ts)

[src/app/modules/fora/services/reddit/reddit.service.ts](https://github.com/gnewman112/campfire-prototype-site/blob/main/src/app/modules/fora/services/reddit/reddit.service.ts)


## Project Status

This project is currently on hold. This code is the first live version of the website. Some edits have been made since, but it is largely the same.

The next steps are:
  * Rebuilding the 'spark' and 'fullpagespark' components as several more reusable components
  * Adding to 'about-this-site' (mirroring changes to 'About This Site' on my other website)
  * Cleaning up/improving the CSS
    

## Built With

Frontend:
* Angular 9 (typescript, HTML, SCSS)
* Angular Material
* [Okta Angular SDK](https://npmjs.com/package/@okta/okta-angular)
* [InfiniteScrollModule](https://www.npmjs.com/package/ngx-infinite-scroll)

Backend:
* Node
* Express
* MongoDB

## Goals

1. Teach myself full stack web development
2. Create a platform without ads and with content displayed in a larger format (currently all from Reddit.com)
3. Demonstrate my ability to quickly learn distinctly different skills (I'm a mechanical engineer)

## Project Structure

For simplicity some files/folders are ommited below.

```
|-- src
    |-- app
    |    |-- components
    |        |-- [+] about-this-site
    |        |-- [+] home
    |        |-- [+] login
    |        |-- [+] page-not-found
    |    |-- modules
    |        |-- fora
    |        |    |-- components
    |        |        |-- [+] add-ember-menu
    |        |        |-- [+] comment
    |        |        |-- [+] ember
    |        |        |-- [+] ember-pagination
    |        |        |-- [+] fullpagespark
    |        |        |-- [+] spark
    |        |    |-- [+] directives
    |        |    |-- [+] services
    |        |    |-- [+] utility-classes
    |        |    |-- fora-routing.module.ts
    |        |    |-- fora.component.ts
    |        |    |-- fora.module.ts
    |        |-- [+] shared
    |    |-- services
    |        |-- app-config.service.ts
    |    |-- app-routing.module.ts
    |    |-- app.component.ts
    |    |-- app.module.ts
    |-- [+] assets
    |-- [+] environments
    |-- favicon.png
    |-- index.html
    |-- proxy.conf.json
    |-- styles.scss
    |-- theme.scss
```


### Thank you for visiting!
