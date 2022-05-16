import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { GlobalService } from '../services/global.service';
import { HttpService } from '../services/http.service';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {

  isLoader: boolean = false;
  @Input() importData: any;
  @Output() response = new EventEmitter();
  term:any;
  items:any = [];
  units:any = [];
  states:any = [];
  mms:any = [];
  conditions:any = [];
  pbks:any = [];
  aawak_types:any = [];
  nimmits:any = [];
  settings:any = [];
  um_items:any = [];
  um_mms:any = [];
  um_units:any = [];
  um_pbks:any = [];
  
  
  constructor(private fb: FormBuilder,
		private http: HttpService,
		private api: ApiService,
		private gs: GlobalService,
		private toastr: ToastrService,
		private spinner: NgxSpinnerService,
		public auth: AuthService
	) {
		this.gs.observeList().subscribe(result => {
			this.items = result.itemmix && this.auth.webUser.dept_id > 2 ? result.itemmix : [];
			this.units = result.unit ? result.unit : [];
			this.states = result.state ? result.state : [];
			this.mms = result.mm ? result.mm : [];
			this.conditions = result.condition ? result.condition : [];
			// this.departments = result.department ? result.department : [];
			this.pbks = result.pbk ? result.pbk : [];
			this.aawak_types = result.aawak_type ? result.aawak_type : [];
			this.nimmits = result.nimmit ? result.nimmit : [];
		});
		this.settings = this.auth.webUser.settings;

	}

  ngOnInit(): void {
    let array:any = [];
    let test = array.map((item: { age: any; }) => item.age)
  .filter((value: any, index: any, self: string | any[]) => self.indexOf(value) === index)
  }

  ngOnChanges(changes: SimpleChanges) {

    if(changes.importData && changes.importData.currentValue){
      this.importData = changes.importData.currentValue;
      this.um_items = this.importData.filter()
    }
  }
}
