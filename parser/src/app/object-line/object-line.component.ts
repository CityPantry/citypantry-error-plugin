import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-object-line',
  template: `
    <span [class.collapsible]="keys?.length" (click)="toggle()">{{ name }}</span>: {{'{'}}
    <ul *ngIf="keys?.length && !collapsed">
      <li *ngFor="let key of keys; last as last">
        <app-line [name]="key" [value]="value[key]" [trailingComma]="!last"></app-line>
      </li>
    </ul>
    <span *ngIf="keys?.length && collapsed">...</span>
    {{'}'}}{{ trailingComma ? ',' : '' }}
  `,
  styles: [`:host { font-family: monospace } ul { padding-left: 1em } .collapsible { text-decoration: underline; cursor: pointer }`]
})
export class ObjectLineComponent {

  @Input()
  public name: string;

  @Input()
  public value: object;

  @Input()
  public trailingComma: boolean = false;

  public collapsed: boolean = true;

  public get keys(): string[] {
    return this.value ? Object.keys(this.value) : [];
  }

  public toggle(): void {
    this.collapsed = !this.collapsed;
  }
}
