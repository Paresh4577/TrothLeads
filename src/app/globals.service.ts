import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root' // Makes it available app-wide
})
  //cehck
export class GlobalsService {
  public canRead: boolean = false;
  public canWrite: boolean = false;
  public canDelete: boolean = false;

  constructor() {
    this.loadPermissions();
  }

  loadPermissions() {
    this.canRead = localStorage.getItem('canread') === 'true';
    this.canWrite = localStorage.getItem('canwrite') === 'true';
    this.canDelete = localStorage.getItem('candelete') === 'true';
  }

  hasFullAccess(): boolean {
    return this.canRead && this.canWrite && this.canDelete;
  }
}
