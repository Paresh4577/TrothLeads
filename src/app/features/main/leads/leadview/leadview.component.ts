import { Component } from '@angular/core';
import { LeadService } from '../lead.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-leadview',
  standalone: false,
  templateUrl: './leadview.component.html',
  styleUrl: './leadview.component.scss',
})
export class LeadviewComponent {
  private reminderTimeouts: { [key: string]: any } = {};
  private reminderTimeout: any;
  statusOptions = [
    'Attempted To Contact',
    'Contact In Future',
    'Contacted',
    'Not Contacted',
    'In Progress',
    'Junk Lead',
    'Lost Lead',
    'Converted',
    'Dropped',
  ];
  statusControl!: FormControl;

  lead: any;
  followUpForm!: FormGroup;
  leadId!: number;
  userName: any;
  followUps: any[] = [];
  constructor(
    private fb: FormBuilder,
    private leadService: LeadService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.statusControl = new FormControl('');
    this.leadId = Number(this.route.snapshot.paramMap.get('id'));
    this.userName = localStorage.getItem('token');
    console.log("username is", this.userName)
    this.fetchFollowUps(this.leadId);
    this.followUpForm = this.fb.group({
      Comment: ['', Validators.required],
      EnableReminder: [false],
      ReminderDateTime: [''],
    });

    // Clear reminder date if checkbox is unchecked
    this.followUpForm.get('EnableReminder')?.valueChanges.subscribe((enabled: boolean) => {
      if (!enabled) {
        this.followUpForm.get('ReminderDateTime')?.reset();
      }
    });

    if (this.leadId) {
      this.fetchLeadDetails();
    }
    this.statusControl.setValue(this.lead?.Status);
  }

  fetchFollowUps(leadId: number) {
    const payload = { LeadId: leadId };
    this.leadService.getFollowUps(payload).subscribe((res: any) => {
      if (res?.status === 'success' && res?.responseData) {
        this.followUps = JSON.parse(res.responseData);
        console.log("followups", this.followUps)
        this.scheduleExistingReminders();
      }
    });
  }

  // ✅ NEW METHOD: Schedule reminders for follow-ups fetched from database
  scheduleExistingReminders() {
    const now = new Date().getTime();

    this.followUps.forEach((followUp: any) => {
      // Only schedule reminders for follow-ups that have a future reminder time
      if (followUp.reminder_date_time) {
        const reminderTime = new Date(followUp.reminder_date_time).getTime();

        // Only schedule if reminder is in the future
        if (reminderTime > now) {
          this.scheduleReminder(
            followUp.FollowUpId,
            followUp.Comment,
            followUp.reminder_date_time
          );
        }
      }
    });
  }

  fetchLeadDetails() {
    this.leadService.getLeadById(this.leadId).subscribe({
      next: (res: any) => {
        if (res?.responseData) {
          const parsed = JSON.parse(res.responseData);
          this.lead = parsed.length ? parsed[0] : null;
          console.log('Lead Details:', this.lead);
          if (this.lead?.Status) {
            this.statusControl.setValue(this.lead.Status);
          }
        }
      },
      error: (err) => {
        console.error('Failed to load lead', err);
      },
    });
  }

  addFollowUp() {
    if (this.followUpForm.valid) {
      console.log('Form Values:', this.followUpForm.value);
      const payload = {
        LeadId: this.leadId,
        Comment: this.followUpForm.value.Comment,
        CreatedBy: 999, // Static for now
        ReminderDateTime: this.followUpForm.value.EnableReminder ? this.followUpForm.value.ReminderDateTime : null,
      };
      console.log('Payload:', payload);

      this.leadService.addFollowUp(payload).subscribe((res: any) => {
        console.log("res", res);
        if (res.status === 'success') {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Note added',
            confirmButtonColor: '#3085d6'
          });
          const followUp = res.responseData ? JSON.parse(res.responseData) : null;

          // Schedule reminder for the newly added follow-up
          if (payload.ReminderDateTime) {
            this.scheduleReminder(followUp.FollowUpId, payload.Comment, payload.ReminderDateTime);
          }

          this.followUpForm.reset();
          this.fetchFollowUps(this.leadId); // This will also refresh reminders
          this.fetchLeadDetails(); // Refresh if needed
        } else {
          alert('Failed: ' + res.message);
        }
      });
    }
  }

  scheduleReminder(followUpId: number, comment: string, reminderDateTime: string) {
    const reminderTime = new Date(reminderDateTime).getTime();
    const now = new Date().getTime();
    const delay = reminderTime - now;

    if (delay > 0) {
      // Clear any existing reminder for this follow-up
      if (this.reminderTimeouts[followUpId]) {
        clearTimeout(this.reminderTimeouts[followUpId]);
      }

      this.reminderTimeouts[followUpId] = setTimeout(() => {
        Swal.fire({
          title: 'Follow-up Reminder',
          text: comment,
          icon: 'info',
          showCancelButton: true,
          confirmButtonText: 'Okay',
          cancelButtonText: 'Snooze',
          buttonsStyling: true,
          customClass: {
            confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mr-2',
            cancelButton: 'bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600',
          },
        }).then((result) => {
          if (result.isConfirmed) {
            // Okay button: Clear the timeout and optionally clear from database
            this.removeReminder(followUpId);
            // Optionally, you can clear the reminder from database by setting ReminderDateTime to null
            // this.clearReminderFromDatabase(followUpId);
          } else if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel) {
            // Snooze button: Prompt for new date/time
            Swal.fire({
              title: 'Snooze Reminder',
              html: `
                <label for="snooze-time" class="block text-sm font-medium text-gray-700 mb-2">
                  Select new reminder time
                </label>
                <input type="datetime-local" id="snooze-time"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required>
              `,
              showCancelButton: true,
              confirmButtonText: 'Set Snooze',
              cancelButtonText: 'Cancel',
              customClass: {
                confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mr-2',
                cancelButton: 'bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600',
              },
              preConfirm: () => {
                const newTime = (document.getElementById('snooze-time') as HTMLInputElement).value;
                if (!newTime) {
                  Swal.showValidationMessage('Please select a date and time');
                  return false;
                }
                return newTime;
              },
            }).then((snoozeResult: any) => {
              if (snoozeResult.isConfirmed && snoozeResult.value) {
                // Clear the old timeout
                this.removeReminder(followUpId);
                // Update ReminderDateTime in the backend
                this.updateFollowUpReminder(followUpId, snoozeResult.value).subscribe(() => {
                  // Schedule new reminder
                  this.scheduleReminder(followUpId, comment, snoozeResult.value);
                });
              }
            });
          }
        });
      }, delay);

      console.log(`Reminder scheduled for follow-up ${followUpId} in ${delay}ms`);
    } else {
      console.log('Reminder time is in the past or invalid:', reminderDateTime);
    }
  }

  removeReminder(followUpId: number) {
    if (this.reminderTimeouts[followUpId]) {
      clearTimeout(this.reminderTimeouts[followUpId]);
      delete this.reminderTimeouts[followUpId];
      console.log(`Reminder removed for follow-up ${followUpId}`);
    }
  }

  // ✅ OPTIONAL: Method to clear reminder from database
  clearReminderFromDatabase(followUpId: number) {
    const payload = {
      FollowUpId: followUpId,
      ReminderDateTime: null, // or empty string based on your API
      UpdatedBy: 999,
    };

    this.leadService.addFollowUp(payload).subscribe((res: any) => {
      if (res.type === 'Success') {
        console.log('Reminder cleared from database');
        // Refresh follow-ups to reflect the change
        this.fetchFollowUps(this.leadId);
      }
    });
  }

  updateFollowUpReminder(followUpId: number, newReminderDateTime: string) {
    // Find the existing follow-up to preserve its data
    const existingFollowUp = this.followUps.find(f => f.FollowUpId === followUpId);

    const payload = {
      FollowUpId: followUpId,
      LeadId: existingFollowUp?.LeadId || this.leadId,
      Comment: existingFollowUp?.Comment || '',
      CreatedBy: existingFollowUp?.CreatedBy || 999,
      ReminderDateTime: newReminderDateTime, // Only update this field
      UpdatedBy: 999,
    };
    return this.leadService.addFollowUp(payload);
  }

  // ✅ REMOVED: Old localStorage-based methods are commented out and can be deleted

  ngOnDestroy(): void {
    // Clear all active reminders when component is destroyed
    Object.keys(this.reminderTimeouts).forEach(key => {
      clearTimeout(this.reminderTimeouts[key]);
    });
    this.reminderTimeouts = {};

    if (this.reminderTimeout) {
      clearTimeout(this.reminderTimeout);
    }
  }
  goBack() {
    this.router.navigate(['leadlist'])
  }

  // updateStatus() {
  //   const payload = {
  //     LeadId: this.leadId,
  //     Status: this.statusControl.value,
  //     UpdatedBy: 999,
  //   };

  //   this.leadService.updateLeadStatus(payload).subscribe((res: any) => {
  //     console.log("res", res)
  //     if (res?.status === '200') {
  //       alert('Lead status updated');
  //       this.fetchLeadDetails(); // reload updated details
  //     } else {
  //       alert('Failed to update status');
  //       this.fetchLeadDetails();
  //     }
  //     this.fetchLeadDetails();
  //   });
  // }

  updateStatus() {
    const oldStatus = this.lead?.Status;
    const newStatus = this.statusControl.value;
    const payload = {
      LeadId: this.leadId,
      Status: newStatus,
      UpdatedBy: 999,
    };

    this.leadService.updateLeadStatus(payload).subscribe((res: any) => {
      if (res?.responseData) {
        // Add status change to follow-ups
        const statusChangePayload = {
          LeadId: this.leadId,
          Comment: `Status changed from ${oldStatus} to ${newStatus}`,
          CreatedBy: 999,
          ReminderDateTime: null,
        };

        this.leadService.addFollowUp(statusChangePayload).subscribe((res: any) => {
          
            Swal.fire({
              icon: 'info', 
              title: 'Lead Status Updated',
              //text: 'The lead Status have been successfully updated.',
              confirmButtonColor: '#17a2b8'
            });
            this.fetchFollowUps(this.leadId); // Refresh timeline
            this.fetchLeadDetails(); // Refresh lead details
          
        });
      } else {
        alert('Failed to update status');
        this.fetchLeadDetails();
      }
    });
  }

  back() {
    this.router.navigate(['/leads']);
  }

  getSortedTimelineItems() {
  const timelineItems: any[] = [];

  // Add Lead Created item
  if (this.lead?.CreatedAt) {
    timelineItems.push({
      type: 'created',
      dateTime: this.lead.CreatedAt,
      data: null
    });
  }

  // Add Lead Assigned item (if assigned to someone)
  if (this.lead?.AssignedToName && this.lead.AssignedToName.trim() !== '' && this.lead.AssignedToName !== ' ') {
    timelineItems.push({
      type: 'assigned',
      dateTime: this.lead.UpdatedAt || this.lead.CreatedAt, // Use UpdatedAt if available, else CreatedAt
      data: null
    });
  }

  // Add Follow-ups
  if (this.followUps && this.followUps.length > 0) {
    this.followUps.forEach(followUp => {
      timelineItems.push({
        type: 'followup',
        dateTime: followUp.CreatedAt,
        data: followUp
      });
    });
  }

  // Sort by dateTime in descending order (latest first)
  return timelineItems.sort((a, b) => {
    const dateA = new Date(a.dateTime);
    const dateB = new Date(b.dateTime);
    return dateB.getTime() - dateA.getTime();
  });
}
}