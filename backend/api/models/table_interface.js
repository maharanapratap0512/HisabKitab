
class TableInterface {
   bachat_new = {
      _id: null,
      month: null,
      year: null,
      mm_id: null,
      item_id: null,
      subitem_id: null,
      unit_id: null,
      dept_id: null,
      condition_id: null,
      total_aawak: 0,
      jawak: 0,
      used_jawak: 0,
      bachat: 0
   }
   bachat = {
      _id: null,
      mm_id: null,
      item_id: null,
      subitem_id: null,
      unit_id: null,
      dept_id: null,
      Stock: 0,
      Used: 0,
      New: 0,
      Old: 0,
      Defective: 0,
      Scrap: 0,
      Repairing: 0,
   }

   aawak = {
      pkt_num: null,
      lot_no: null,
      voucher_no: null,
      date: null,
      date_sent: null,
      mm_id: null,
      aawak_mm_id: null,
      dept_id: null,
      pbk_id: null,
      aawak_type_id: null,
      aawak_source_id: null,
      item_id: null,
      subitem_id: null,
      usage_list_id: null,
      company_name: null,
      product_id: null,
      unit_id: null,
      condition_id: null,
      qty: null,
      rate: null,
      actual_amt: null,
      nimitt_id: null,
      item_detail: null,
      description: null,
      remaining_qty: null,
      isbill: null,
      document: null,
      is_xl: 0,
      is_auto_pd: 0,
      hl: 0,
      is_auto: 0,
      is_process: 0,
      is_variable_qty: 0,
   }

   temp_import = {
      type: null,
      date: null,
      pkt_num: null,
      item_detail: null,
      qty: null,
      rate: null,
      actual_amt: null,
      company_name: null,
      description: null,
      isbill: null,
      document: null,
      mm: null,
      mm_id: null,
      pbk_id: null,
      pbk: null,
      item_id: null,
      item: null,
      subitem_id: null,
      subitem: null,
      product_id: null,
      product: null,
      condition_id: null,
      condition: null,
      unit_id: null,
      unit: null,
      aj_type_id: null,
      aj_type: null,
      nimitt_id: null,
      nimitt: null,
      dept_id: null,
      dept: null,
      jawak_detail: null,
      awk_id: null,
      lot_no: null,
      usage_list: null,
      usage_list_id: null,
      aawak_source_id: null,
      aawak_source: null
   }

   country = {
      _id: null,
      country_hin: null,
      country_eng: null,
      add_by_dept_id: null,
      update_by_dept_id: null,
      verify: 0,
      active: 1
   }

   jawak = {
      date: null,
      date_sent: null,
      mm_id: null,
      pkt_num: null,
      lot_no: null,
      jawak_mm_id: null,
      pbk_id: null,
      item_id: null,
      subitem_id: null,
      usage_list_id: null,
      item_detail: null,
      product_id: null,
      condition_id: null,
      company_name: null,
      qty: null,
      rate: null,
      actual_amt: null,
      aawak_source_id: null,
      jawak_type_id: null,
      unit_id: null,
      description: null,
      parchi_place: null,
      sell_repair_place: null,
      aawak_ref_id: null,
      nimitt_id: null,
      is_xl: null,
      is_process: null,
      dept_id: null,
      auto_awk: 0,
   }

   getAawakFromProduct(product, oldAawak = null) {
      return {
         ...(oldAawak ? oldAawak : this.aawak),
         ...product,
         _id: product.awk_id,
         date: product.purchase_date,
         product_id: product._id,
         price: product.rate,
         aawak_mm_id: product.mm_id,
         item_detail: product.product_detail,
      }
   }

   getAawakFromJawak(jwk) {
      return {
         ...this.aawak,
         ...jwk,
         mm_id: jwk.jawak_mm_id,
         aawak_mm_id: jwk.mm_id,
         is_auto: true,
         hl: true
      }
   }

}

module.exports = new TableInterface();