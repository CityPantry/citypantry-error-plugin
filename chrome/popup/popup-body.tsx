import * as React from 'preact';
import { Report } from '../../models';

export interface PopupBodyProps {
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
      }
    };

    this.handleStringChange = this.handleStringChange.bind(this);
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

  handleSubmit(event) {
    alert('A value was submitted: ' + JSON.stringify(this.state.form));
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Name:
          <input type="text" value={this.state.form.name} onChange={this.handleStringChange('name')} />
        </label>
        <button type="submit">Go</button>
      </form>
    );
  }
}
