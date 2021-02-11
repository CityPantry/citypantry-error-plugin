Hello Form

<script lang="ts">
// import * as React from 'preact';
// import { IncidentSize, Report, toHumanString } from '../../models';
// import { Metadata, Snapshot } from '../shared/state.interface';
// import { generateRandomAffectedPeople } from './affected-people';
//
// export interface FormProps {
//   metadata: Metadata;
//   snapshot: Snapshot;
//   form: Partial<Report> | null;
//   onSubmit(report: Report): void;
//   onReset(): void;
//   onUpdate(form: Partial<Report>): void;
// }
//
// interface FormState {
//   form: Partial<Report>;
//   canEditCurrentUser;
//   submitted: boolean;
//   invalidFields: string[];
//   affectedPeoplePlaceholder: string;
// }
//
// type PropertyNamesOfType<U, T> = { [K in keyof U]: U[K] extends T ? K : never }[keyof U];
//
// export class Form extends React.Component<FormProps, FormState> {
//
//   constructor(props: FormProps) {
//     super(props);
//     const form = props.form || {
//       name: props.metadata.name || '',
//       email: props.metadata.email || '',
//       summary: '',
//       description: '',
//       affectedPeople: props.snapshot?.currentUser?.simpleName || '',
//       incidentSize: IncidentSize.STAFF_ONLY,
//       url: props.snapshot.url || '',
//       time: props.snapshot.time || '',
//       stepsToReproduce: '',
//       currentUser: props.snapshot.currentUser?.name || '',
//       isMasquerading: props.snapshot.isMasquerading,
//       consoleErrors: props.snapshot.debugData || '',
//       screenshot: props.snapshot.screenshot,
//     };
//     this.state = {
//       form,
//       canEditCurrentUser: !props.snapshot.currentUser || !props.snapshot.isCityPantryUrl,
//       submitted: false,
//       invalidFields: this.getInvalidFields(form),
//       affectedPeoplePlaceholder: generateRandomAffectedPeople().join(', '),
//     };
//
//     this.handleStringChange = this.handleStringChange.bind(this);
//     this.handleBoolChange = this.handleBoolChange.bind(this);
//     this.handleSubmit = this.handleSubmit.bind(this);
//     this.removeScreenshot = this.removeScreenshot.bind(this);
//   }
//
//   handleStringChange(prop: PropertyNamesOfType<Report, string>) {
//     return (event) => {
//       this.updateForm({
//         [prop]: event.target.value
//       });
//     }
//   }
//
//   handleBoolChange(prop: PropertyNamesOfType<Report, boolean>) {
//     return (event) => {
//       this.updateForm({
//         [prop]: !!event.target.checked
//       });
//     }
//   }
//
//   handleChoiceChange(prop: keyof Report, value: any) {
//     return () => this.updateForm({
//       [prop]: value
//     });
//   }
//
//   removeScreenshot() {
//     this.updateForm({
//       screenshot: null
//     });
//   }
//
//   updateForm(newValue: Partial<Report>): void {
//     this.setState(({ form }) => {
//       const newForm = {
//         ...form,
//         ...newValue
//       };
//       return {
//         form: newForm,
//         invalidFields: this.getInvalidFields(newForm)
//       }
//     });
//     this.props.onUpdate(this.state.form);
//   }
//
//   handleSubmit(event) {
//     event.preventDefault();
//
//     if (!this.state.submitted) {
//       this.setState((state) => ({
//         ...state,
//         submitted: true
//       }));
//     }
//
//     if (this.state.invalidFields.length) {
//       return;
//     }
//
//     this.props.onSubmit(this.state.form as Report);
//   }
//
//   getInvalidFields(form: Partial<Report>): string[] {
//     return Object.keys(form).filter((key) => {
//       if (key === 'screenshot' || key === 'consoleErrors') {
//         return false;
//       }
//       if (!this.validate(form[key as keyof Report])) {
//         return true;
//       }
//       return false;
//     });
//   }
//
//   isValid(key: keyof Report): boolean {
//     return !this.state.submitted || this.state.invalidFields.indexOf(key) < 0;
//   }
//
//   validate(value: any): boolean {
//     if (typeof value === 'boolean') {
//       return true;
//     }
//     return !!`${value || ''}`.trim();
//   }
//
//   getClassName(key: keyof Report): string {
//     return 'form-input' + (this.isValid(key) ? '' : ' form-input--error');
//   }
//
//   render() {
//     return (
//       <form
//         class="form"
//         style="padding: 8px;"
//         onSubmit={this.handleSubmit}
//       >
//         <div class="d-flex align-items-center mb-standard">
//           <h2 class="mb-0">Submit a Bug Report</h2>
//           <button class="ml-auto button button--secondary" onClick={this.props.onReset}>Reset</button>
//         </div>
//         <div class="form-group">
//           Your Name: {this.state.form.name}
//         </div>
//         <div class="form-group">
//           <label class="form-group__label">
//             URL
//           </label>
//           <input
//             className={this.getClassName('url')}
//             type="text"
//             value={this.state.form.url}
//             onChange={this.handleStringChange('url')}
//           />
//           <p style={{fontSize: '1rem'}} class="mt-small mb-large">Not the right page?
//             <button
//               class="button-link ml-small"
//               type="button"
//               onClick={this.props.onReset}
//             >
//               Create a new report
//             </button>
//           </p>
//         </div>
//
//         <div class="form-group">
//           <label class="form-group__label">
//             Summary: What's Wrong?
//           </label>
//           <p class="form-group__sub-label">
//             In a few words, state what the problem is.
//           </p>
//           <input
//             className={this.getClassName('summary')}
//             type="text"
//             value={this.state.form.summary}
//             maxLength={70}
//             onChange={this.handleStringChange('summary')}
//             placeholder="Error when checking out cart"
//           />
//         </div>
//
//         <div class="form-group">
//           <label class="form-group__label">
//             Details
//           </label>
//           <p class="form-group__sub-label">
//             Give us any more information you have on what the problem is.
//           </p>
//           <textarea
//             className={this.getClassName('description')}
//             type="text"
//             value={this.state.form.description}
//             onChange={this.handleStringChange('description')}
//             placeholder="I'm trying to check out a cart for tomorrow. When I click the checkout button it should take me to the next page but nothing happens."
//             rows={4}
//           />
//         </div>
//         <div class="form-group">
//           <label class="form-group__label">
//             Affected People
//           </label>
//           <p class="form-group__sub-label">
//             Who is affected by this bug? Please provide customer, vendor or user names.
//           </p>
//           <input
//             className={this.getClassName('affectedPeople')}
//             type="text"
//             value={this.state.form.affectedPeople}
//             onChange={this.handleStringChange('affectedPeople')}
//             placeholder={this.state.affectedPeoplePlaceholder}
//           />
//         </div>
//         <div class="form-group">
//           <label class="form-group__label">
//             Incident Size
//           </label>
//           <p class="form-group__sub-label">
//             How many people are affected?
//           </p>
//           <label class="form-choice mb-small">
//             <input
//               class="form-choice__input"
//               type="radio"
//               name="incidentSize"
//               checked={this.state.form.incidentSize === IncidentSize.STAFF_ONLY}
//               onChange={this.handleChoiceChange('incidentSize', IncidentSize.STAFF_ONLY)}
//             />
//             <span class="form-choice__label">{toHumanString(IncidentSize.STAFF_ONLY)}</span>
//           </label>
//           <label class="form-choice">
//             <input
//               class="form-choice__input"
//               type="radio"
//               name="incidentSize"
//               checked={this.state.form.incidentSize === IncidentSize.SMALL}
//               onChange={this.handleChoiceChange('incidentSize', IncidentSize.SMALL)}
//             />
//             <span class="form-choice__label">{toHumanString(IncidentSize.SMALL)}</span>
//           </label>
//           <label class="form-choice">
//             <input
//               class="form-choice__input"
//               type="radio"
//               name="incidentSize"
//               checked={this.state.form.incidentSize === IncidentSize.MEDIUM}
//               onChange={this.handleChoiceChange('incidentSize', IncidentSize.MEDIUM)}
//             />
//             <span class="form-choice__label">{toHumanString(IncidentSize.MEDIUM)}</span>
//           </label>
//           <label class="form-choice">
//             <input
//               class="form-choice__input"
//               type="radio"
//               name="incidentSize"
//               checked={this.state.form.incidentSize === IncidentSize.LARGE}
//               onChange={this.handleChoiceChange('incidentSize', IncidentSize.LARGE)}
//             />
//             <span class="form-choice__label">{toHumanString(IncidentSize.LARGE)}</span>
//           </label>
//         </div>
//         <div class="form-group">
//           <label class="form-group__label">
//             Time
//           </label>
//           <p class="form-group__sub-label">
//             When did this occur?
//           </p>
//           <input
//             className={this.getClassName('time')}
//             type="datetime-local"
//             value={this.state.form.time}
//             onChange={this.handleStringChange('time')}
//           />
//         </div>
//         <div class="form-group">
//           <label class="form-group__label">
//             Steps to Reproduce
//           </label>
//           <p class="form-group__sub-label">
//             Describe what exactly you did before this error occurred
//           </p>
//           <textarea
//             className={this.getClassName('stepsToReproduce')}
//             type="text"
//             value={this.state.form.stepsToReproduce}
//             onChange={this.handleStringChange('stepsToReproduce')}
//             rows={4}
//             placeholder={"1. Went to the vendor page\n2. added some items to the cart\n3. edited the notes\n4. clicked checkout"}
//           />
//         </div>
//         { this.state.canEditCurrentUser ?
//         <div class="form-group">
//           <label class="form-group__label">
//             Current user:
//           </label>
//           <label class="toggle-input">
//             <span class="toggle-input__label">I am masquerading </span>
//             <input
//               class="toggle-input__input"
//               type="checkbox"
//               checked={this.state.form.isMasquerading}
//               onChange={this.handleBoolChange('isMasquerading')}
//             />
//             <span class="toggle-input__toggle"></span>
//           </label>
//           <div>
//             <input
//               className={this.getClassName('currentUser')}
//               type="text"
//               value={this.state.form.currentUser}
//               onChange={this.handleStringChange('currentUser')}
//               placeholder={this.state.form.isMasquerading ? 'Zoe from Ovo' : 'Myself'}
//             />
//           </div>
//         </div> :
//         <div class="form-group">
//           <label class="form-group__label">
//             Current user:
//             <input
//               class="form-input"
//               type="text"
//               disabled={true}
//               value={(this.state.form.isMasquerading ? 'Masquerading as ' : '') + this.state.form.currentUser }
//             />
//           </label>
//         </div> }
//         <div class="form-group">
//           <label class="form-group__label">
//             Console Errors
//           </label>
//           <textarea
//             className={this.getClassName('consoleErrors')}
//             type="text"
//             style={{fontFamily: 'monospace'}}
//             value={this.state.form.consoleErrors}
//             onChange={this.handleStringChange('consoleErrors')}
//             placeholder={'To open the console:\nMac: Cmd + Alt+ J\nWindows: Ctrl + Shift + J'}
//             rows={5}
//           />
//         </div>
//         { this.state.form.screenshot ?
//         <div class="form-group">
//           <div class="d-flex">
//             <label class="form-group__label d-flex">
//               Screenshot
//             </label>
//
//             <span class="form-choice d-inline-block ml-auto">
//               <button
//                 type="button"
//                 class="button-link"
//                 onClick={this.removeScreenshot}
//               >Remove</button>
//             </span>
//           </div>
//           <div style="width: 100%">
//             <img src={this.state.form.screenshot}/>
//           </div>
//         </div> : null }
//         { this.state.submitted && this.state.invalidFields.length ?
//           <p style="color: #e93131" className="mb-standard">
//             Please fill out all fields.
//           </p> : null }
//         <button
//           class="button button--primary button--fullwidth"
//           type="submit"
//         >
//           Submit bug report
//         </button>
//       </form>
//     );
//   }
// }
</script>
