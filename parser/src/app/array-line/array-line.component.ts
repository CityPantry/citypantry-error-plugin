import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-array-line',
  template: `
    <span [class.collapsible]="value?.length" (click)="toggle()">{{ name }}</span>: [
    <ul *ngIf="value?.length && !collapsed">
      <li *ngFor="let entry of value; index as i; last as last" [ngSwitch]="type(entry)">
        <app-line [name]="i" [value]="entry" [trailingComma]="!last"></app-line>
      </li>
    </ul>
    <span *ngIf="value?.length && collapsed">... ({{ value.length }})</span>
    ]{{ trailingComma ? ',' : '' }}
  `,
  styles: [`:host { font-family: monospace } ul { padding-left: 1em } .collapsible { text-decoration: underline; cursor: pointer }`]
})
export class ArrayLineComponent {

  @Input()
  public name: string;

  @Input()
  public value: any[];

  @Input()
  public trailingComma: boolean = false;

  public collapsed: boolean = true;

  public toggle(): void {
    this.collapsed = !this.collapsed;
  }

  public type(value: any): 'object' | 'array' | 'primitive' {
    if (!value) {
      return 'primitive';
    }
    if (Array.isArray(value)) {
      return 'array';
    }
    if (typeof value === 'object') {
      return 'object';
    }
    return 'primitive';
  }

}
