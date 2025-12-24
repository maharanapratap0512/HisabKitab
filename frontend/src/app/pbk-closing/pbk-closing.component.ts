import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { FormService } from '../services/form.service';
import { GlobalService } from '../services/global.service';
import { HttpService } from '../services/http.service';
declare var $: any;

@Component({
  selector: 'app-pbk-closing',
  templateUrl: './pbk-closing.component.html',
  styleUrls: ['./pbk-closing.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ height: 0, opacity: 0 }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ height: 0, opacity: 0 }))
      ])
    ])
  ]
})
export class PbkClosingComponent implements OnInit {

  // Data Containers
  closingDataRaw: any[] = [];
  groupedClosings: any[] = [];

  // Lists
  pbks: any[] = [];
  items: any[] = [];
  units: any[] = [];

  // UI State
  isLoader: boolean = false;
  showModal: string = '';
  editData: any = null;

  // Filter
  filterBody: any = {
    date: null,
    pbk_id: null,
    voucher_no: null
  };

  // Pagination (Logic applied to groups)
  page: number = 1;
  itemsPerPage: number = 20;

  constructor(
    private http: HttpService,
    public api: ApiService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public gs: GlobalService,
    public auth: AuthService,
    public fs: FormService
  ) {
    this.gs.observeList().subscribe(result => {
      this.pbks = result.pbk || [];
      this.items = result.itemmix || [];
      this.units = result.unit || [];
    });
  }

  ngOnInit(): void {
    this.getClosingData();
  }

  getClosingData() {
    this.isLoader = true;
    this.http.post(this.api.getUrl('PBK_CLOSING') + 'filter/' + this.auth.webUser.dept_id, this.filterBody)
      .subscribe((data: any) => {
        if (data.success) {
          this.closingDataRaw = data.result;
          this.groupDataByVoucher();
        }
        this.isLoader = false;
      }, err => {
        this.isLoader = false;
        this.toastr.error('Error fetching data');
      });
  }

  groupDataByVoucher() {
    // Group raw data by voucher_no
    const groups: any = {};

    this.closingDataRaw.forEach(item => {
      const vNo = item.voucher_no || 'Unknown';
      if (!groups[vNo]) {
        groups[vNo] = {
          voucher_no: vNo,
          date: item.date,
          pbk_id: item.pbk_id,
          // Extract PBK details from first item, assuming it's joined
          pbk_hin: item.pbk_hin,
          pbk_eng: item.pbk_eng,
          roll_no: item.roll_no,
          items: [],
          expanded: false // UI state
        };
      }
      groups[vNo].items.push(item);
    });

    // Convert to array and sort by date desc
    this.groupedClosings = Object.values(groups).sort((a: any, b: any) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  openModal(type: string, data: any = null) {
    this.showModal = type;
    if (type === 'Edit Closing' && data) {
      // Reconstruct form object for editing
      this.fs.patchFormPbkClosing({
        date: data.date,
        pbk_id: data.pbk_id,
        dept_id: this.auth.webUser.dept_id,
        pbk_closings: data.items, // Pass the array of items for this voucher
        voucher_no: data.voucher_no
      });
      // Important to set isEdit or separate logic if needed
    } else {
      // Reset form for add
      this.fs.pbkClosingFormMain = {
        date: new Date().toISOString().slice(0, 10),
        participant_id: null,
        dept_id: this.auth.webUser.dept_id,
        pbk_closings: [],
        voucher_no: null
      };
      // Initialize with one empty row
      this.fs.pbkClosingFormMain.pbk_closings.push(JSON.parse(JSON.stringify(this.fs.pbkClosingForm)));
    }
    $('#showModal').modal('show');
  }

  closeModal() {
    $('#showModal').modal('hide');
    this.showModal = '';
    this.getClosingData(); // Refresh on close for simplicity
  }

  handleSubmitResponse(event: any) {
    if (event) {
      this.toastr.success('Success');
      this.closeModal();
    }
  }

  toggleExpand(group: any) {
    group.expanded = !group.expanded;
  }

  deleteVoucher(group: any) {
    Swal.fire({
      title: 'Delete Closing Entry?',
      text: "This will delete all items in this closing entry. (Note: Logic for deleting individual items vs whole voucher depends on API)",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        // Loop client side for now as explained in plan
        const promises = group.items.map((item: any) =>
          this.http.delete(this.api.getUrl('PBK_CLOSING') + item._id).toPromise()
        );

        Promise.all(promises).then(() => {
          this.toastr.success('Deleted');
          this.getClosingData();
        }).catch(err => this.toastr.error('Error deleting'));
      }
    });
  }
}
