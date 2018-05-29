import { Component, Input, OnInit } from '@angular/core';

interface StateEntry {
  type: 'state';
  index: number;
  state: object;
}

interface ActionEntry {
  type: 'action';
  action: {
    action: {
      type: string;
      payload: any;
    };
    type: 'PERFORM_ACTION';
  };
}

@Component({
  selector: 'app-redux-state',
  template: `
    <app-object-line
      name="Final State"
      [value]="lastState.state"
    ></app-object-line>
    
    <h3>Actions <button (click)="expanded = !expanded">Toggle</button></h3>
    
    <ng-container *ngFor="let action of actions">
      <div style="margin-left: 0.5rem; margin-bottom: 0.5rem">
        {{ action.action.action.type }}
          <p style="padding-left: 1rem">
            <app-object-line
              name="payload"
              [value]="action.action.action.payload"
            ></app-object-line>
        </p>
      </div>
    </ng-container>
    
    <app-object-line
      name="Initial State"
      [value]="firstState.state"
    ></app-object-line>
  `,
  styles: []
})
export class ReduxStateComponent {

  @Input()
  public reduxState: (StateEntry | ActionEntry)[];

  public expanded = false;

  public get firstState(): StateEntry | null {
    return (this.reduxState.filter((state) => state.type === 'state') as StateEntry[])[0] || null;
  }
  public get lastState(): StateEntry | null {
    return (this.reduxState.filter((state) => state.type === 'state') as StateEntry[])[0] || null;
  }
  public get actions(): ActionEntry[] {
    if (!this.expanded) {
      return [];
    }
    return this.reduxState.filter((state) => state.type === 'action').reverse() as ActionEntry[];
  }
}
