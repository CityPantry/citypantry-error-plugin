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
  canEditCurrentUser;
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
        currentUser: props.snapshot.currentUser && props.snapshot.currentUser.name || '',
        isMasquerading: props.snapshot.isMasquerading,
        consoleErrors: props.snapshot.debugData || '',
        screenshot: props.snapshot.screenshot,
        urgency: Urgency.LOW
      },
      canEditCurrentUser: !props.snapshot.currentUser
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
        <h2>Submit a Bug Report</h2>
        <div class="form-group">
          Your Name: {this.state.form.name}
        </div>
        <div class="form-group">
          <label class="form-group__label">
            URL
          </label>
          <input
            class="form-input"
            type="text"
            value={this.state.form.url}
            onChange={this.handleStringChange('url')}
          />
          <p style={{fontSize: '1rem'}} class="mt-small mb-large">Not the right page?
            <button
              class="button-link ml-small"
              type="button"
              onClick={this.props.onReset}
            >
              Create a new report
            </button>
          </p>
        </div>

        <div class="form-group">
          <label class="form-group__label">
            What's Wrong?
          </label>
          <p class="form-group__sub-label">
            Write a short summary of what should happen vs. what actually happens.
          </p>
          <textarea
            class="form-input"
            type="text"
            value={this.state.form.description}
            onChange={this.handleStringChange('description')}
            placeholder="I'm trying to check out a cart for tomorrow. When I click the checkout button it should take me to the next page but nothing happens."
            rows={4}
          />
        </div>
        <div class="form-group">
          <label class="form-group__label">
            Impact
          </label>
          <p class="form-group__sub-label">
            What impact is the bug having on you?
          </p>
          <input
            class="form-input"
            type="text"
            value={this.state.form.impact}
            onChange={this.handleStringChange('impact')}
            placeholder="I can't check out this cart."
          />
        </div>
        <div class="form-group">
          <label class="form-group__label">
            Affected People
          </label>
          <p class="form-group__sub-label">
            Who is affected by this bug?
          </p>
          <input
            class="form-input"
            type="text"
            value={this.state.form.affectedPeople}
            onChange={this.handleStringChange('affectedPeople')}
            placeholder="Customers and account managers"
          />
        </div>
        <div class="form-group">
          <label class="form-group__label">
            Urgency
          </label>
          <p class="form-group__sub-label">
            How badly is this affecting your work?
          </p>
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
            Time
          </label>
          <p class="form-group__sub-label">
            When did this occur?
          </p>
          <input
            class="form-input"
            type="datetime-local"
            value={this.state.form.time}
            onChange={this.handleStringChange('time')}
          />
        </div>
        <div class="form-group">
          <label class="form-group__label">
            Steps to Reproduce
          </label>
          <p class="form-group__sub-label">
            Describe what exactly you did before this error occurred
          </p>
          <textarea
            class="form-input"
            type="text"
            value={this.state.form.stepsToReproduce}
            onChange={this.handleStringChange('stepsToReproduce')}
            rows={4}
            placeholder={"1. Went to the vendor page\n2. added some items to the cart\n3. edited the notes\n4. clicked checkout"}
          />
        </div>
        { this.state.canEditCurrentUser ?
        <div class="form-group">
          <label class="form-group__label">
            Current user:
          </label>
          <label class="toggle-input">
            <span class="toggle-input__label">Masquerading</span>
            <input
              class="toggle-input__input"
              type="checkbox"
              checked={this.state.form.isMasquerading}
              onChange={this.handleBoolChange('isMasquerading')}
            />
            <span class="toggle-input__toggle"></span>
          </label>
          <div>
            <input
              class="form-input"
              type="text"
              value={this.state.form.currentUser}
              onChange={this.handleStringChange('currentUser')}
              placeholder={this.state.form.isMasquerading ? 'Zoe from Ovo' : 'Myself'}
            />
          </div>
        </div> :
        <div class="form-group">
          <label class="form-group__label">
            Current user:
            <input
              class="form-input"
              type="text"
              disabled={true}
              value={(this.state.form.isMasquerading ? 'Masquerading as ' : '') + this.state.form.currentUser }
            />
          </label>
        </div> }
        <div class="form-group">
          <label class="form-group__label">
            Console Errors
          </label>
          <textarea
            class="form-input"
            type="text"
            style={{fontFamily: 'monospace'}}
            value={this.state.form.consoleErrors}
            onChange={this.handleStringChange('consoleErrors')}
            rows={5}
          />
        </div>
        <div class="form-group">
          <label class="form-group__label">
            Screenshot
          </label>
          <div style="width: 100%;">
            <img src={this.state.form.screenshot}/>
          </div>
        </div>
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
