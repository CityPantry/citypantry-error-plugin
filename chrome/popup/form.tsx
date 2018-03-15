import * as React from 'preact';
import { Report, Urgency } from '../../models';
import { Metadata, Snapshot } from '../shared/state.interface';

export interface FormProps {
  metadata: Metadata;
  snapshot: Snapshot;
  onSubmit(report: Report): void;
  onReset(): void;
}

interface FormState {
  form: Partial<Report>;
}

export class Form extends React.Component<FormProps, FormState> {

  constructor(props: FormProps) {
    super(props);
    this.state = {
      form: {
        name: props.metadata.name || '',
        description: '',
        impact: '',
        affectedPeople: '',
        url: props.snapshot.url || '',
        time: props.snapshot.time || '',
        stepsToReproduce: '',
        currentUser: '',
        isMasquerading: false,
        consoleErrors: props.snapshot.debugData || '',
        screenshot: props.snapshot.screenshot,
        urgency: Urgency.LOW
      }
    };

    this.handleStringChange = this.handleStringChange.bind(this);
    this.handleBoolChange = this.handleBoolChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleStringChange(prop: keyof Report) {
    return (event) => {
      this.setState(({ form }) => ({
        form: {
          ...form,
          [prop]: event.target.value
        }
      }));
    }
  }

  handleBoolChange(prop: keyof Report) {
    return (event) => {
      this.setState(({ form }) => ({
        form: {
          ...form,
          [prop]: !!event.target.checked
        }
      }));
    }
  }

  handleChoiceChange(prop: keyof Report, value: any) {
    return () => this.setState(({ form }) => ({
      form: {
        ...form,
        [prop]: value
      }
    }));
  }

  handleSubmit(event) {
    event.preventDefault();

    // TODO Validation and error handling here

    this.props.onSubmit(this.state.form as Report);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <div>
          <label>
            Your Name:
            <input type="text" value={this.state.form.name} onChange={this.handleStringChange('name')}/>
          </label>
        </div>
        <div>
          <label>
            What's Wrong?
            <textarea type="text" value={this.state.form.description} onChange={this.handleStringChange('description')}/>
          </label>
        </div>
        <div>
          <label>
            Impact:
            <input type="text" value={this.state.form.impact} onChange={this.handleStringChange('impact')}/>
          </label>
        </div>
        <div>
          <label>
            Urgency:
            {/*<textarea type="text" value={this.state.form.consoleErrors} onChange={this.handleStringChange('consoleErrors')} />*/}
          </label>
        </div>
        <div>
          <label>
            Who does this affect? (You, customers, )
            <input type="text" value={this.state.form.affectedPeople} onChange={this.handleStringChange('affectedPeople')}/>
          </label>
        </div>
        <div>
          Urgency:
          <label>
            <input
              type="radio"
              name="urgency"
              checked={this.state.form.urgency === Urgency.LOW}
              onChange={this.handleChoiceChange('urgency', Urgency.LOW)}
            />
            This is annoying but it's not stopping me from doing my job
          </label>
          <label>
            <input
              type="radio"
              name="urgency"
              checked={this.state.form.urgency === Urgency.MEDIUM}
              onChange={this.handleChoiceChange('urgency', Urgency.MEDIUM)}
            />
            I can't do something I need to do in the next week
          </label>
          <label>
            <input
              type="radio"
              name="urgency"
              checked={this.state.form.urgency === Urgency.HIGH}
              onChange={this.handleChoiceChange('urgency', Urgency.HIGH)}
            />
            I can't do something I need to do by end of day
          </label>
          <label>
            <input
              type="radio"
              name="urgency"
              checked={this.state.form.urgency === Urgency.IMMEDIATE}
              onChange={this.handleChoiceChange('urgency', Urgency.IMMEDIATE)}
            />
            I can't do something that I need right now
          </label>
        </div>
        <div>
          <label>
            URL:
            <input type="text" value={this.state.form.url} onChange={this.handleStringChange('url')}/>
          </label>
        </div>
        <div>
        <label>
        Time:
        <input type="datetime" value={this.state.form.time} onChange={this.handleStringChange('time')} />
        </label>
        </div>
        <div>
          <label>
            Steps to Reproduce: (Describe what exactly you did before this error occurred)
            <textarea type="text" value={this.state.form.stepsToReproduce} onChange={this.handleStringChange('stepsToReproduce')}/>
          </label>
        </div>
        <div>
          <label>
            Current user:
            <input type="text" value={this.state.form.currentUser} onChange={this.handleStringChange('currentUser')}/>
          </label>
        </div>
        <div>
          <label>
            Are you masquerading?
            <input type="checkbox" checked={this.state.form.isMasquerading} onChange={this.handleBoolChange('isMasquerading')}/>
          </label>
        </div>
        <div>
          <label>
            Console Errors:
            <textarea type="text" value={this.state.form.consoleErrors} onChange={this.handleStringChange('consoleErrors')}/>
          </label>
        </div>
        <div>
          Screenshot:
          <div>
            <img src={this.state.form.screenshot} />
          </div>
        </div>
        <button type="button" onClick={this.props.onReset}>Reset</button>
        <button type="submit">Go</button>
      </form>
    );
  }
}
