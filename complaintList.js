import { LightningElement, track, wire } from 'lwc';
import getMyComplaints from '@salesforce/apex/ComplaintController.getMyComplaints';
import createComplaint from '@salesforce/apex/ComplaintController.createComplaint';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

export default class ComplaintList extends LightningElement {
    @track subject = '';
    @track description = '';
    @track priority = 'Medium';
    @track showForm = false;
    complaints;
    wiredComplaintsResult;

    columns = [
        { label: 'Subject', fieldName: 'Subject__c' },
        { label: 'Status', fieldName: 'Status__c' },
        { label: 'Priority', fieldName: 'Priority__c' },
        { label: 'Date', fieldName: 'CreatedDate', type: 'date' }
    ];

    priorityOptions = [
        { label: 'Low', value: 'Low' },
        { label: 'Medium', value: 'Medium' },
        { label: 'High', value: 'High' }
    ];

    @wire(getMyComplaints)
    wiredComplaints(result) {
        this.wiredComplaintsResult = result;
        if (result.data) {
            this.complaints = result;
        } else if (result.error) {
            this.complaints = result;
        }
    }

    handleOpen() {
        this.showForm = true;
    }
    handleClose() {
        this.showForm = false;
    }
    handleSubject(event) {
        this.subject = event.target.value;
    }
    handleDescription(event) {
        this.description = event.target.value;
    }
    handlePriority(event) {
        this.priority = event.detail.value;
    }

    handleSubmit() {
        if (!this.subject) {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Validation',
                message: 'Please enter a subject',
                variant: 'warning'
            }));
            return;
        }
        createComplaint({ subject: this.subject, description: this.description, priority: this.priority })
            .then(() => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: 'Complaint submitted successfully',
                    variant: 'success'
                }));
                this.subject = '';
                this.description = '';
                this.priority = 'Medium';
                this.showForm = false;
                return refreshApex(this.wiredComplaintsResult);
            })
            .catch(error => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error creating complaint',
                    message: error.body ? error.body.message : error.message,
                    variant: 'error'
                }));
            });
    }
}
