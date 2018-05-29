import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  template: `
    <h1>Error Parser</h1>
    <form
      (submit)="onSubmit(url.value)"
    >
      <label>Enter URL of the error log:
        <input type="url" #url />
      </label>
      <button type="submit">Submit</button>
    </form>
    <div *ngIf="isLoading">Loading...</div>
    <!--<code *ngIf="data"><pre>{{ data | json }}</pre></code>-->
    <ng-container *ngIf="data">
      <h2>Console Logs</h2>
      <app-array-line *ngIf="data.console?.length" trailingComma="false" name="console" [value]="data.console"></app-array-line>
      <p *ngIf="!data.console?.length">None available</p>
      
      <h2>Network Requests</h2>
      <app-object-line [trailingComma]="false" name="xhr" [value]="data.xhr"></app-object-line>
      
      <h2>Redux</h2>
      <app-redux-state [reduxState]="data.redux"></app-redux-state>
    </ng-container>
  `,
  styles: []
})
export class AppComponent {

  public isLoading: boolean = false;
  public data: any;

  constructor(
    private http: HttpClient
  ) {}

  public onSubmit(url): void {
    this.isLoading = true;
    this.http.get(url).subscribe((data: any) => {
      this.isLoading = false;
      this.data = data;
    }, undefined, () => this.isLoading = false);
  }
}
