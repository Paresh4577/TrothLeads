import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  private ls = window.localStorage;

  constructor() { }

  public setItem(key: string, value: unknown) {
    let valueStr = JSON.stringify(value);
    this.ls.setItem(key, valueStr);
    return true;
  }

  public getItem(key: string) {
    const value = this.ls.getItem(key);
    try {
      if (!value) {
        return null;
      } 
      return JSON.parse(value);
    } catch (e) {
      return null;
    }
  }

  public removeItem(key: string) {
    this.ls.removeItem(key);
  }

  public clear() {
    this.ls.clear();
  }

}
