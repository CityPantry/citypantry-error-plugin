import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-primitive-line',
  template: `
    {{ name }}: {{ value | json }}{{ trailingComma ? ',' : '' }}
  `,
  styles: [`:host { font-family: monospace }`]
})
export class PrimitiveLineComponent {

  @Input()
  public name: string;

  @Input()
  public value: any;

  @Input()
  public trailingComma: boolean = false;

}
