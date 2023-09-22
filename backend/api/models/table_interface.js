
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

   aawak = {
      pkt_num: null,
      date: null,
      mm_id: null,
      aawak_mm_id: null,
      dept_id: null,
      pbk_id: null,
      aawak_type_id: null,
      item_id: null,
      subitem_id: null,
      usage_category_id: null,
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

}

module.exports = new TableInterface();