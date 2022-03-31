import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { GlobalService } from '../services/global.service';
import { HttpService } from '../services/http.service';
declare var $:any;
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {


  termAawak: any;
  term: any;
  termBachat: any;
  pendingAawakData: any = [];
  bachatData: any = [];
  bachatDataAll: any = [];
  editData: any = {};
  mms:any = [];
  showModal:String = '';
  sitems:any = [];
  fields :any;
  sabjiItem = [
    {
      item_eng: 'Green pea',
      item_hin: 'हरा मटर',
      unit_id: 3,
      category_id: 2,    },
    {
      item_eng: 'Carrot',
      item_hin: 'गाजर',
      unit_id: 3,
      category_id: 2,    },
    {
      item_eng: 'Tomatar',
      item_hin: 'टमाटर',
      unit_id: 3,
      category_id: 2,    },
    {
      item_eng: 'Potato',
      item_hin: 'आलू',
      unit_id: 3,
      category_id: 2,    },
    {
      item_eng: 'Lima bean',
      item_hin: 'सेम',
      unit_id: 3,
      category_id: 2,    },
    
    {
      item_eng: 'Bottle gourd',
      item_hin: 'लौकी',
      unit_id: 3,
      category_id: 2,    },
    
    {
      item_eng: 'Beetroot',
      item_hin: 'बिटरूट',
      unit_id: 3,
      category_id: 2,    },
    
    {
      item_eng: 'Corn',
      item_hin: 'भुट्टा',
      unit_id: 1,
      category_id: 2,
    },
    {
      item_eng: 'Elephant foot Yam',
      item_hin: 'सुरन',
      unit_id: 3,
      category_id: 2,    },
    {
      item_eng: 'Ginger',
      item_hin: 'अदरक',
      unit_id: 2,
      category_id: 2,    },
    {
      item_eng: 'Brinjal',
      item_hin: 'बैगन',
      unit_id: 3,
      category_id: 2,    },
    {
      item_eng: 'Lemon',
      item_hin: 'निम्बू',
      unit_id: 1,
      category_id: 2,
    },
    {
      item_eng: 'Toadstool',
      item_hin: 'मशरूम',
      unit_id: 3,
      category_id: 2,    },
    {
      item_eng: 'Ladies finger',
      item_hin: 'भिन्डी',
      unit_id: 3,
      category_id: 2,    },
    {
      item_eng: 'Pumpkin',
      item_hin: 'कद्दू',
      unit_id: 3,
      category_id: 2,    },
    {
      item_eng: 'Radish',
      item_hin: 'मुली',
      unit_id: 3,
      category_id: 2,    },
    {
      item_eng: 'Snake gourd',
      item_hin: 'चिचिंडा',
      unit_id: 3,
      category_id: 2,    },
    
    {
      item_eng: 'Sweet potato',
      item_hin: 'शकरकंद',
      unit_id: 3,
      category_id: 2,    },
    
    {
      item_eng: 'Jackfruit',
      item_hin: 'कटहल',
      unit_id: 3,
      category_id: 2,    },
    {
      item_eng: 'Gooseberry (Indian)',
      item_hin: 'आँवला',
      unit_id: 3,
      category_id: 2,    },
    {
      item_eng: 'Bitter gourd',
      item_hin: 'करेला',
      unit_id: 3,
      category_id: 2,    },
    {
      item_eng: 'Cucumber',
      item_hin: 'खीरा',
      unit_id: 3,
      category_id: 2,    },
    {
      item_eng: 'Drumstick',
      item_hin: 'सहजन',
      unit_id: 3,
      category_id: 2,    },
    {
      item_eng: 'Little gourd',
      item_hin: 'कुंदरू',
      unit_id: 3,
      category_id: 2,    },
    {
      item_eng: 'Ridge guard',
      item_hin: 'तुरई',
      unit_id: 3,
      category_id: 2,    },
    {
      item_eng: 'yam',
      item_hin: 'रतालू',
      unit_id: 3,
      category_id: 2,    },
    {
      item_eng: 'Tinda',
      item_hin: 'टिंडा',
      unit_id: 3,
      category_id: 2,    },
    {
      item_eng: 'Turmeric Raw',
      item_hin: 'हल्दी हरा',
      unit_id: 3,
      category_id: 2,    },
    {
      item_eng: 'Ash gourd',
      item_hin: 'पेठा',
      unit_id: 3,
      category_id: 2,    },
    
    {
      item_eng: 'Tamarind',
      item_hin: 'ईमली',
      unit_id: 3,
      category_id: 2,    },
    
    
    {
      item_eng: 'leaves',
      item_hin: 'पत्ता',
      unit_id: 3 ,
      category_id: 2,
    },
    
    {
      item_eng: 'Broccoli',
      item_hin: 'ब्रोकोली',
      unit_id: 3,
      category_id: 2,    },
    {
      item_eng: 'Turnip',
      item_hin: 'शलगम',
      unit_id: 3,
      category_id: 2,    },
    {
      item_eng: 'Taro root',
      item_hin: 'अरवी',
      unit_id: 3,
      category_id: 2,    },
    {
      item_eng: 'Pointed gourd',
      item_hin: 'परवल',
      unit_id: 3,
      category_id: 2,    },
    
    {
      item_eng: 'Water chestnut',
      item_hin: 'सिंघाड़ा',
      unit_id: 3,
      category_id: 2,    },
    {
      item_eng: 'Cluster beans',
      item_hin: 'ग्वारफली',
      unit_id: 3,
      category_id: 2,    },
    {
      item_eng: 'Mix sabji',
      item_hin: 'मिक्स सब्जी',
      unit_id: 3,
      category_id: 2,    },
      {
      item_eng: 'Chilli',
      unit_id: 3,
      item_hin: 'मिर्च',
      category_id: 2,    }, 
      {
      item_eng: 'Cowpea Green',
      item_hin: 'बरबटी',
      unit_id: 3,
      category_id: 2,    },

      {
      item_eng: 'lump cabbage',
      item_hin: 'गांठ गोभी',
      unit_id: 3,
      category_id: 2,    },
      {
      item_eng: 'Caullflower',
      item_hin: 'फुलगोभी',
      unit_id: 3,
      category_id: 2,    },
      {
      item_eng: 'Cabbage',
      item_hin: 'पत्तागोभी',
      unit_id: 3,
      category_id: 2,    },
      {
      item_eng: 'Green pea',
      item_hin: 'हरा मटर',
      unit_id: 3,
      category_id: 2,    },
    {
      item_eng: 'हरा चना',
      item_hin: 'Greem gram',
      unit_id: 3,
      category_id: 2,    },
    {
      item_eng: 'Snap melon',
      item_hin: 'कचरी',
      unit_id: 3,
      category_id: 2,    }, 
];
  constructor(private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService) { }

  ngOnInit(): void {
    this.spinner.show();
    this.mms = this.gs.Lists.mm;
    this.sitems = this.gs.Lists.sitem;
    this.getBachat();
    this.getPendingAawak();
    // console.log("this.sitems",this.sitems);
    
    this.fields= { dataSource: this.sitems, value: '_id', text: 'name_hin', parentValue:"item_id", hasChildren: 'item'  };
    let s = '';
    for(let i of this.sabjiItem){
      s += `('${i.item_hin}','${i.item_eng}',${i.category_id}, ${i.unit_id}, 1),`;
    }
    console.log("sql", s);
    

  }

  getBachat() {
    // this.isLoader = true;
    this.http.get(this.api.getUrl('BACHAT') + this.auth.webUser.dept_id).subscribe((data: any) => {
      if (data['result'] && data['success']) {
        this.bachatDataAll = data['result'].filter((b: { qty: number; })=> b.qty > 0);
        this.bachatData = this.bachatDataAll;
        console.log("bachat", this.bachatData);

        // this.isLoader = false;
      }
      // this.isLoader = false;
    });
  }

  sitemSelected(ev:any){
    console.log(ev);
    
  }

  getPendingAawak() {
    this.http.get(this.api.getUrl('PENDING_AWK') + this.auth.webUser.dept_id).subscribe((data: any) => {
      if (data['result'] && data['success']) {
        this.pendingAawakData = data['result'];
        // this.bachatDataAll = data['result'];
        console.log("aawak", this.pendingAawakData);
      }
    });
  }

  mmSelected(ev:any){
    if(ev){
      this.bachatData = this.bachatDataAll.filter((b: { mm_id: any; })=>b.mm_id == ev);
    }
    else{
      this.bachatData = this.bachatDataAll;
    }
  }

  addJawak(data: any) {
    this.editData = {
      date:data.date,
      mm_id:data.mm_id,
      item_id:data.item_id,
      subitem_id: data.subitem_id,
      product_id:data.product_id,
      item_detail:data.item_detail,
      condition_id:data.condition_id,
      qty:data.remaining_qty,
      unit_id:data.unit_id,
      aawak_ref_id:data._id,
      dept_id:data.dept_id
    }
    this.showModal = "Add Jawak";
    $('#showModal').modal('show');
  }


  showJawak(id: any) {
    if(id){
      this.http.get(this.api.getUrl('JAWAKBYAWK') + id).subscribe((data: any) => {
        if (data['result'] && data['success']) {
          // this.pendingAawakData = data['result'];
          // this.bachatDataAll = data['result'];
          console.log("jawak", data['result']);
        }
      });
    }
  }

  addJawakResponse(ev: any) {
    // this.isLoader = true;
    if(ev.aawak_ref_id){
      this.getPendingAawak();
      this.getBachat();
    }
    $('#showModal').modal('hide');
    this.showModal = '';
    // this.isLoader = false;
  }

}
