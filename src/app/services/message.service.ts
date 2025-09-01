import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root' // Ye service automatically app me available ho jayegi
})
export class MessageService {
  private noRecordMessage: string = "No Record Found"; // Common message

  constructor() {}

  getNoRecordMessage(): string {
    return this.noRecordMessage;
  }
}
