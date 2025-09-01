import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";

declare type modeType = 'determinate' | 'indeterminate';

@Injectable({
  providedIn: 'root'
})
export class ProgressBarService {

  private _auto$: BehaviorSubject<boolean>;
  private _mode$: BehaviorSubject<modeType>;
  private _progress$: BehaviorSubject<number>;
  private _show$: BehaviorSubject<boolean>;
  private _urlMap: Map<string, boolean>;
  /**
 * Constructor
 */
  constructor(private _httpClient: HttpClient) {

    //Initialize values
    this._auto$ = new BehaviorSubject<boolean>(true);
    this._mode$ = new BehaviorSubject<modeType>('indeterminate');
    this._progress$ = new BehaviorSubject<number>(0);
    this._show$ = new BehaviorSubject<boolean>(false);
    this._urlMap = new Map<string, boolean>();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Getter for auto mode
   */
  get auto$(): Observable<boolean> {
    return this._auto$.asObservable();
  }

  /**
   * Getter for mode
   */
  get mode$(): Observable<modeType> {
    return this._mode$.asObservable();
  }

  /**
   * Getter for progress
   */
  get progress$(): Observable<number> {
    return this._progress$.asObservable();
  }

  /**
   * Getter for show
   */
  get show$(): Observable<boolean> {
    return this._show$.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Show the loading bar
   */
  show(): void {
    this._show$.next(true);
  }

  /**
   * Hide the loading bar
   */
  hide(): void {
    this._show$.next(false);
  }

  /**
   * Set the auto mode
   *
   * @param value
   */
  setAutoMode(value: boolean): void {
    this._auto$.next(value);
  }

  /**
   * Set the mode
   *
   * @param value
   */
  setMode(value: modeType): void {
    this._mode$.next(value);
  }


  /**
   * Set the progress of the bar manually
   *
   * @param value
   */
  setProgress(value: number): void {
    if (value < 0 || value > 100) {
      console.error('Progress value must be between 0 and 100!');
      return;
    }

    this._progress$.next(value);
  }

  /**
   * Sets the loading status on the given url
   *
   * @param status
   * @param url
   */
  setLoadingStatus(url: string, status: boolean): void {

    //If url not provided, raise error
    if (!url) {
      console.error('Url Address required');
      return;
    }

    if (status === true) {
      this._urlMap.set(url, status);
      this._show$.next(true);
    } else if (status === false && this._urlMap.has(url)) {
      this._urlMap.delete(url);
    }

    // Only set the status to 'false' if all outgoing requests are completed
    if ( this._urlMap.size === 0 )
    {
        this._show$.next(false);
    }
  }
}
