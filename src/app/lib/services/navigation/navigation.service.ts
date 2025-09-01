import { Injectable } from '@angular/core';
import { RouterEvent, NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  private previousUrl: string = undefined;
  private currentUrl: string = undefined;

  constructor(private router : Router) {
    this.currentUrl = this.router.url;
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.url;
      };
    });
  }

  public getPreviousUrl(){
    return this.previousUrl;
  }    

  //prev navigation, Behind the scenes, we are pushing to history the previous url
  public goToPrevious(): void {
    let previous = this.getPreviousUrl();
    
    if (previous) {
      this.router.navigateByUrl(previous)
    }
  }
}
