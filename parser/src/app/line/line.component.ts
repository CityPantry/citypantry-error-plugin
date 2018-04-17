import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-line',
  template: `
    <ng-container [ngSwitch]="type">
      <app-object-line
        *ngSwitchCase="'object'"
        [name]="name"
        [trailingComma]="trailingComma"
        [value]="value"
      ></app-object-line>
      <app-array-line
        *ngSwitchCase="'array'"
        [name]="name"
        [trailingComma]="trailingComma"
        [value]="value"
      ></app-array-line>
      <app-primitive-line
        *ngSwitchCase="'primitive'"
        [name]="name"
        [trailingComma]="trailingComma"
        [value]="value"
      ></app-primitive-line>
    </ng-container>
  `,
  styles: []
})
export class LineComponent {

  @Input()
  public name: string;

  @Input()
  public value: any;

  @Input()
  public trailingComma: boolean = false;

  public get type(): 'object' | 'array' | 'primitive' {
    if (!this.value) {
      return 'primitive';
    }
    if (Array.isArray(this.value)) {
      return 'array';
    }
    if (typeof this.value === 'object') {
      return 'object';
    }
    return 'primitive';
  }
}
