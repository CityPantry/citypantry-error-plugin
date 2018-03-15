import * as React from 'preact';
import { Report, Urgency } from '../../models';

export interface PopupBodyProps {
  onSubmit(report: Report): void;
}

interface PopupBodyState {
  form: Report;
}

export class PopupBody extends React.Component<PopupBodyProps, PopupBodyState> {

  constructor(props: PopupBodyProps) {
    super(props);
    this.state = {
      form: {
        name: '',
        description: '',
        impact: '',
        affectedPeople: '',
        url: '',
        time: '',
        stepsToReproduce: '',
        //screenshot;
        currentUser: '',
        isMasquerading: false,
        consoleErrors: '',
        urgency: null
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

  handleSubmit(event) {
    event.preventDefault();

    this.props.onSubmit(this.state.form);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <div>
          <label>
            Your Name:
            <input type="text" value={this.state.form.name} onChange={this.handleStringChange('name')} />
          </label>
        </div>
        <div>
          <label>
            What's Wrong?
            <textarea type="text" value={this.state.form.description} onChange={this.handleStringChange('description')} />
          </label>
        </div>
        <div>
          <label>
            Impact:
            <input type="text" value={this.state.form.impact} onChange={this.handleStringChange('impact')} />
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
            <input type="text" value={this.state.form.affectedPeople} onChange={this.handleStringChange('affectedPeople')} />
          </label>
        </div>
        <div>
          <label>
            URL:
            <input type="text" value={this.state.form.url} onChange={this.handleStringChange('url')} />
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
            <textarea type="text" value={this.state.form.stepsToReproduce} onChange={this.handleStringChange('stepsToReproduce')} />
          </label>
        </div>
        <div>
          <label>
            Current user:
            <input type="text" value={this.state.form.currentUser} onChange={this.handleStringChange('currentUser')} />
          </label>
        </div>
        <div>
          <label>
            Are you masquerading?
            <input type="checkbox" checked={this.state.form.isMasquerading} onChange={this.handleBoolChange('name')} />
          </label>
        </div>
        <div>
          <label>
            Console Errors:
            <textarea type="text" value={this.state.form.consoleErrors} onChange={this.handleStringChange('consoleErrors')} />
          </label>
        </div>
        <button type="submit">Go</button>
      </form>
    );
  }
}
