export enum IncidentSize {
  STAFF_ONLY = 'StaffOnly',
  SMALL = 'Small',
  MEDIUM = 'Medium',
  LARGE = 'Large',
}

export function toHumanString(incidentSize: IncidentSize) {
  switch (incidentSize) {
    case IncidentSize.STAFF_ONLY: return 'Only staff are affected';
    case IncidentSize.SMALL:      return '1 customer/vendor account';
    case IncidentSize.MEDIUM:     return '2-5 customer/vendor accounts';
    case IncidentSize.LARGE:      return '5+ customer/vendor accounts';
  }
}
