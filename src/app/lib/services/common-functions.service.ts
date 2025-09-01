import { Injectable } from '@angular/core';
import { dropdown } from '@config/dropdown.config';

@Injectable({
  providedIn: 'root'
})
export class CommonFunctionsService {

  Dropdown: dropdown = new dropdown()
  constructor() { }

  public SumInsuredArray() {
    let AmountList = [{ Text: '-- select --', Value: '-1' }]
    for (let item of this.Dropdown.SumInsuredButtonOptions) {
      AmountList.push({ Text: item.name, Value: item.value })
    }

    return AmountList
  }

  public motorPolicyTypeArray() {
    let motorPolicyType = [{ Text: '-- select --', Value: '-1' }]
    for (let item of this.Dropdown.MotorPolicyTypeButtonOptions) {
      motorPolicyType.push({ Text: item.name, Value: item.value })
    }

    return motorPolicyType
  }

  public LifePolicyTypeArray() {
    let LifePolicyType = [{ Text: '-- select --', Value: '-1' }]
    for (let item of this.Dropdown.MotorPolicyTypeButtonOptions) {
      LifePolicyType.push({ Text: item.name, Value: item.value })
    }

    return LifePolicyType
  }

  public statusArray() {
    let statusType = [{ Text: '-- select --', Value: '-1' },
    { Text: 'InProgress', Value: '0' },
    { Text: 'Complete', Value: '1' },
    { Text: 'UnderWriter', Value: '2' },
    { Text: 'Wait Transaction', Value: '10' },]

    return statusType
  }

  public statusArrayForMotor() {
    let statusType = [{ Text: '-- select --', Value: '-1' },
    { Text: 'InProgress', Value: '0' },
    { Text: 'Complete', Value: '1' },
    { Text: 'Break-In', Value: '2' },
    { Text: 'Rejected', Value: '3' },
    { Text: 'Wait Transaction', Value: '10' },
    ]

    return statusType
  }

  public RFQrequestType() {
    let requestType = [{ Text: '-- select --', Value: '' },
    { Text: 'New', Value: 'New' },
    { Text: 'Send Back', Value: 'Send Back' },
    ]
    return requestType
  }

  public YesNoOption() {
    let requestType = [{ Text: '-- select --', Value: '' },
    { Text: 'Yes', Value: 'Yes' },
    { Text: 'No', Value: 'No' },
    ]
    return requestType
  }

  public MotorPolicyStatus() {
    let status = [{ Text: '-- select --', Value: '-1' }]
    for (let item of this.Dropdown.MotorPolicyStatusButtonOptions) {
      status.push({ Text: item.name, Value: item.value })
    }

    return status
  }

  public healthPolicyStatus() {
    let status = [{ Text: '-- select --', Value: '' }]
    for (let item of this.Dropdown.HealthPolicyStatusButtonOptions) {
      status.push({ Text: item.name, Value: item.value })
    }

    return status
  }

  public LifeRfqStatus() {
    let status = [{ Text: '-- select --', Value: '-1' }]
    for (let item of this.Dropdown.LifeRfqStatusOptions) {
      status.push({ Text: item.name, Value: item.value })
    }

    return status
  }

  public TravelRfqStatus() {
    let status = [{ Text: '-- select --', Value: '-1' }]
    for (let item of this.Dropdown.TravelRfqStatusOptions) {
      status.push({ Text: item.name, Value: item.value })
    }

    return status
  }

  public MarineRfqStatus() {
    let status = [{ Text: '-- select --', Value: '-1' }]
    for (let item of this.Dropdown.MarineRfqStatusOptions) {
      status.push({ Text: item.name, Value: item.value })
    }

    return status
  }

  public DownloadPolicy(response, pdfName = 'policy') {
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(response);
    a.href = objectUrl;
    a.download = pdfName + '.pdf';
    a.click();
    URL.revokeObjectURL(objectUrl);
  }
}
