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
        consoleErrors: '',
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
      <form
        class="form"
        style="padding: 8px;"
        onSubmit={this.handleSubmit}
      >
        <div class="form-group">
          <label class="form-group__label">
            Your Name:
            <input
              class="form-input"
              type="text"
              value={this.state.form.name}
              onChange={this.handleStringChange('name')}/>
          </label>
        </div>
        <div class="form-group">
          <label class="form-group__label">
            What's Wrong?
            <textarea
              class="form-input"
              type="text"
              value={this.state.form.description}
              onChange={this.handleStringChange('description')}
            />
          </label>
        </div>
        <div class="form-group">
          <label class="form-group__label">
            Impact:
            <input
              class="form-input"
              type="text"
              value={this.state.form.impact}
              onChange={this.handleStringChange('impact')}/>
          </label>
        </div>
        {/* TODO add console errors */}
        {/*<div class="form-group">*/}
        {/*<label class="form-group__label">*/}
        {/*Console Errors: */}
        {/*<textarea type="text" value={this.state.form.consoleErrors} onChange={this.handleStringChange('consoleErrors')} />*/}
        {/*</label>*/}
        {/*</div>*/}
        <div class="form-group">
          <label class="form-group__label">
            Who does this affect? (You, customers, everyone...)
            <input
              class="form-input"
              type="text"
              value={this.state.form.affectedPeople}
              onChange={this.handleStringChange('affectedPeople')}
            />
          </label>
        </div>
        <div class="form-group">
          Urgency:
          <label class="form-choice">
            <input
              class="form-choice__input"
              type="radio"
              name="urgency"
              checked={this.state.form.urgency === Urgency.LOW}
              onChange={this.handleChoiceChange('urgency', Urgency.LOW)}
            />
            <span class="form-choice__label">This is annoying but it's not stopping me from doing my job</span>
          </label>
          <label class="form-choice">
            <input
              class="form-choice__input"
              type="radio"
              name="urgency"
              checked={this.state.form.urgency === Urgency.MEDIUM}
              onChange={this.handleChoiceChange('urgency', Urgency.MEDIUM)}
            />
            <span class="form-choice__label">I can't do something I need to do in the next week</span>
          </label>
          <label class="form-choice">
            <input
              class="form-choice__input"
              type="radio"
              name="urgency"
              checked={this.state.form.urgency === Urgency.HIGH}
              onChange={this.handleChoiceChange('urgency', Urgency.HIGH)}
            />
            <span class="form-choice__label">I can't do something I need to do by end of day</span>
          </label>
          <label class="form-choice">
            <input
              class="form-choice__input"
              type="radio"
              name="urgency"
              checked={this.state.form.urgency === Urgency.IMMEDIATE}
              onChange={this.handleChoiceChange('urgency', Urgency.IMMEDIATE)}
            />
            <span class="form-choice__label">I can't do something that I need right now</span>
          </label>
        </div>
        <div class="form-group">
          <label class="form-group__label">
            URL:
            <input
              class="form-input"
              type="text"
              value={this.state.form.url}
              onChange={this.handleStringChange('url')}
            />
          </label>
        </div>
        <div class="form-group">
          <label class="form-group__label">
            Time:
            <input
              class="form-input"
              type="datetime"
              value={this.state.form.time}
              onChange={this.handleStringChange('time')}
            />
          </label>
        </div>
        <div class="form-group">
          <label class="form-group__label">
            Steps to Reproduce: (Describe what exactly you did before this error occurred)
            <textarea
              class="form-input"
              type="text"
              value={this.state.form.stepsToReproduce}
              onChange={this.handleStringChange('stepsToReproduce')}
            />
          </label>
        </div>
        <div class="form-group">
          <label class="form-group__label">
            Current user:
            <input
              class="form-input"
              type="text"
              value={this.state.form.currentUser}
              onChange={this.handleStringChange('currentUser')}
            />
          </label>
        </div>
        <div class="form-group">
          <label class="form-group__label">
            Are you masquerading?
            <input
              class="form-input"
              type="checkbox"
              checked={this.state.form.isMasquerading}
              onChange={this.handleBoolChange('isMasquerading')}
            />
          </label>
        </div>
        <div class="form-group">
          <label class="form-group__label">
            Console Errors:
            <textarea
              class="form-input"
              type="text"
              value={this.state.form.consoleErrors}
              onChange={this.handleStringChange('consoleErrors')}
            />
          </label>
        </div>
        <div class="form-group">
          Screenshot:
          <div style="width: 100%;">
            <img src={this.state.form.screenshot}/>
          </div>
        </div>
        <button
          class="button-link"
          style="padding-bottom: 1rem;"
          type="button"
          onClick={this.props.onReset}
        >
          Reset
        </button>
        <button
          class="button button--primary button--fullwidth"
          type="submit"
        >
          Submit bug report
        </button>
      </form>
    );
  }
}
