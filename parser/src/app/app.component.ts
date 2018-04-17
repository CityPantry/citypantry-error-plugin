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
    <app-object-line *ngIf="data" [trailingComma]="false" name="root" [value]="data"></app-object-line>
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
