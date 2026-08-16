// const db = require('../models/db.model').db;
const queryBuilder = {
    insert: async (tblname, obj) => {
        let colnames = ``, values = ``;
        for (let col in obj) {
            colnames += col + ', ';
            values += '@' + col + ', ';
        }
        colnames = colnames.slice(0, -2);
        values = values.slice(0, -2);
        let sql = `insert into ${tblname}(${colnames}) values(${values})`;
        return sql;
    }
}

const country = {
    select:
        `select * from country ?`
    , select_full:
        `select * from country ? limit @limit offset @offset`
    , insert:
        `insert into country (
            country_hin,
            country_eng,
            add_by_dept_id,
            verify,
            active) 
        values (
            @country_hin,
            @country_eng,
            @add_by_dept_id,
            @verify,
            @active)`
    , insert_ignore:
        `insert or ignore into country (
            _id,
            country_hin,
            country_eng,
            add_by_dept_id,
            update_by_dept_id,
            verify,
            created_at,
            updated_at,
            active) 
        values (
            @_id,
            @country_hin,
            @country_eng,
            @add_by_dept_id,
            @update_by_dept_id,
            @verify,
            @created_at,
            @updated_at,
            @active)`
    , import_update:
        `update country set 
        country_hin=@country_hin,
        country_eng=@country_eng,
        add_by_dept_id=@add_by_dept_id,
        update_by_dept_id=@update_by_dept_id,
        verify=@verify,
        created_at=@created_at,
        updated_at=@updated_at where _id = @_id`
    , update:
        `update country set 
        country_hin=@country_hin,
        country_eng=@country_eng,
        update_by_dept_id=@update_by_dept_id,
        verify=@verify,
        updated_at=datetime('now', 'localtime')`
    , order:
        `country_hin, country_eng`
}

const city = {
    select_full:
        `select city.*, st.state_hin, st.state_eng from city 
        left join state st on city.state_id=st._id ? 
     limit @limit offset @offset`
    , select:
        `select * from city ?`
    , insert:
        `insert into city (
            city_hin,
            city_eng,
            state_id,
            active)
        values (
            @city_hin,
            @city_eng,
            @state_id,
            @active)`
    , import:
        `insert into city (
            city_hin,
            city_eng,
            state_id,
            created_at,
            updated_at,
            active)
        values (
            @city_hin,
            @city_eng,
            @state_id,
            @created_at,
            datetime('now','localtime'),
            @active)`
    , insert_ignore:
        `insert or ignore into city (
            _id,
            city_hin,
            city_eng,
            state_id,
            created_at,
            updated_at,
            active) 
        values (
            @_id,
            @city_hin,
            @city_eng,
            @state_id,
            @created_at,
            @updated_at,
            @active)`
    , import_update:
        `update city set 
        city_hin=@city_hin,
        city_eng=@city_eng,
        state_id=@state_id,
        updated_at=@updated_at where _id = @_id`
    , update:
        `update city set
        city_hin=@city_hin,
        city_eng=@city_eng,
        state_id=@state_id,
        updated_at=datetime('now','localtime')`
    , update_active:
        `update city set
        active=@active,
        updated_at=datetime('now','localtime')`
    , order: ` city_hin,city_eng`
}

const category = {
    select:
        `select * from category ?`
    , select_full:
        `select * from category ? limit @limit offset @offset`
    , insert:
        `insert into category (
            parent_id,
            category_hin,
            category_eng,
            category_roman,
            active)
        values (
            @category_hin,
            @category_eng,
            @category_roman,
            @active)`
    , import:
        `insert into category (
            category_hin,
            category_eng,
            category_roman,
            created_at,
            updated_at,
            active)
        values (
            @category_hin,
            @category_eng,
            @category_roman,
            @created_at,
            datetime('now','localtime'),
            @active)`
    , insert_ignore:
        `insert or ignore into category (
            _id,
            category_hin,
            category_eng,
            category_roman,
            created_at,
            updated_at,
            active) 
        values (
            @_id,
            @category_hin,
            @category_eng,
            @category_roman,
            @created_at,
            @updated_at,
            @active)`
    , import_update:
        `update category set 
        category_hin=@category_hin,
        category_eng=@category_eng,
        category_roman=@category_roman,
        updated_at=@updated_at where _id = @_id`
    , update:
        `update category set
        category_hin=@category_hin,
        category_eng=@category_eng,
        category_roman=@category_roman,
        updated_at=datetime('now','localtime')`
    , update_active:
        `update category set
        active=@active,
        updated_at=datetime('now','localtime')`
}

const report_comment = {
    select:
        `select * from report_comment ?`
    , select_full:
        `select * from report_comment ? limit @limit offset @offset`
    , insert:
        `insert into report_comment (
            report_type,
            row_type,
            month,
            year,
            dept_id,
            mm_id,
            item_id,
            subitem_id,
            unit_id,
            type_id,
            comment)
        values (
            @report_type,
            @row_type,
            @month,
            @year,
            @dept_id,
            @mm_id,
            @item_id,
            @subitem_id,
            @unit_id,
            @type_id,
            @comment)`
    , update:
        `update report_comment set
        report_type=@report_type,
        row_type=@row_type,
        month=@month,
        year=@year,
        dept_id=@dept_id,
        mm_id=@mm_id,
        item_id=@item_id,
        subitem_id=@subitem_id,
        unit_id=@unit_id,
        type_id=@type_id,
        comment=@comment,
        updated_at=(UNIXEPOCH('now','localtime'))`
    , update_text:
        `update report_comment set 
        comment=@comment,
        updated_at=(UNIXEPOCH('now', 'localtime'))
        where _id=@_id`
}

const department = {
    select:
        `select * from department ?`
    , select_full:
        `select * from department ? limit @limit offset @offset`
    , insert:
        `insert into department (
            dept_eng,
            dept_hin,
            dept_code,
            settings,
            password,
            active)
        values (
            @dept_eng,
            @dept_hin,
            @dept_code,
            @settings,
            @password,
            @active)`
    , insert_ignore:
        `insert or ignore into department (
            _id,
            dept_eng,
            dept_hin,
            dept_code,
            settings,
            password,
            created_at,
            updated_at,
            active) 
        values (
            @_id,
            @dept_eng,
            @dept_hin,
            @dept_code,
            @settings,
            @password,
            @created_at,
            @updated_at,
            @active)`
    , import_update:
        `update department set 
        dept_eng=@dept_eng,
        dept_hin=@dept_hin,
        dept_code=@dept_code,
        settings=@settings,
        password=@password,
        created_at=@created_at,
        updated_at=@updated_at where _id = @_id`
    , update:
        `update department set
        dept_eng=@dept_eng,
        dept_hin=@dept_hin,
        dept_code=@dept_code,
        settings=@settings,
        password=@password,
        updated_at=datetime('now','localtime')`
    , update_active:
        `update department set
        active=@active,
        updated_at=datetime('now','localtime')`
    , update_settings:
        `update department set
        settings=@settings,
        updated_at=datetime('now','localtime')`
}

const department_config = {
    select:
        `select * from department_config ?`
    , select_full:
        `select * from department_config ? limit @limit offset @offset`
    , insert:
        `insert into department_config (
            dept_id,
            config_key,
            config_value,
            active)
        values (
            @dept_id,
            @config_key,
            @config_value,
            @active)`
    , insert_ignore:
        `insert or ignore into department_config (
            dept_id,
            config_key,
            config_value,
            created_at,
            updated_at,
            active) 
        values (
            @dept_id,
            @config_key,
            @config_value,
            @created_at,
            @updated_at,
            @active)`
    , import_update:
        `update department_config set         
        config_value=@config_value,
        created_at=@created_at,
        updated_at=@updated_at where dept_id = @dept_id AND config_key=@config_key`
    , update:
        `update department_config set
        config_key=@config_key,
        config_value=@config_value,
        updated_at=datetime('now','localtime')`
    , update_config_value: `update department_config set config_value = json_set(config_value,'$['||json_array_length(config_value)||']', CAST(@new_id as INTEGER)) where dept_id = @dept_id AND config_key=@tblname`
    , update_config_value_old:
        `update department_config set config_value = CASE WHEN(config_value = '') THEN ',' ELSE config_value END || @new_id || ',' where dept_id = @dept_id AND config_key = @tblname`,
    verify_config_id:
        `select count(json_each.value) from department_config, json_each(config_value) where dept_id = @dept_id AND config_key=@tblname AND json_each.value = @new_id)`,
}

const item = {
    select:
        `select * from item ?`
    , select_full:
        `select item.*, json_group_array(distinct ct.category_hin) as categories_hin,
        unit.unit_full, unit.unit_short from item
        left join rel_item_category ric on ric.item_id = item._id
        left join category ct on ct._id = ric.category_id
        left join unit on unit._id = item.unit_id ? group by item._id limit @limit offset @offset`
    , insert:
        `insert into item (
            item_hin, item_eng, item_roman, item_code, unit_id, extra_note, document, restrict_month, restrict_year, min_rate, max_rate, active)
        values (
            @item_hin, @item_eng, @item_roman, @item_code, @unit_id, @extra_note, @document, @restrict_month, @restrict_year, @min_rate, @max_rate, @active)`
    , import:
        `insert into item (
            item_hin, item_eng, item_roman, item_code, unit_id, extra_note, document, restrict_month, restrict_year, min_rate, max_rate, created_at, updated_at, active) 
        values (
            @item_hin, @item_eng, @item_roman, @item_code, @unit_id, @extra_note, @document, @restrict_month, @restrict_year, @min_rate, @max_rate, @created_at, @updated_at, @active)`
    , insert_ignore:
        `insert or ignore into item (
            _id, item_hin, item_eng, item_roman, item_code, unit_id, extra_note, document, restrict_month, restrict_year, min_rate, max_rate, created_at, updated_at, active) 
        values (
            @_id, @item_hin, @item_eng, @item_roman, @item_code, @unit_id, @extra_note, @document, @restrict_month, @restrict_year, @min_rate, @max_rate, @created_at, @updated_at, @active)`
    , import_update:
        `update item set 
        item_hin=@item_hin,
        item_eng=@item_eng,
        item_roman=@item_roman,
        item_code=@item_code,
        extra_note=@extra_note,
        document=@document,
        unit_id=@unit_id,
        restrict_month=@restrict_month,
        restrict_year=@restrict_year,
        min_rate=@min_rate,
        max_rate=@max_rate,
        created_at=@created_at,
        updated_at=@updated_at where _id = @_id`
    , update:
        `update item set
        item_hin=@item_hin,
        item_eng=@item_eng,
        item_roman=@item_roman,
        item_code=@item_code,
        extra_note=@extra_note,
        document=@document,
        unit_id=@unit_id,
        restrict_month=@restrict_month,
        restrict_year=@restrict_year,
        restrict_year=@restrict_year,
        min_rate=@min_rate,
        min_rate=@min_rate,
        max_rate=@max_rate,
        updated_at=datetime('now','localtime')`
    , update_active:
        `update item set
        active=@active,
        updated_at=datetime('now','localtime')`
    , update_lock:
        `update item set
        restrict_month=@restrict_month,
        restrict_year=@restrict_year,
        updated_at=datetime('now','localtime')`
    , order:
        ` item_hin, item_eng`
}

const itemmix = {
    select_full: `select item.*, 
    json_group_array(distinct json_object('_id', ct._id, 'category_hin', ct.category_hin, 'category_eng', ct.category_eng)) as categories,
    unit.unit_full, unit.unit_short,
    (select json_group_array(json_object(
        '_id', si._id, 'item_id', si.item_id, 'variant_id', si.variant_id,
        'subitem_hin', si.subitem_hin, 'subitem_eng', si.subitem_eng, 'subitem_roman', si.subitem_roman,
        'categories', si.categories, 'unit_full', si.unit_full, 'unit_short', si.unit_short,
        'extra_note', si.extra_note, 'unit_id', si.unit_id,
        'restrict_month', si.restrict_month, 'restrict_year', si.restrict_year,
        'min_rate', si.min_rate, 'max_rate', si.max_rate, 'active', si.active
    )) from (
        select subitem.*,
        json_group_array(json_object('_id', cat._id, 'category_hin', cat.category_hin, 'category_eng', cat.category_eng)) as categories,
        ut.unit_short, ut.unit_full
        from subitem
        left join rel_subitem_category rsc on rsc.subitem_id = subitem._id
        left join category cat on cat._id = rsc.category_id
        left join unit ut on ut._id = subitem.unit_id
        where subitem.item_id = item._id
        group by subitem._id
    ) as si) as subitems,
    (select json_group_array(json_object('_id', ia._id, 'alias', ia.alias)) from item_aliases ia where ia.item_id = item._id) as item_aliases
    from item
    left join rel_item_category ric on ric.item_id = item._id
    left join category ct on ct._id = ric.category_id
    left join unit on unit._id = item.unit_id ? 
    group by item._id # limit @limit offset @offset`,

    order: `item_hin, item_eng`,
    count: `select count(*) as total_count from (select item._id from item 
        left join rel_item_category ric on ric.item_id = item._id
        left join subitem si on si.item_id = item._id ? group by item._id)`
}

const jawak = {
    select:
        `select * from jawak ?`
    , select_full:
        `select jawak.*,
        amm.mm_hin,amm.mm_eng,amm.mm_code, amm.state_id as mm_state_id, mst.state_hin as mm_state_hin, mst.state_eng as mm_state_eng, 
        mst.zone_id as mm_zone_id, zn.zone_hin as mm_zone_hin, zn.zone_eng as mm_zone_eng,
        jmm.mm_hin as jawak_mm_hin, jmm.mm_eng as jawak_mm_eng, jmm.mm_code as jawak_mm_code,
        pbk.roll_no, pbk.pbk_hin, pbk.pbk_eng, pbk.relation, pbk.state_id as pbk_state_id, pst.state_hin as pbk_state_hin, pst.state_eng as pbk_state_eng,
        it.item_hin, it.item_eng, it.item_code, it.item_roman, it.icategories as icategories,
        si.subitem_hin, si.subitem_eng, si.subitem_roman, si.categories as scategories,
        slul.list_name_hin as usage_list_hin, slul.list_name_eng as usage_list_eng, slul.list_name_roman as usage_list_roman,
        sl.list_name_hin as condition_hin, sl.list_name_eng as condition_eng,
        dept.dept_eng, dept.dept_hin, dept.dept_code,
        unit.unit_short, unit.unit_full,
        jsl.list_name_hin as jawak_type_hin, jsl.list_name_eng as jawak_type_eng ,
        jslas.list_name_hin as aawak_source_hin, jslas.list_name_eng as aawak_source_eng ,
        nmt.nimitt_hin, nmt.nimitt_eng, nmt.relative_name as father_name, nmt.state_id as nimitt_state_id, nst.state_hin as nimitt_state_hin, nst.state_eng as nimitt_state_eng,
        JSON_Object('_id', enz._id, 'jawak_id', enz.jawak_id, 'container_capacity', enz.container_capacity) as enz,
        JSON_Object('_id', ur._id, 'jawak_id', ur.jawak_id, 'date', ur.date, 'reporter', ur.reporter, 'usage_type', ur.usage_type,
        'usage_report_hin', ut.list_name_hin, 'fayda', ur.fayda, 'nuksan', ur.nuksan, 'rating', ur.rating) as usage_report,
        (SELECT JSON_Object(
            '_id', awk._id,
            'date', awk.date,
            'lot_no', awk.lot_no,
            'pkt_num', awk.pkt_num,
            'remaining_qty', awk.remaining_qty,
            'item_id', awk.item_id,
            'subitem_id', awk.subitem_id,
            'condition_id', awk.condition_id,
            'unit_id', awk.unit_id,
            'aawak_source_id', awk.aawak_source_id,
            'company_name', awk.company_name,
            'product_id', awk.product_id,
            'rate', awk.rate
        ) FROM rel_aawak_jawak raj LEFT JOIN aawak awk ON awk._id = raj.aawak_id WHERE raj.jawak_id = jawak._id LIMIT 1) as aawak_ref_obj,
        (SELECT JSON_Group_Array(JSON_Object(
            'rel_id', raj._id,
            'aawak_id', raj.aawak_id,
            'jawak_id', raj.jawak_id,
            'qty', raj.qty,
            'split_qty', raj.split_qty,
            'is_split', raj.is_split,
            'date', awk.date,
            'lot_no', awk.lot_no,
            'pkt_num', awk.pkt_num,
            'remaining_qty', awk.remaining_qty,
            'item_id', awk.item_id,
            'subitem_id', awk.subitem_id,
            'condition_id', awk.condition_id,
            'unit_id', awk.unit_id,
            'aawak_source_id', awk.aawak_source_id,
            'company_name', awk.company_name,
            'product_id', awk.product_id,
            'aawak_obj', JSON_Object(
                '_id', awk._id,
                'date', awk.date,
                'lot_no', awk.lot_no,
                'pkt_num', awk.pkt_num,
                'remaining_qty', awk.remaining_qty,
                'item_id', awk.item_id,
                'subitem_id', awk.subitem_id,
                'condition_id', awk.condition_id,
                'unit_id', awk.unit_id,
                'aawak_source_id', awk.aawak_source_id,
                'company_name', awk.company_name,
                'product_id', awk.product_id
            )
        )) FROM rel_aawak_jawak raj LEFT JOIN aawak awk ON awk._id = raj.aawak_id WHERE raj.jawak_id = jawak._id) as aawak_splits
        from jawak
        left join jawak_enzyme enz on enz.jawak_id = jawak._id
        left join usage_report ur on ur.jawak_id = jawak._id 
        left join support_list ut on ut._id = ur.usage_type
        left join mm amm on amm._id = jawak.mm_id 
        left join state mst on mst._id = amm.state_id
        left join zone zn on zn._id = mst.zone_id
        left join pbk on pbk._id = jawak.pbk_id
        left join state pst on pst._id = pbk.state_id
        left join mm jmm on jmm._id = jawak.jawak_mm_id
        left join v_item it on it._id = jawak.item_id
        left join v_subitem si on si._id = jawak.subitem_id
        left join product pd on pd._id = jawak.product_id
        left join support_list sl on sl._id = jawak.condition_id 
        left join support_list slul on slul._id = jawak.usage_list_id
        left join support_list jsl on jsl._id = jawak.jawak_type_id
        left join support_list jslas on jslas._id = jawak.aawak_source_id
        left join unit on unit._id = jawak.unit_id
        left join department dept on dept._id = jawak.dept_id
        left join nimitt nmt on nmt._id = jawak.nimitt_id
        left join state nst on nst._id = nmt.state_id ? limit @limit offset @offset`
    , insert:
        `insert into jawak(
        voucher_no, date, date_sent, reg_pg_no, mm_id, pkt_num, lot_no, pbk_id, jawak_mm_id, item_id, usage_list_id,
        subitem_id, product_id, item_detail, condition_id, qty, rate, actual_amt, jawak_type_id, aawak_source_id,
        unit_id, description, sell_repair_place, parchi_place, nimitt_id, company_name, aawak_ref_id, dept_id, 
        is_xl, hl, is_process, active, is_recieved)
    values (
        @voucher_no, @date, @date_sent, @reg_pg_no, @mm_id, @pkt_num, @lot_no, @pbk_id, @jawak_mm_id, @item_id, @usage_list_id,
        @subitem_id, @product_id, @item_detail, @condition_id, @qty, @rate, @actual_amt, @jawak_type_id, @aawak_source_id,
        @unit_id, @description, @sell_repair_place, @parchi_place, @nimitt_id, @company_name, @aawak_ref_id, @dept_id, 
        @is_xl, @hl, @is_process, @active, @is_recieved)`
    , update:
        `update jawak set 
        voucher_no=@voucher_no,
        date=@date,
        date_sent=@date_sent,
        reg_pg_no=@reg_pg_no,
        mm_id=@mm_id,
        pkt_num=@pkt_num,
        lot_no=@date_sent,
        pbk_id=@pbk_id,
        jawak_mm_id=@jawak_mm_id,
        item_id=@item_id,
        usage_list_id=@usage_list_id,
        subitem_id=@subitem_id,
        product_id=@product_id,
        item_detail=@item_detail,
        condition_id=@condition_id,
        qty=@qty,
        rate=@rate,
        actual_amt=@actual_amt,
        jawak_type_id=@jawak_type_id,
        aawak_source_id=@aawak_source_id,
        unit_id=@unit_id,
        description=@description,
        sell_repair_place=@sell_repair_place,
        parchi_place=@parchi_place,
        nimitt_id=@nimitt_id,
        company_name=@company_name,
        aawak_ref_id=@aawak_ref_id,
        dept_id=@dept_id,
        is_xl=@is_xl,
        hl=@hl,
        is_process=@is_process,
        is_recieved=@is_recieved,
        updated_at=datetime('now','localtime')`
    , select_all_voucher:
        `select jawak.voucher_no, jawak.date, jawak.date_sent, jawak.pkt_num, jawak.reg_pg_no, jawak.mm_id, jawak.jawak_mm_id,
        jawak.pbk_id, jawak.nimitt_id, jawak.description, jawak.dept_id,
        mm.mm_hin,mm.mm_eng,mm.mm_code,
        jmm.mm_hin as jawak_mm_hin, jmm.mm_eng as jawak_mm_eng, jmm.mm_code as jawak_mm_code, 
        pbk.roll_no, pbk.pbk_hin, pbk.pbk_eng, pbk.relation, pbk.relative_name, pbk.state_id as pbk_state_id,
        pst.state_hin as pbk_state_hin, pst.state_eng as pbk_state_eng,
        dept.dept_eng, dept.dept_hin, dept.dept_code,
        nmt.nimitt_hin, nmt.nimitt_eng, nmt.relative_name as father_name, nmt.state_id as nimitt_state_id, nst.state_hin as nimitt_state_hin, nst.state_eng as nimitt_state_eng
        from jawak 
        left join mm on mm._id = jawak.mm_id
        left join pbk on pbk._id = jawak.pbk_id
        left join state pst on pst._id = pbk.state_id
        left join mm jmm on jmm._id = jawak.jawak_mm_id
        left join department dept on dept._id = jawak.dept_id
        left join nimitt nmt on nmt._id = jawak.nimitt_id
        left join state nst on nst._id = nmt.state_id ? group by voucher_no limit @limit offset @offset`
    , select_one_voucher:
        `select jawak.*, 
        item.item_hin, item.item_eng, item.item_code, item.item_roman, item.icategories as icategories,
        si.subitem_hin, si.subitem_eng, si.subitem_roman, si.categories as scategories,
        slul.list_name_hin as usage_list_hin, slul.list_name_eng as usage_list_eng, slul.list_name_roman as usage_list_roman,
        product.sr_num, product.product_code,
        sl.list_name_hin as condition_hin, sl.list_name_eng as condition_eng,
        unit.unit_short, unit.unit_full,
        jsl.list_name_hin as jawak_type_hin, jsl.list_name_eng as jawak_type_eng,
        jslas.list_name_hin as aawak_source_hin, jslas.list_name_eng as aawak_source_eng,
        JSON_Object('_id', enz._id, 'jawak_id', enz.jawak_id, 'container_capacity', enz.container_capacity) as enz,
        JSON_Object('_id', ur._id, 'jawak_id', ur.jawak_id, 'date', ur.date, 'reporter', ur.reporter, 'usage_type', ur.usage_type, 
        'usage_report_hin', ut.list_name_hin, 'fayda', ur.fayda, 'nuksan', ur.nuksan, 'rating', ur.rating) as usage_report,
        (SELECT JSON_Object(
            '_id', awk._id,
            'date', awk.date,
            'lot_no', awk.lot_no,
            'pkt_num', awk.pkt_num,
            'remaining_qty', awk.remaining_qty,
            'item_id', awk.item_id,
            'subitem_id', awk.subitem_id,
            'condition_id', awk.condition_id,
            'unit_id', awk.unit_id,
            'aawak_source_id', awk.aawak_source_id,
            'company_name', awk.company_name,
            'product_id', awk.product_id,
            'rate', awk.rate
        ) FROM rel_aawak_jawak raj LEFT JOIN aawak awk ON awk._id = raj.aawak_id WHERE raj.jawak_id = jawak._id LIMIT 1) as aawak_ref_obj,
        (SELECT JSON_Group_Array(JSON_Object(
            'rel_id', raj._id,
            'aawak_id', raj.aawak_id,
            'jawak_id', raj.jawak_id,
            'qty', raj.qty,
            'split_qty', raj.split_qty,
            'is_split', raj.is_split,
            'date', awk.date,
            'lot_no', awk.lot_no,
            'pkt_num', awk.pkt_num,
            'remaining_qty', awk.remaining_qty,
            'item_id', awk.item_id,
            'subitem_id', awk.subitem_id,
            'condition_id', awk.condition_id,
            'unit_id', awk.unit_id,
            'aawak_source_id', awk.aawak_source_id,
            'company_name', awk.company_name,
            'product_id', awk.product_id,
            'aawak_obj', JSON_Object(
                '_id', awk._id,
                'date', awk.date,
                'lot_no', awk.lot_no,
                'pkt_num', awk.pkt_num,
                'remaining_qty', awk.remaining_qty,
                'item_id', awk.item_id,
                'subitem_id', awk.subitem_id,
                'condition_id', awk.condition_id,
                'unit_id', awk.unit_id,
                'aawak_source_id', awk.aawak_source_id,
                'company_name', awk.company_name,
                'product_id', awk.product_id
            )
        )) FROM rel_aawak_jawak raj LEFT JOIN aawak awk ON awk._id = raj.aawak_id WHERE raj.jawak_id = jawak._id) as aawak_splits
        from jawak 
        left join jawak_enzyme enz on enz.jawak_id = jawak._id
        left join usage_report ur on ur.jawak_id = jawak._id
        left join support_list ut on ut._id = ur.usage_type
        left join v_item item on item._id = jawak.item_id
        left join v_subitem si on si._id = jawak.subitem_id
        left join support_list slul on slul._id = jawak.usage_list_id
        left join product on product._id = jawak.product_id
        left join support_list sl on sl._id = jawak.condition_id
        left join unit on unit._id = jawak.unit_id
        left join support_list jsl on jsl._id = jawak.jawak_type_id
        left join support_list jslas on jslas._id = jawak.aawak_source_id where jawak.voucher_no = @voucher_no
        `
    , update_active:
        `update jawak set
        active=@active,
        updated_at=datetime('now','localtime')`
    , order:
        `date, jawak_mm_hin, jawak_mm_eng, pkt_num`
    , delete: `delete from jawak where _id = @_id`,
}

const jawak_voucher = {
    select_full:
        `select jawak.voucher_no, jawak.date, jawak.date_sent, jawak.reg_pg_no, jawak.mm_id, jawak.pkt_num, jawak.pbk_id, jawak.jawak_mm_id, jawak.description,
        jawak.nimitt_id, jawak.dept_id,
        mm.mm_hin,mm.mm_eng,mm.mm_code,
        amm.mm_hin as jawak_mm_hin, amm.mm_eng as jawak_mm_eng, amm.mm_code as jawak_mm_code,
        pbk.roll_no, pbk.pbk_hin, pbk.pbk_eng, pbk.relation, pbk.relative_name,
        pbk.state_id as pbk_state_id, pst.state_hin as pbk_state_hin, pst.state_eng as pbk_state_eng,
        dept.dept_eng, dept.dept_hin, dept.dept_code,
        nmt.nimitt_hin, nmt.nimitt_eng, nmt.relative_name as father_name, nmt.state_id as nimitt_state_id, nst.state_hin as nimitt_state_hin, nst.state_eng as nimitt_state_eng,
        json_group_array(json_object(
            '_id', jawak._id, 'aawak_ref_id', jawak.aawak_ref_id, 'lot_no', jawak.lot_no, 'item_id', jawak.item_id, 'subitem_id', jawak.subitem_id,
            'product_id', jawak.product_id,'condition_id', jawak.condition_id, 'unit_id', jawak.unit_id,
            'aawak_source_id', jawak.aawak_source_id, 'jawak_type_id', jawak.jawak_type_id, 'item_detail', jawak.item_detail,
            'item_hin', item.item_hin, 'item_eng', item.item_eng, 'item_code', item.item_code, 'item_roman', item.item_roman,
            'icategories', item.icategories, 'subitem_hin', si.subitem_hin, 'subitem_eng', si.subitem_eng,
            'scategories', si.categories, 'sr_num', product.sr_num, 'product_code', product.product_code,
            'qty', jawak.qty, 'unit_short', unit.unit_short, 'unit_full', unit.unit_full, 'rate', jawak.rate, 'actual_amt', jawak.actual_amt, 
            'company_name', jawak.company_name, 'sell_repair_place', jawak.sell_repair_place, 'parchi_place', jawak.parchi_place, 
            'usage_list_id', jawak.usage_list_id, 'usage_list_hin', slul.list_name_hin, 'usage_list_eng', slul.list_name_eng, 'usage_list_roman', slul.list_name_roman,
            'condition_hin', sl.list_name_hin, 'condition_eng', sl.list_name_eng, 'condition_roman', sl.list_name_roman,
            'jawak_type_hin', slat.list_name_hin, 'jawak_type_eng', slat.list_name_eng, 'jawak_type_roman', slat.list_name_roman,
            'aawak_source_hin', slas.list_name_hin, 'aawak_source_eng', slas.list_name_eng, 'aawak_source_roman', slas.list_name_roman,
            'hl', jawak.hl, 'active', jawak.active, 'is_xl', jawak.is_xl, 'is_process', jawak.is_process, 'is_recieved', jawak.is_recieved,
            'enz_id', enz._id, 'container_capacity', enz.container_capacity, 'usage_report_id', ur._id, 'date', ur.date, 'reporter', ur.reporter,
            'usage_type', ur.usage_type, 'usage_report_hin', ut.list_name_hin, 'fayda', ur.fayda, 'nuksan', ur.nuksan, 'rating', ur.rating,
            'aawak_ref_obj', (SELECT JSON_Object('_id', awk._id, 'date', awk.date, 'lot_no', awk.lot_no, 'pkt_num', awk.pkt_num, 'remaining_qty', awk.remaining_qty) FROM rel_aawak_jawak raj LEFT JOIN aawak awk ON awk._id = raj.aawak_id WHERE raj.jawak_id = jawak._id LIMIT 1),
            'aawak_splits', (SELECT JSON_Group_Array(JSON_Object('rel_id', raj._id, 'aawak_id', raj.aawak_id, 'jawak_id', raj.jawak_id, 'qty', raj.qty, 'split_qty', raj.split_qty, 'is_split', raj.is_split, 'date', awk.date, 'lot_no', awk.lot_no, 'pkt_num', awk.pkt_num, 'remaining_qty', awk.remaining_qty)) FROM rel_aawak_jawak raj LEFT JOIN aawak awk ON awk._id = raj.aawak_id WHERE raj.jawak_id = jawak._id)
        )) as jawaks
        from jawak
        left join jawak_enzyme enz on enz.jawak_id = jawak._id
        left join usage_report ur on ur.jawak_id = jawak._id
        left join support_list ut on ut._id = ur.usage_type
        left join mm on mm._id = jawak.mm_id
        left join pbk on pbk._id = jawak.pbk_id
        left join state pst on pst._id = pbk.state_id
        left join mm amm on amm._id = jawak.jawak_mm_id
        left join v_item item on item._id = jawak.item_id
        left join v_subitem si on si._id = jawak.subitem_id
        left join support_list slul on slul._id = jawak.usage_list_id
        left join product on product._id = jawak.product_id
        left join support_list sl on sl._id = jawak.condition_id
        left join unit on unit._id = jawak.unit_id
        left join department dept on dept._id = jawak.dept_id
        left join support_list slat on slat._id = jawak.jawak_type_id
        left join support_list slas on slas._id = jawak.aawak_source_id
        left join nimitt nmt on nmt._id = jawak.nimitt_id
        left join state nst on nst._id = nmt.state_id ?
        group by
            case when jawak.voucher_no is not null then jawak.voucher_no
            else jawak._id
        end
        limit @limit offset @offset`,
    count: `select count(*) as total_count from jawak ? group by jawak.voucher_no`
}

const aawak = {
    update:
        `update aawak set
        date=@date,
        lot_no=@lot_no,
        voucher_no=@voucher_no,
        mm_id=@mm_id,
        pkt_num=@pkt_num,
        pbk_id=@pbk_id,
        aawak_mm_id=@aawak_mm_id,
        item_id=@item_id,
        usage_list_id = @usage_list_id,
        subitem_id=@subitem_id,
        product_id=@product_id,
        item_detail=@item_detail,
        condition_id=@condition_id,
        remaining_qty=round(remaining_qty + (@qty - qty), 3),
        qty=@qty,
        rate=@rate,
        actual_amt=@actual_amt,
        aawak_type_id=@aawak_type_id,
        aawak_source_id=@aawak_source_id,
        unit_id=@unit_id,
        description=@description,
        nimitt_id=@nimitt_id,
        dept_id=@dept_id,
        company_name=@company_name,
        isbill=@isbill,
        document=@document,
        hl=@hl,
        is_xl=@is_xl,
        is_auto_pd=@is_auto_pd,
        is_auto=@is_auto,
        is_variable_qty=@is_variable_qty,
        is_process=@is_process,
        updated_at=datetime('now','localtime')`
    , insert:
        `insert into aawak (
            date, lot_no, voucher_no, mm_id, pkt_num, pbk_id, aawak_mm_id, item_id, subitem_id, usage_list_id,
            product_id, item_detail, condition_id, qty, rate, actual_amt, 
            aawak_type_id, aawak_source_id, unit_id, description, nimitt_id, dept_id, company_name, 
            isbill, remaining_qty, document, hl, is_xl, active, is_auto_pd, is_auto, is_variable_qty, is_process)
        values (
            @date, @lot_no, @voucher_no, @mm_id, @pkt_num, @pbk_id, @aawak_mm_id, @item_id, @subitem_id, @usage_list_id,
            @product_id, @item_detail, @condition_id, @qty, @rate, @actual_amt, 
            @aawak_type_id, @aawak_source_id, @unit_id, @description, @nimitt_id, @dept_id, @company_name, 
            @isbill, @qty, @document, @hl, @is_xl, @active, @is_auto_pd, @is_auto, @is_variable_qty, @is_process)`
    , select:
        `select * from aawak ?`
    , select_full:
        `select aawak.*, 
        mm.mm_hin,mm.mm_eng,mm.mm_code,
        mm.state_id as mm_state_id, mst.state_hin as mm_state_hin, mst.state_eng as mm_state_eng,
        mst.zone_id as mm_zone_id, zn.zone_hin as mm_zone_hin, zn.zone_eng as mm_zone_eng,
        amm.mm_hin as aawak_mm_hin, amm.mm_eng as aawak_mm_eng, amm.mm_code as aawak_mm_code, 
        pbk.roll_no, pbk.pbk_hin, pbk.pbk_eng, pbk.relation, pbk.relative_name, pbk.address, pbk.mo_no,
        item.item_hin, item.item_eng, item.item_code, item.item_roman, item.icategories as icategories,
        si.subitem_hin, si.subitem_eng, si.subitem_roman, si.categories as scategories,
        slul.list_name_hin as usage_list_hin, slul.list_name_eng as usage_list_eng, slul.list_name_roman as usage_list_roman,
        product.sr_num, product.product_code,
        sl.list_name_hin as condition_hin, sl.list_name_eng as condition_eng,
        dept.dept_eng, dept.dept_hin, dept.dept_code,
        unit.unit_short, unit.unit_full,
        slat.list_name_hin as aawak_type_hin, slat.list_name_eng as aawak_type_eng,
        slas.list_name_hin as aawak_source_hin, slas.list_name_eng as aawak_source_eng,
        nmt.nimitt_hin, nmt.nimitt_eng, nmt.relative_name as father_name, nmt.state_id as nimitt_state_id, pst.state_hin as nimitt_state_hin, pst.state_eng as nimitt_state_eng,
        JSON_Object('_id', enz._id, 'container_aawak_source_id', enz.container_aawak_source_id, 'container_aawak_source_hin', enz_as.list_name_hin,
            'container_enz_no', enz.container_enz_no, 'container_capacity', enz.container_capacity, 'container_qty', enz.container_qty) as enz
        from aawak
        left join aawak_enzyme enz on enz.aawak_id = aawak._id
        left join support_list enz_as on enz_as._id = enz.container_aawak_source_id
        left join mm on mm._id = aawak.mm_id
        left join state mst on mst._id = mm.state_id
        left join zone zn on zn._id = mst.zone_id
        left join pbk on pbk._id = aawak.pbk_id
        left join mm amm on amm._id = aawak.aawak_mm_id
        left join v_item item on item._id = aawak.item_id
        left join v_subitem si on si._id = aawak.subitem_id
        left join support_list slul on slul._id = aawak.usage_list_id
        left join product on product._id = aawak.product_id
        left join support_list sl on sl._id = aawak.condition_id
        left join unit on unit._id = aawak.unit_id
        left join department dept on dept._id = aawak.dept_id
        left join support_list slat on slat._id = aawak.aawak_type_id
        left join support_list slas on slas._id = aawak.aawak_source_id
        left join nimitt nmt on nmt._id = aawak.nimitt_id
        left join state pst on pst._id = nmt.state_id ? limit @limit offset @offset`
    , select_lot_no:
        `select distinct aawak.lot_no, aawak.*, 
        mm.mm_hin,mm.mm_eng,mm.mm_code,
        amm.mm_hin as aawak_mm_hin, amm.mm_eng as aawak_mm_eng, amm.mm_code as aawak_mm_code, 
        pbk.roll_no, pbk.pbk_hin, pbk.pbk_eng, pbk.relation, pbk.relative_name,
        item.item_hin, item.item_eng, item.item_code, item.item_roman, item.icategories as icategories,
        si.subitem_hin, si.subitem_eng, si.subitem_roman, si.categories as scategories,
        sl.list_name_hin as condition_hin, sl.list_name_eng as condition_eng,
        unit.unit_short, unit.unit_full,
        slat.list_name_hin as aawak_type_hin, slat.list_name_eng as aawak_type_eng,
        slas.list_name_hin as aawak_source_hin, slas.list_name_eng as aawak_source_eng
        from aawak 
        left join mm on mm._id = aawak.mm_id
        left join pbk on pbk._id = aawak.pbk_id
        left join mm amm on amm._id = aawak.aawak_mm_id
        left join v_item item on item._id = aawak.item_id
        left join v_subitem si on si._id = aawak.subitem_id
        left join support_list sl on sl._id = aawak.condition_id
        left join unit on unit._id = aawak.unit_id
        left join support_list slat on slat._id = aawak.aawak_type_id
        left join support_list slas on slas._id = aawak.aawak_source_id ?`
    , order:
        `date, aawak_mm_hin, aawak_mm_eng, pkt_num`,
    delete: `delete from aawak where _id = @_id`,
    select_all_voucher:
        `select aawak.voucher_no, aawak.date, aawak.pkt_num, aawak.mm_id, aawak.aawak_mm_id, aawak.pbk_id, aawak.nimitt_id, 
        aawak.description, aawak.dept_id,
        mm.mm_hin,mm.mm_eng,mm.mm_code,
        amm.mm_hin as aawak_mm_hin, amm.mm_eng as aawak_mm_eng, amm.mm_code as aawak_mm_code, 
        pbk.roll_no, pbk.pbk_hin, pbk.pbk_eng, pbk.relation, pbk.relative_name, pbk.state_id as pbk_state_id,
        pst.state_hin as pbk_state_hin, pst.state_eng as pbk_state_eng,
        dept.dept_eng, dept.dept_hin, dept.dept_code,
        nmt.nimitt_hin, nmt.nimitt_eng, nmt.relative_name as father_name, nmt.state_id as nimitt_state_id, nst.state_hin as nimitt_state_hin, nst.state_eng as nimitt_state_eng
        from aawak 
        left join mm on mm._id = aawak.mm_id
        left join pbk on pbk._id = aawak.pbk_id
        left join state pst on pst._id = pbk.state_id
        left join mm amm on amm._id = aawak.aawak_mm_id
        left join department dept on dept._id = aawak.dept_id
        left join nimitt nmt on nmt._id = aawak.nimitt_id
        left join state nst on nst._id = nmt.state_id ? group by voucher_no limit @limit offset @offset`,
    select_one_voucher:
        `select aawak.*, 
        item.item_hin, item.item_eng, item.item_code, item.item_roman, item.icategories as icategories,
        si.subitem_hin, si.subitem_eng, si.subitem_roman, si.categories as scategories,
        slul.list_name_hin as usage_list_hin, slul.list_name_eng as usage_list_eng, slul.list_name_roman as usage_list_roman,
        product.sr_num, product.product_code,
        sl.list_name_hin as condition_hin, sl.list_name_eng as condition_eng,
        unit.unit_short, unit.unit_full,
        slat.list_name_hin as aawak_type_hin, slat.list_name_eng as aawak_type_eng,
        slas.list_name_hin as aawak_source_hin, slas.list_name_eng as aawak_source_eng,
        JSON_Object('_id', enz._id, 'container_aawak_source_id', enz.container_aawak_source_id, 'container_aawak_source_hin', enz_as.list_name_hin,
            'container_enz_no', enz.container_enz_no, 'container_capacity', enz.container_capacity, 'container_qty', enz.container_qty) as enz
        from aawak 
        left join aawak_enzyme enz on enz.aawak_id = aawak._id
        left join support_list enz_as on enz_as._id = enz.container_aawak_source_id
        left join v_item item on item._id = aawak.item_id
        left join v_subitem si on si._id = aawak.subitem_id
        left join support_list slul on slul._id = aawak.usage_list_id
        left join product on product._id = aawak.product_id
        left join support_list sl on sl._id = aawak.condition_id
        left join unit on unit._id = aawak.unit_id
        left join support_list slat on slat._id = aawak.aawak_type_id
        left join support_list slas on slas._id = aawak.aawak_source_id where aawak.voucher_no = @voucher_no`,
}

const aawak_voucher = {
    select_full:
        `select aawak.voucher_no, aawak.date, aawak.mm_id, aawak.pkt_num, aawak.pbk_id, aawak.aawak_mm_id, aawak.description,
            aawak.nimitt_id, aawak.dept_id,
            mm.mm_hin,mm.mm_eng,mm.mm_code,
            amm.mm_hin as aawak_mm_hin, amm.mm_eng as aawak_mm_eng, amm.mm_code as aawak_mm_code,
            pbk.roll_no, pbk.pbk_hin, pbk.pbk_eng, pbk.relation, pbk.relative_name,
            pbk.state_id as pbk_state_id, pst.state_hin as pbk_state_hin, pst.state_eng as pbk_state_eng,
            dept.dept_eng, dept.dept_hin, dept.dept_code,
            nmt.nimitt_hin, nmt.nimitt_eng, nmt.relative_name as father_name, nmt.state_id as nimitt_state_id, nst.state_hin as nimitt_state_hin, nst.state_eng as nimitt_state_eng,
            json_group_array(json_object(
                '_id', aawak._id, 'lot_no', aawak.lot_no, 'item_id', aawak.item_id, 'subitem_id', aawak.subitem_id,
                'product_id', aawak.product_id,'condition_id', aawak.condition_id, 'unit_id', aawak.unit_id,
                'aawak_source', aawak.aawak_source_id,'aawak_type_id', aawak.aawak_type_id, 'item_detail', aawak.item_detail,
                'item_hin', item.item_hin, 'item_eng', item.item_eng, 'item_code', item.item_code, 'item_roman', item.item_roman,
                'icategories', item.icategories, 'subitem_hin', si.subitem_hin, 'subitem_eng', si.subitem_eng,
                'scategories', si.categories, 'sr_num', product.sr_num, 'product_code', product.product_code,
                'qty', aawak.qty, 'remaining_qty', aawak.remaining_qty, 'unit_short', unit.unit_short, 'unit_full', unit.unit_full,
                'rate', aawak.rate, 'actual_amt', aawak.actual_amt, 'company_name', aawak.company_name,
                'usage_list_hin', slul.list_name_hin, 'usage_list_eng', slul.list_name_eng, 'usage_list_roman', slul.list_name_roman,
                'condition_hin', sl.list_name_hin, 'condition_eng', sl.list_name_eng, 'condition_roman', sl.list_name_roman,
                'aawak_type_hin', slat.list_name_hin, 'aawak_type_eng', slat.list_name_eng, 'aawak_type_roman', slat.list_name_roman,
                'aawak_source_hin', slas.list_name_hin, 'aawak_source_eng', slas.list_name_eng, 'aawak_source_roman', slas.list_name_roman,
                'isbill', aawak.isbill, 'document', aawak.document, 'hl', aawak.hl, 'active', aawak.active, 'is_xl', aawak.is_xl,
                'is_auto_pd', aawak.is_auto_pd, 'is_auto', aawak.is_auto, 'is_variable_qty', aawak.is_variable_qty, 'is_process', aawak.is_process,
                'enz_id', enz._id, 'container_aawak_source_id', enz.container_aawak_source_id, 'container_aawak_source_hin', enz_as.list_name_hin,
                'container_enz_no', enz.container_enz_no, 'container_capacity', enz.container_capacity, 'container_qty', enz.container_qty
                 )) as aawaks
            from aawak
            left join aawak_enzyme enz on enz.aawak_id = aawak._id
            left join support_list enz_as on enz_as._id = enz.container_aawak_source_id
            left join mm on mm._id = aawak.mm_id
            left join pbk on pbk._id = aawak.pbk_id
            left join state pst on pst._id = pbk.state_id
            left join mm amm on amm._id = aawak.aawak_mm_id
            left join v_item item on item._id = aawak.item_id
            left join v_subitem si on si._id = aawak.subitem_id
            left join support_list slul on slul._id = aawak.usage_list_id
            left join product on product._id = aawak.product_id
            left join support_list sl on sl._id = aawak.condition_id
            left join unit on unit._id = aawak.unit_id
            left join department dept on dept._id = aawak.dept_id
            left join support_list slat on slat._id = aawak.aawak_type_id
            left join support_list slas on slas._id = aawak.aawak_source_id
            left join nimitt nmt on nmt._id = aawak.nimitt_id
            left join state nst on nst._id = nmt.state_id ?
            group by
                case when aawak.voucher_no is not null then aawak.voucher_no
                else aawak._id
            end
            limit @limit offset @offset`,
    count: `select count(*) as total_count from aawak ? group by aawak.voucher_no`
}


const bachat = {
    select:
        `select * from bachat ?`,
    select_exists:
        `select * from bachat where dept_id = @dept_id AND mm_id = @mm_id AND item_id = @item_id AND unit_id = @unit_id AND IFNULL(subitem_id, 0) = IFNULL(@subitem_id, 0)`
    , select_full:
        `select bachat.*,
        mm.mm_hin,mm.mm_eng,mm.mm_code, mm.state_id, st.state_hin, st.state_eng, st.zone_id, zn.zone_hin, zn.zone_eng,   
        it.item_hin, it.item_eng, it.item_code, it.item_roman, it.icategories as icategories, it.document as idocument,
        si.subitem_hin, si.subitem_eng, si.subitem_roman, si.categories as scategories, si.document as sdocument,
        bachat.unit_id,unit.unit_short, unit.unit_full,             
        dept.dept_eng, dept.dept_hin, dept.dept_code
        from bachat
        left join mm on mm._id = bachat.mm_id
        left join v_item it on it._id = bachat.item_id
        left join v_subitem si on si._id = bachat.subitem_id
        left join unit on unit._id = bachat.unit_id   
        left join state st on st._id = mm.state_id
        left join zone zn on zn._id = st.zone_id
        left join department dept on dept._id = bachat.dept_id ? limit @limit offset @offset`
    ,
    with_pending_aawak: `select bachat.*,
        mm.mm_hin, mm.mm_eng, mm.mm_code, mm.state_id, st.state_hin, st.state_eng, st.zone_id, zn.zone_hin, zn.zone_eng,
        vi.item_hin, vi.item_eng, vi.item_code, vi.item_roman,
        vi.icategories as icategories,
        vs.subitem_hin, vs.subitem_eng, vs.subitem_roman,
        vs.categories as scategories,
        bachat.unit_id, unit.unit_short, unit.unit_full,
        dept.dept_eng, dept.dept_hin, dept.dept_code,
        CASE WHEN aawak._id is not null 
            THEN json_group_array(distinct json_object(
                '_id', aawak._id, 'date', aawak.date, 'aawak_mm_id', aawak.aawak_mm_id,
                'aawak_mm_hin', amm.mm_hin, 'pkt_num', aawak.pkt_num, 'pbk_id', aawak.pbk_id,
                'roll_no', pbk.roll_no, 'pbk_hin', pbk.pbk_hin, 'relation', pbk.relation,
                'relative_name', pbk.relative_name, 'item_detail', aawak.item_detail,
                'company_name', aawak.company_name, 'condition_id', aawak.condition_id,
                'condition_hin', cnd.list_name_hin, 'qty', aawak.qty, 'rate', aawak.rate,
                'actual_amt', aawak.actual_amt, 'aawak_type_id', aawak.aawak_type_id,
                'aawak_type_hin', awk_type.list_name_hin, 'description', aawak.description,
                'remaining_qty', aawak.remaining_qty
            )) 
            ELSE json('[]') END as aawaks
        from bachat
        left join aawak on aawak.dept_id = bachat.dept_id 
            AND aawak.mm_id = bachat.mm_id 
            AND aawak.item_id = bachat.item_id 
            AND IFNULL(aawak.subitem_id, 0) = IFNULL(bachat.subitem_id, 0) 
            AND aawak.unit_id = bachat.unit_id 
            AND aawak.remaining_qty <> 0
        left join mm amm on amm._id = aawak.aawak_mm_id
        left join pbk on pbk._id = aawak.pbk_id
        left join support_list cnd on cnd._id = aawak.condition_id
        left join support_list awk_type on awk_type._id = aawak.aawak_type_id
        left join mm on mm._id = bachat.mm_id
        left join state st on st._id = mm.state_id
        left join zone zn on zn._id = st.zone_id
        left join v_item vi on vi._id = bachat.item_id
        left join v_subitem vs on vs._id = bachat.subitem_id
        left join unit on unit._id = bachat.unit_id
        left join department dept on dept._id = bachat.dept_id ? 
        group by bachat.mm_id, bachat.item_id, bachat.subitem_id, bachat.unit_id # limit @limit offset @offset`,
    insert:
        `insert into bachat (
            mm_id,
            item_id,
            subitem_id,
            Stock,
            Used,
            New,
            Old,
            Defective,
            Scrap,
            unit_id,
            dept_id,
            Repairing,
            difference,
            active)
        values (
            @mm_id,
            @item_id,
            @subitem_id,
            @Stock,
            @Used,
            @New,
            @Old,
            @Defective,
            @Scrap,
            @unit_id,
            @dept_id,
            @Repairing,
            @difference,
            @active)`
    , insert_aawak_ins:
        `insert into bachat(mm_id, item_id, subitem_id, Stock, New, Old, Defective, Repairing, Scrap, difference, unit_id, dept_id) 
        values(@mm_id, @item_id, @subitem_id, @qty, (CASE WHEN @condition_id = 33 THEN @qty ELSE 0 END), (CASE WHEN @condition_id = 34 THEN @qty ELSE 0 END), (CASE WHEN @condition_id = 35 THEN @qty ELSE 0 END), (CASE WHEN(select list_name_eng from support_list where _id = @condition_id) LIKE '%Repairing%' THEN @qty ELSE 0 END), (CASE WHEN @condition_id = 36 THEN @qty ELSE 0 END), @difference, @unit_id, @dept_id);`
    , update_aawak_ins:
        `update bachat set 
        Stock = round(Stock + @qty, 3),
        New = round(New + (CASE WHEN @condition_id = 33 THEN @qty ELSE 0 END), 3),
        Old = round(Old + (CASE WHEN @condition_id = 34 THEN @qty ELSE 0 END), 3),
        Defective = round(Defective + (CASE WHEN @condition_id = 35 THEN @qty ELSE 0 END), 3),
        Repairing = round(Repairing + (CASE WHEN (select list_name_eng from support_list where _id = @condition_id) LIKE '%Repairing%' THEN @qty ELSE 0 END), 3),
        Scrap = round(Scrap + (CASE WHEN @condition_id = 36 THEN @qty ELSE 0 END), 3),
        difference = @difference
        where mm_id = @mm_id AND item_id = @item_id AND dept_id = @dept_id AND IFNULL(subitem_id, 0) = IFNULL(@subitem_id, 0) AND unit_id = @unit_id`
    , update_byid_aawak_ins:
        `update bachat set 
        Stock = round(Stock + @qty, 3),
        New = round(New + (CASE WHEN @condition_id = 33 THEN @qty ELSE 0 END), 3),
        Old = round(Old + (CASE WHEN @condition_id = 34 THEN @qty ELSE 0 END), 3),
        Defective = round(Defective + (CASE WHEN @condition_id = 35 THEN @qty ELSE 0 END), 3),
        Repairing = round(Repairing + (CASE WHEN (select list_name_eng from support_list where _id = @condition_id) LIKE '%Repairing%' THEN @qty ELSE 0 END), 3),
        Scrap = round(Scrap + (CASE WHEN @condition_id = 36 THEN @qty ELSE 0 END), 3),
        difference = @difference
        where _id = @_id`
    , update_aawak_del:
        `update bachat set
        Stock = round(Stock - @qty, 3),
        New = round(New - (CASE WHEN @condition_id = 33 THEN @qty ELSE 0 END), 3),
        Old = round(Old - (CASE WHEN @condition_id = 34 THEN @qty ELSE 0 END), 3),
        Defective = round(Defective - (CASE WHEN @condition_id = 35 THEN @qty ELSE 0 END), 3),
        Repairing = round(Repairing - (CASE WHEN(select list_name_eng from support_list where _id = @condition_id) LIKE '%Repairing%' THEN @qty ELSE 0 END), 3),
        Scrap = round(Scrap - (CASE WHEN @condition_id = 36 THEN @qty ELSE 0 END), 3),
        difference = @difference
        where mm_id = @mm_id AND item_id = @item_id AND dept_id = @dept_id AND IFNULL(subitem_id, 0) = IFNULL(@subitem_id, 0) AND unit_id = @unit_id;`
    , insert_jawak_ins:
        `insert into bachat(mm_id, item_id, subitem_id, Stock, New, Old, Defective, Repairing, Scrap, difference, unit_id, dept_id) 
        values(@mm_id, @item_id, @subitem_id, 0-@qty, (CASE WHEN @condition_id = 33 THEN 0-@qty ELSE 0 END), (CASE WHEN @condition_id = 34 THEN 0-@qty ELSE 0 END), (CASE WHEN @condition_id = 35 THEN 0-@qty ELSE 0 END), (CASE WHEN(select list_name_eng from support_list where _id = @condition_id) LIKE '%Repairing%' THEN 0-@qty ELSE 0 END), (CASE WHEN @condition_id = 36 THEN 0-@qty ELSE 0 END), 0-@difference, @unit_id, @dept_id);`
    , update_jawak_ins:
        `update bachat set 
        Stock = round(Stock - @qty, 3),
        Used = round(Used + (CASE WHEN @jawak_type_id = 27 THEN @qty ELSE 0 END), 3),
        New = round(New - (CASE WHEN @condition_id = 33 THEN @qty ELSE 0 END), 3),
        Old = round(Old - (CASE WHEN @condition_id = 34 THEN @qty ELSE 0 END), 3),
        Defective = round(Defective - (CASE WHEN @condition_id = 35 THEN @qty ELSE 0 END), 3),
        Repairing = round(Repairing - (CASE WHEN(select list_name_eng from support_list where _id = @condition_id) LIKE '%Repairing%' THEN @qty ELSE 0 END), 3),
        Scrap = round(Scrap - (CASE WHEN @condition_id = 36 THEN @qty ELSE 0 END), 3),
        difference = @difference
        where mm_id = @mm_id AND item_id = @item_id AND dept_id = @dept_id AND IFNULL(subitem_id, 0) = IFNULL(@subitem_id, 0) AND unit_id = @unit_id;`
    , update_jawak_del:
        `update bachat set
        Stock = round(Stock + @qty, 3),
        Used = round(Used - (CASE WHEN @jawak_type_id = 27 THEN @qty ELSE 0 END), 3),
        New = round(New + (CASE WHEN @condition_id = 33 THEN @qty ELSE 0 END), 3),
        Old = round(Old + (CASE WHEN @condition_id = 34 THEN @qty ELSE 0 END), 3),
        Defective = round(Defective + (CASE WHEN @condition_id = 35 THEN @qty ELSE 0 END), 3),
        Repairing = round(Repairing + (CASE WHEN(select list_name_eng from support_list where _id = @condition_id) LIKE '%Repairing%' THEN @qty ELSE 0 END), 3),
        Scrap = round(Scrap + (CASE WHEN @condition_id = 36 THEN @qty ELSE 0 END), 3),
        difference = @difference
        where mm_id = @mm_id AND item_id = @item_id AND dept_id = @dept_id AND IFNULL(subitem_id, 0) = IFNULL(@subitem_id, 0) AND unit_id = @unit_id;`
    , update:
        `update bachat set
        mm_id=@mm_id,
        item_id=@item_id,
        subitem_id=@subitem_id,
        Stock=@Stock,
        Used=@Used,
        New=@New,
        Old=@Old,
        Defective=@Defective,
        Scrap=@Scrap,
        unit_id=@unit_id,
        dept_id=@dept_id,
        Repairing=@Repairing,
        difference = @difference,
        updated_at=datetime('now','localtime')`
    , order:
        `mm.mm_hin, mm.mm_eng, item_hin, subitem_hin, item_eng, subitem_eng, unit.unit_short`
}

const bachat_new = {
    select:
        `select * from bachat_new ?`
    , select_exists:
        `select * from bachat_new 
        where dept_id = @dept_id AND mm_id = @mm_id AND month = @month AND year = @year AND item_id = @item_id AND unit_id = @unit_id AND IFNULL(subitem_id, 0) = IFNULL(@subitem_id, 0) AND IFNULL(@condition_id, 0) = IFNULL(condition_id, 0)`
    // , select_exists: `select strftime('%m', @date)`
    , select_full:
        `select bachat_new.*,
        mm.mm_hin,mm.mm_eng,mm.mm_code, mm.state_id, st.state_hin, st.state_eng, st.zone_id, zn.zone_hin, zn.zone_eng,     
        it.item_hin, it.item_eng, it.item_code, it.item_roman, it.icategories as icategories, it.document as idocument,
        si.subitem_hin, si.subitem_eng, si.subitem_roman, si.categories as scategories, si.document as sdocument,
        bachat_new.unit_id,unit.unit_short, unit.unit_full,             
        slc.list_name_hin as condition_hin, slc.list_name_eng as condition_eng,
        dept.dept_eng, dept.dept_hin, dept.dept_code
        from bachat_new
        left join mm on mm._id = bachat_new.mm_id
        left join v_item it on it._id = bachat_new.item_id
        left join v_subitem si on si._id = bachat_new.subitem_id
        left join unit on unit._id = bachat_new.unit_id   
        left join state st on st._id = mm.state_id
        left join zone zn on zn._id = st.zone_id
        left join support_list slc on slc._id = bachat_new.condition_id
        left join department dept on dept._id = bachat_new.dept_id ? limit @limit offset @offset`
    , select_all:
        `select bcht.*, json_group_array(list_name_hin) as arr_condition_hin, json_group_array(condition_id) as arr_condition_id, json_group_array(sum_aawak) as arr_sum_aawak, json_group_array(sum_used) as arr_sum_used, json_group_array(sum_jawak) as arr_sum_jawak, json_group_array(sum_bachat) as arr_sum_bachat, json_group_array(sum_difference) as arr_sum_difference, sum(sum_aawak) as total_aawak_all, sum(sum_jawak) as total_jawak_all, sum(sum_used) as total_used_all, sum(sum_bachat) as total_bachat_all, sum(sum_difference) as total_difference_all,
        mm.mm_hin, mm.mm_eng, mm.mm_code, mm.state_id, st.state_hin, st.state_eng,
        it.item_hin, it.item_eng, it.item_code, it.item_roman, it.icategories as arr_icategories,
        sit.subitem_hin, sit.subitem_eng, sit.categories as arr_scategories,
        unit.unit_short, unit.unit_full,
        dept.dept_code, dept.dept_hin, dept.dept_eng
        from (select sum(total_aawak) as sum_aawak, sum(used_jawak) as sum_used, sum(jawak) as sum_jawak, sum(bachat) as sum_bachat, sum(difference) as sum_difference, bn.*,
            sl.list_name_hin, sl.list_name_eng from bachat_new bn
            left join support_list sl on sl._id = bn.condition_id ?
            group by mm_id, item_id, subitem_id, unit_id, condition_id) bcht 
        left join mm on mm._id = bcht.mm_id
        left join state st on st._id = mm.state_id
        left join v_item it on it._id = bcht.item_id
        left join v_subitem sit on sit._id = bcht.subitem_id
        left join unit on unit._id = bcht.unit_id
        left join department dept on dept._id = bcht.dept_id #
        group by bcht.mm_id, bcht.item_id, bcht.subitem_id, bcht.unit_id order by @order;`

    , insert:
        `insert into bachat_new (
            month, year, mm_id, item_id, subitem_id, condition_id, dept_id, total_aawak, jawak, used_jawak, bachat, unit_id, difference, past_bachat)
        values(
            @month, @year, @mm_id, @item_id, @subitem_id, @condition_id, @dept_id, ROUND(@total_aawak, 3), ROUND(@jawak, 3), ROUND(@used_jawak, 3), ROUND(@bachat, 3), @unit_id, @difference,
            ROUND(IFNULL((select IFNULL(past_bachat, 0) + IFNULL(bachat, 0) from bachat_new 
            where mm_id = @mm_id AND item_id = @item_id AND dept_id = @dept_id AND unit_id = @unit_id 
            AND IFNULL(subitem_id, 0) = IFNULL(@subitem_id, 0) AND IFNULL(condition_id, 0) = IFNULL(@condition_id, 0)
            AND ((year = @year AND month < @month) OR year < @year) order by year desc, month desc limit 1), 0), 3));`
    , insert_aawak_ins:
        `insert into bachat_new (
            month, year, mm_id, item_id, subitem_id, condition_id, dept_id, total_aawak, bachat, unit_id, difference, past_bachat)
        values(
            @month, @year, @mm_id, @item_id, @subitem_id, @condition_id, @dept_id, ROUND(@qty, 3), ROUND(@qty, 3), @unit_id, @difference,
            ROUND(IFNULL((select IFNULL(past_bachat, 0) + IFNULL(bachat, 0) from bachat_new 
            where mm_id = @mm_id AND item_id = @item_id AND dept_id = @dept_id AND unit_id = @unit_id 
            AND IFNULL(subitem_id, 0) = IFNULL(@subitem_id, 0) AND IFNULL(condition_id, 0) = IFNULL(@condition_id, 0)
            AND ((year = @year AND month < @month) OR year < @year) order by year desc, month desc limit 1), 0), 3));`
    , update_aawak_ins:
        `update bachat_new
        set
            total_aawak = round(total_aawak + @qty, 3),
            bachat = round(bachat + @qty, 3),
            difference = @difference
        where dept_id = @dept_id AND mm_id = @mm_id AND month = @month AND year = @year AND item_id = @item_id AND unit_id = @unit_id AND ((@subitem_id IS NULL AND subitem_id IS NULL) OR subitem_id = @subitem_id) AND ((@condition_id IS NULL AND condition_id IS NULL) OR condition_id = @condition_id)`
    , update_byid_aawak_ins:
        `update bachat_new
        set
            total_aawak = round(total_aawak + @qty, 3),
            bachat = round(bachat + @qty, 3)
        where _id = @_id`
    , update_aawak_del:
        `update bachat_new
        set
            total_aawak = round(total_aawak - @qty, 3),
            bachat = round(bachat - @qty, 3),
            difference = @difference
        where dept_id = @dept_id AND mm_id = @mm_id AND month = @month AND year = @year AND item_id = @item_id AND unit_id = @unit_id AND ((@subitem_id IS NULL AND subitem_id IS NULL) OR subitem_id = @subitem_id) AND ((@condition_id IS NULL AND condition_id IS NULL) OR condition_id = @condition_id)`
    , insert_jawak_ins:
        `insert into bachat_new (
            month, year, mm_id, item_id, subitem_id, condition_id, dept_id, jawak, used_jawak, bachat, unit_id, difference, past_bachat)
        values(
            @month, @year, @mm_id, @item_id, @subitem_id, @condition_id, @dept_id, (CASE WHEN @jawak_type_id <> 27 THEN ROUND(@qty, 3) ELSE 0 END), (CASE WHEN @jawak_type_id = 27 THEN ROUND(@qty, 3) ELSE 0 END), ROUND((0 - @qty), 3), @unit_id, @difference,
            IFNULL((select IFNULL(past_bachat, 0) + IFNULL(bachat, 0) from bachat_new 
            where mm_id = @mm_id AND item_id = @item_id AND dept_id = @dept_id AND unit_id = @unit_id 
            AND IFNULL(subitem_id, 0) = IFNULL(@subitem_id, 0) AND IFNULL(condition_id, 0) = IFNULL(@condition_id, 0)
            AND ((year = @year AND month < @month) OR year < @year) order by year desc, month desc limit 1), 0));`
    , update_jawak_ins:
        `update bachat_new
        set
            jawak = round((CASE WHEN @jawak_type_id <> 27 THEN jawak + @qty ELSE jawak END), 3),
            used_jawak = round((CASE WHEN @jawak_type_id = 27 THEN used_jawak + @qty ELSE used_jawak END), 3),
            bachat = round(bachat - @qty, 3),
            difference = @difference
        where dept_id = @dept_id AND mm_id = @mm_id AND month = @month AND year = @year AND item_id = @item_id AND unit_id = @unit_id AND ((@subitem_id IS NULL AND subitem_id IS NULL) OR subitem_id = @subitem_id) AND ((@condition_id IS NULL AND condition_id IS NULL) OR condition_id = @condition_id)`
    , update_jawak_del:
        `update bachat_new
        set
            jawak = round((CASE WHEN @jawak_type_id <> 27 THEN jawak - @qty ELSE jawak END), 3),
            used_jawak = round((CASE WHEN @jawak_type_id = 27 THEN used_jawak - @qty ELSE used_jawak END), 3),
            bachat = round(bachat + @qty, 3),
            difference = @difference
        where dept_id = @dept_id AND mm_id = @mm_id AND month = @month AND year = @year AND item_id = @item_id AND unit_id = @unit_id AND ((@subitem_id IS NULL AND subitem_id IS NULL) OR subitem_id = @subitem_id) AND ((@condition_id IS NULL AND condition_id IS NULL) OR condition_id = @condition_id)`
    , update_past_bachat:
        `update bachat_new
        set
            past_bachat = ROUND(past_bachat + @qty, 3)
            where (year > @year OR (year = @year AND month > @month)) AND 
            dept_id = @dept_id AND mm_id = @mm_id AND item_id = @item_id AND unit_id = @unit_id AND IFNULL(subitem_id, 0) = IFNULL(@subitem_id, 0) AND IFNULL(condition_id, 0) = IFNULL(@condition_id, 0)`
    , update:
        `update bachat_new set
        month=@month,
        year=@year,
        mm_id=@mm_id,
        item_id=@item_id,
        subitem_id=@subitem_id,
        condition_id=@condition_id,
        total_aawak=ROUND(@total_aawak, 2),
        jawak=ROUND(@jawak, 2),
        used_jawak=ROUND(@used_jawak, 2),
        bachat=ROUND(@bachat, 2),
        unit_id=@unit_id,
        dept_id=@dept_id,
        difference = @difference,
        updated_at=julianday('now', 'localtime')`
    , update_auto:
        `update bachat_new set
        month=@month,
        year=@year,
        mm_id=@mm_id,
        item_id=@item_id,
        subitem_id=@subitem_id,
        condition_id=@condition_id,
        total_aawak=ROUND(@total_aawak, 2),
        jawak=ROUND(@jawak, 2),
        used_jawak=ROUND(@used_jawak, 2),
        bachat=ROUND(@bachat, 2),
        unit_id=@unit_id,
        dept_id=@dept_id,
        difference = @difference,
        updated_at=julianday('now', 'localtime') where _id = @_id`
    , order:
        `year, month, mm.mm_hin, item_hin, subitem_hin, unit.unit_short`
}

const pbk_bachat = {
    select: `select * from pbk_bachat ?`,
    select_full: `select pbk_bachat.*,
      pbk.pbk_hin, pbk.pbk_eng, pbk.roll_no,
      it.item_hin, it.item_eng, it.item_code, it.item_roman,
      si.subitem_hin, si.subitem_eng, si.subitem_roman,
      unit.unit_short, unit.unit_full,
      sl.list_name_hin as condition_hin, sl.list_name_eng as condition_eng,
      dept.dept_code, dept.dept_hin, dept.dept_eng
      from pbk_bachat
      left join pbk on pbk._id = pbk_bachat.pbk_id
      left join v_item it on it._id = pbk_bachat.item_id
      left join v_subitem si on si._id = pbk_bachat.subitem_id
      left join unit on unit._id = pbk_bachat.unit_id
      left join support_list sl on sl._id = pbk_bachat.condition_id
      left join department dept on dept._id = pbk_bachat.dept_id ? limit @limit offset @offset`,
    insert: `insert into pbk_bachat (
      pbk_id, item_id, subitem_id, unit_id, condition_id, qty, dept_id, active)
    values (
      @pbk_id, @item_id, @subitem_id, @unit_id, @condition_id, @qty, @dept_id, @active)`,
    update: `update pbk_bachat set
      qty = @qty,
      updated_at = datetime('now', 'localtime')
      where pbk_id = @pbk_id AND item_id = @item_id AND unit_id = @unit_id AND dept_id = @dept_id AND IFNULL(subitem_id, 0) = IFNULL(@subitem_id, 0) AND IFNULL(condition_id, 0) = IFNULL(@condition_id, 0)`,
    update_by_id: `update pbk_bachat set qty = @qty, updated_at = datetime('now', 'localtime') where _id = @pbk_bachat_id`,
    update_qty: `update pbk_bachat set qty = qty + @qty, updated_at = datetime('now', 'localtime') where pbk_id = @pbk_id AND item_id = @item_id AND unit_id = @unit_id AND dept_id = @dept_id AND IFNULL(subitem_id, 0) = IFNULL(@subitem_id, 0) AND IFNULL(condition_id, 0) = IFNULL(@condition_id, 0)`,
    find_bachat_from_closing: `select _id from pbk_bachat where pbk_id = @pbk_id AND item_id = @item_id AND unit_id = @unit_id AND dept_id = @dept_id AND IFNULL(subitem_id, 0) = IFNULL(@subitem_id, 0) AND IFNULL(condition_id, 0) = IFNULL(@condition_id, 0)`,
    order: `pbk.pbk_hin, item_hin, subitem_hin, unit.unit_short`
}

const pbk_closing = {
    select: `select * from pbk_closing ?`,
    select_full: `select pbk_closing.*,
      pbk.pbk_hin, pbk.pbk_eng, pbk.roll_no,
      it.item_hin, it.item_eng, it.item_code, it.item_roman,
      si.subitem_hin, si.subitem_eng, si.subitem_roman,
      unit.unit_short, unit.unit_full,
      st.state_hin, st.state_eng,
      sl.list_name_hin as condition_hin, sl.list_name_eng as condition_eng
      from pbk_closing
      left join pbk on pbk._id = pbk_closing.pbk_id
      left join state st on st._id = pbk.state_id
      left join v_item it on it._id = pbk_closing.item_id
      left join v_subitem si on si._id = pbk_closing.subitem_id
      left join unit on unit._id = pbk_closing.unit_id
      left join support_list sl on sl._id = pbk_closing.condition_id ? limit @limit offset @offset`,
    insert: `insert into pbk_closing (
      pbk_id, date, item_id, subitem_id, unit_id, condition_id, qty, sw_bachat, difference, voucher_no, active, hl, is_xl)
    values (
      @pbk_id, @date, @item_id, @subitem_id, @unit_id, @condition_id, @qty, @sw_bachat, @difference, @voucher_no, @active, @hl, @is_xl)`,
    update: `update pbk_closing set
      qty = @qty,
      sw_bachat = @sw_bachat,
      difference = @difference,
      updated_at = datetime('now', 'localtime')
      where _id = @_id`,
    order: `date desc, pbk.pbk_hin, item_hin, subitem_hin, unit.unit_short`
}


const mm = {
    select:
        `select * from mm ?`
    , select_full:
        `select mm.*,
        st.state_hin, st.state_eng, 
        cnt.country_hin, cnt.country_eng, 
        zn.zone_hin, zn.zone_eng, 
        pm.mm_hin as parent_mm_hin, pm.mm_eng as parent_mm_eng, pm.mm_roman as parent_mm_roman, pm.mm_code as parent_mm_code, 
        nm.nimitt_hin, nm.nimitt_eng, nm.gender as nimitt_gender,
        nst.state_hin as nimitt_state_hin, nst.state_eng as nimitt_state_eng,
        dept.dept_hin, dept.dept_eng, dept.dept_code 
        from mm
        left join state st on st._id = mm.state_id
        left join zone zn on zn._id = st.zone_id
        left join country cnt on cnt._id = st.country_id
        left join mm pm on pm._id = mm.parent_mm_id
        left join nimitt nm on nm._id = mm.nimitt_id
        left join state nst on nst._id = nm.state_id
        left join department dept on dept._id = mm.dept_id ? 
     limit @limit offset @offset`
    , insert:
        `insert into mm (
            mm_hin, mm_eng, mm_roman, mm_code, mm_type, dept_id, state_id,
            parent_mm_id, opening_date, mm_closed, nimitt_id, restrict_month, restrict_year, active)
        values (
            @mm_hin, @mm_eng, @mm_roman, @mm_code, @mm_type, @dept_id, @state_id,
            @parent_mm_id, @opening_date, @mm_closed, @nimitt_id, @restrict_month, @restrict_year, @active)`
    , insert_ignore:
        `insert or ignore into mm (
            _id,
            mm_hin,
            mm_eng,
            mm_roman,
            mm_code,
            mm_type,
            dept_id,
            state_id,
            parent_mm_id,
            opening_date,
            mm_closed,
            nimitt_id,
            restrict_month,
            restrict_year,
            created_at,
            updated_at,
            active) 
        values (
            @_id,
            @mm_hin,
            @mm_eng,
            @mm_roman,
            @mm_code,
            @mm_type,
            @dept_id,
            @state_id,
            @parent_mm_id,
            @opening_date,
            @mm_closed,
            @nimitt_id,
            @restrict_month,
            @restrict_year,
            @created_at,
            @updated_at,
            @active)`
    , import_update:
        `update mm set 
        mm_hin=@mm_hin,
        mm_eng=@mm_eng,
        mm_roman=@mm_roman,
        mm_code=@mm_code,
        mm_type=@mm_type,
        dept_id=@dept_id,
        state_id=@state_id,
        parent_mm_id=@parent_mm_id,
        opening_date=@opening_date,
        mm_closed=@mm_closed,
        nimitt_id=@nimitt_id,
        restrict_month=@restrict_month,
        restrict_year=@restrict_year,
        created_at=@created_at,
        updated_at=@updated_at where _id = @_id`
    , update:
        `update mm set 
        mm_hin=@mm_hin,
        mm_eng=@mm_eng,
        mm_roman=@mm_roman,
        mm_code=@mm_code,
        mm_type=@mm_type,
        dept_id=@dept_id,
        state_id=@state_id,
        parent_mm_id=@parent_mm_id,
        opening_date=@opening_date,
        mm_closed=@mm_closed,
        nimitt_id=@nimitt_id,
        restrict_month=@restrict_month,
        restrict_year=@restrict_year,
        updated_at=datetime('now','localtime')`
    , update_active:
        `update mm set
        active=@active,
        updated_at=datetime('now','localtime')`
    , update_lock:
        `update mm set
        restrict_month=@restrict_month,
        restrict_year=@restrict_year,
        updated_at=datetime('now','localtime')`
    , order:
        `mm_hin, mm_eng, mm_roman`
}

const nimitt = {
    select:
        `select * from nimitt ?`
    , select_full:
        `select nimitt.*, 
        st.state_hin, st.state_eng
         from nimitt
         left join state st on st._id = nimitt.state_id ? 
         limit @limit offset @offset`
    , insert:
        `insert into nimitt (
            roll_no,
            nimitt_eng, 
            nimitt_hin, 
            gender, 
            state_id, 
            relative_name, 
            townarea, 
            document, 
            active)
        values (
            @roll_no,
            @nimitt_eng, 
            @nimitt_hin,
            @gender, 
            @state_id,
            @relative_name,
            @townarea,
            @document,
            @active)`
    , insert_ignore:
        `insert into nimitt (
            _id,
            roll_no,
            nimitt_eng, 
            nimitt_hin, 
            gender, 
            state_id, 
            relative_name, 
            townarea, 
            document, 
            created_at,
            updated_at,
            active)
        values (
            @_id,
            @roll_no,
            @nimitt_eng, 
            @nimitt_hin,
            @gender, 
            @state_id,
            @relative_name,
            @townarea,
            @document,
            @created_at,
            @updated_at,
            @active)`
    , update:
        `update nimitt set 
        roll_no=@roll_no,
        nimitt_eng=@nimitt_eng,
        nimitt_hin=@nimitt_hin,
        gender=@gender,
        state_id=@state_id,
        relative_name=@relative_name,
        townarea=@townarea,
        document=@document,
        updated_at=datetime('now','localtime')`
    , import_update:
        `update nimitt set 
        roll_no=@roll_no,
        nimitt_eng=@nimitt_eng,
        nimitt_hin=@nimitt_hin,
        gender=@gender,
        state_id=@state_id,
        relative_name=@relative_name,
        townarea=@townarea,
        document=@document,
        updated_at=@updated_at where _id = @_id`
    , update_active:
        `update nimitt set
        active=@active,
        updated_at=datetime('now','localtime')`
    , order:
        `nimitt_hin, nimitt_eng`
}

const pbk = {
    select:
        `select * from pbk ?`
    , select_full:
        `select pbk.*, strftime('%d-%m-%Y', pbk.birth_date) AS birth_date, strftime('%m-%Y', pbk.bhatti_date) AS bhatti_date,
        state.state_hin, state.state_eng, 
        dst.district_hin, dst.district_eng, 
        cnt.country_hin, cnt.country_eng, 
        city.city_hin, city.city_eng,
        mm.mm_hin, mm.mm_eng, mm.mm_code
        from pbk 
        left join district dst on dst._id = pbk.district_id
        left join state on state._id = pbk.state_id
        left join country cnt on cnt._id = state.country_id
        left join city on city._id = pbk.city_id
        left join mm on mm._id = pbk.class_mm_id ? limit @limit offset @offset`
    , insert:
        `insert into pbk (
            roll_no, pbk_hin, pbk_eng, gender, relation, relative_name, relative_ref,
            birth_date, age, status, address, townarea, state_id, district_id, city_id,
            mo_no, alt_mo_no, class_mm_id, bhatti_date, document, active)
        values (
            @roll_no, @pbk_hin, @pbk_eng, @gender, @relation, @relative_name, @relative_ref,
            @birth_date, @age, @status, @address, @townarea, @state_id, @district_id, @city_id,
            @mo_no, @alt_mo_no, @class_mm_id, @bhatti_date, @document, @active)`
    , insert_ignore:
        `insert into pbk (
            _id, roll_no, pbk_hin, pbk_eng, gender, relation, relative_name, relative_ref,
            birth_date, age, status, address, townarea, state_id, district_id, city_id,
            mo_no, alt_mo_no, class_mm_id, bhatti_date, document, active)
        values (
            @_id, @roll_no, @pbk_hin, @pbk_eng, @gender, @relation, @relative_name, @relative_ref,
            @birth_date, @age, @status, @address, @townarea, @state_id, @district_id, @city_id,
            @mo_no, @alt_mo_no, @class_mm_id, @bhatti_date, @document, @active)`
    , update:
        `update pbk set 
        roll_no=@roll_no,
        pbk_hin=@pbk_hin,
        pbk_eng=@pbk_eng,
        gender=@gender,
        relation=@relation,
        relative_name=@relative_name,
        relative_ref=@relative_ref,
        birth_date=@birth_date,
        age=@age,
        status=@status,
        address=@address,
        townarea=@townarea,
        state_id=@state_id,
        district_id=@district_id,
        city_id=@city_id,
        mo_no=@mo_no,
        alt_mo_no=@alt_mo_no,
        class_mm_id=@class_mm_id,
        bhatti_date=@bhatti_date,
        document=@document,
        updated_at=datetime('now','localtime')`
    , import_update:
        `update pbk set 
        roll_no = @roll_no,
        pbk_hin=@pbk_hin,
        pbk_eng=@pbk_eng,
        gender=@gender,
        relation=@relation,
        relative_name=@relative_name,
        relative_ref=@relative_ref,
        birth_date=@birth_date,
        age=@age,
        status=@status,
        address=@address,
        townarea=@townarea,
        state_id=@state_id,
        district_id=@district_id,
        city_id=@city_id,
        mo_no=@mo_no,
        alt_mo_no=@alt_mo_no,
        class_mm_id=@class_mm_id,
        bhatti_date=@bhatti_date,
        document=@document,
        updated_at=@updated_at where (_id = @_id OR roll_no = @roll_no)`
    , update_active:
        `update pbk set
        active=@active,
        updated_at=datetime('now','localtime')`
    , order:
        `roll_no`
}

const point = {
    select:
        `select * from point ?`
    , select_full:
        `select * from point ? limit @limit offset @offset`
    , insert:
        `insert into point (
        type,
        mrl_date,	
        clrf_date,
        time_from,
        time_to,
        point_hin,
        point_eng,
        active)
    values (
        @type,
        @mrl_date,	
        @clrf_date,
        @time_from,
        @time_to,
        @point_hin,
        @point_eng,
        @active)`
    , insert_ignore:
        `insert or ignore into country (
            _id,
            type,
            mrl_date,	
            clrf_date,
            time_from,
            time_to,
            point_hin,
            point_eng,
            created_at,
            updated_at,
            active) 
        values (
            @_id,
            @type,
            @mrl_date,	
            @clrf_date,
            @time_from,
            @time_to,
            @point_hin,
            @point_eng,
            @created_at,
            @updated_at,
            @active)`
    , import_update:
        `update country set 
        type=@type,
        mrl_date=@mrl_date,	
        clrf_date=@clrf_date,
        time_from=@time_from,
        time_to=@time_to,
        point_hin=@point_hin,
        point_eng=@point_eng,
        created_at=@created_at,
        updated_at=@updated_at where _id = @_id`
    , update:
        `update point set 
        type=@type,
        mrl_date=@mrl_date,	
        clrf_date=@clrf_date,
        time_from=@time_from,
        time_to=@time_to,
        point_hin=@point_hin,
        point_eng=@point_eng,
        active=active,
        updated_at=datetime('now','localtime')`
    , order:
        `point_hin,point_eng`
}

// hmp stands to Home Made Products
const hmp_recipe = {
    select: `select pr.*, d.dept_hin from hmp_recipe pr left join department d on pr.dept_id = d._id where pr.active = 1`,
    select_full: `select pr.*, d.dept_hin from hmp_recipe pr left join department d on pr.dept_id = d._id where pr.active = 1 limit @limit offset @offset`,
    insert: `insert into hmp_recipe (recipe_name, recipe_code, description, dept_id) values (@recipe_name, @recipe_code, @description, @dept_id)`,
    update: `update hmp_recipe set recipe_name = @recipe_name, recipe_code = @recipe_code, description = @description, dept_id = @dept_id, updated_at = datetime('now', 'localtime') where _id = @_id`,
    delete: `update hmp_recipe set active = 0 where _id = @_id`
}

const hmp_recipe_input = {
    select: `select pri.*, i.item_hin, i.item_eng, u.unit_short, u.unit_full, si.subitem_hin, si.subitem_eng, sl.list_name_hin as condition_name
             from hmp_recipe_input pri
             left join v_item i on pri.item_id = i._id
             left join unit u on pri.unit_id = u._id
             left join v_subitem si on pri.subitem_id = si._id
             left join support_list sl on pri.condition_id = sl._id
             where pri.active = 1`,
    select_full: `select pri.*, i.item_hin, i.item_eng, u.unit_short, u.unit_full, si.subitem_hin, si.subitem_eng, sl.list_name_hin as condition_name
             from hmp_recipe_input pri
             left join v_item i on pri.item_id = i._id
             left join unit u on pri.unit_id = u._id
             left join v_subitem si on pri.subitem_id = si._id
             left join support_list sl on pri.condition_id = sl._id
             where pri.active = 1 limit @limit offset @offset`,
    select_by_recipe: `select pri.*, i.item_hin, i.item_eng, u.unit_short, u.unit_full, si.subitem_hin, si.subitem_eng, sl.list_name_hin as condition_name
                       from hmp_recipe_input pri
                       left join v_item i on pri.item_id = i._id
                       left join unit u on pri.unit_id = u._id
                       left join v_subitem si on pri.subitem_id = si._id
                       left join support_list sl on pri.condition_id = sl._id
                       where pri.active = 1 and pri.recipe_id = @recipe_id`,
    insert: `insert into hmp_recipe_input (recipe_id, item_id, subitem_id, unit_id, condition_id, qty) values (@recipe_id, @item_id, @subitem_id, @unit_id, @condition_id, @qty)`,
    update: `update hmp_recipe_input set item_id = @item_id, subitem_id = @subitem_id, unit_id = @unit_id, condition_id = @condition_id, qty = @qty where _id = @_id`,
    delete: `update hmp_recipe_input set active = 0 where _id = @_id`
}

const hmp_recipe_output = {
    select: `select pro.*, i.item_hin, i.item_eng, u.unit_short, u.unit_full, si.subitem_hin, si.subitem_eng, sl.list_name_hin as condition_name
             from hmp_recipe_output pro
             left join v_item i on pro.item_id = i._id
             left join unit u on pro.unit_id = u._id
             left join v_subitem si on pro.subitem_id = si._id
             left join support_list sl on pro.condition_id = sl._id
             where pro.active = 1`,
    select_full: `select pro.*, i.item_hin, i.item_eng, u.unit_short, u.unit_full, si.subitem_hin, si.subitem_eng, sl.list_name_hin as condition_name
             from hmp_recipe_output pro
             left join v_item i on pro.item_id = i._id
             left join unit u on pro.unit_id = u._id
             left join v_subitem si on pro.subitem_id = si._id
             left join support_list sl on pro.condition_id = sl._id
             where pro.active = 1 limit @limit offset @offset`,
    select_by_recipe: `select pro.*, i.item_hin, i.item_eng, u.unit_short, u.unit_full, si.subitem_hin, si.subitem_eng, sl.list_name_hin as condition_name
                       from hmp_recipe_output pro
                       left join v_item i on pro.item_id = i._id
                       left join unit u on pro.unit_id = u._id
                       left join v_subitem si on pro.subitem_id = si._id
                       left join support_list sl on pro.condition_id = sl._id
                       where pro.active = 1 and pro.recipe_id = @recipe_id`,
    insert: `insert into hmp_recipe_output (recipe_id, item_id, subitem_id, unit_id, condition_id, qty) values (@recipe_id, @item_id, @subitem_id, @unit_id, @condition_id, @qty)`,
    update: `update hmp_recipe_output set item_id = @item_id, subitem_id = @subitem_id, unit_id = @unit_id, condition_id = @condition_id, qty = @qty where _id = @_id`,
    delete: `update hmp_recipe_output set active = 0 where _id = @_id`
}

const hmp_batch = {
    select: `select pb.*, pr.recipe_name, m.mm_hin, d.dept_hin from hmp_batch pb 
             left join hmp_recipe pr on pb.recipe_id = pr._id 
             left join mm m on pb.mm_id = m._id 
             left join department d on pb.dept_id = d._id 
             where pb.active = 1`,
    select_full: `select pb.*, pr.recipe_name, m.mm_hin, d.dept_hin from hmp_batch pb 
                  left join hmp_recipe pr on pb.recipe_id = pr._id 
                  left join mm m on pb.mm_id = m._id 
                  left join department d on pb.dept_id = d._id 
                  where pb.active = 1 limit @limit offset @offset`,
    insert: `insert into hmp_batch (batch_no, recipe_id, date, mm_id, status, notes, dept_id) 
            values (@batch_no, @recipe_id, @date, @mm_id, @status, @notes, @dept_id)`,
    update: `update hmp_batch set batch_no = @batch_no, recipe_id = @recipe_id, date = @date, mm_id = @mm_id, status = @status, notes = @notes, dept_id = @dept_id, updated_at = datetime('now', 'localtime') where _id = @_id`,
    // update_totals: `update hmp_batch set total_input_qty = ?, total_output_qty = ?, hmp_loss = ? where _id = ?`,
    delete: `update hmp_batch set active = 0 where _id = @_id`
}

const hmp_batch_input = {
    select: `select pbi.*, pb.batch_no, i.item_hin, i.item_eng, u.unit_short, u.unit_full, si.subitem_hin, si.subitem_eng, sl.list_name_hin as condition_name 
             from hmp_batch_input pbi 
             left join hmp_batch pb on pbi.batch_id = pb._id 
             left join v_item i on pbi.item_id = i._id 
             left join unit u on pbi.unit_id = u._id 
             left join v_subitem si on pbi.subitem_id = si._id 
             left join support_list sl on pbi.condition_id = sl._id 
             where pbi.active = 1`,
    select_full: `select pbi.*, pb.batch_no, i.item_hin, i.item_eng, u.unit_short, u.unit_full, si.subitem_hin, si.subitem_eng, sl.list_name_hin as condition_name 
             from hmp_batch_input pbi 
             left join hmp_batch pb on pbi.batch_id = pb._id 
             left join v_item i on pbi.item_id = i._id 
             left join unit u on pbi.unit_id = u._id 
             left join v_subitem si on pbi.subitem_id = si._id 
             left join support_list sl on pbi.condition_id = sl._id 
             where pbi.active = 1 limit @limit offset @offset`,
    select_by_batch: `select pbi.*, i.item_hin, i.item_eng, u.unit_short, u.unit_full, si.subitem_hin, si.subitem_eng, sl.list_name_hin as condition_name 
                      from hmp_batch_input pbi 
                      left join v_item i on pbi.item_id = i._id 
                      left join unit u on pbi.unit_id = u._id 
                      left join v_subitem si on pbi.subitem_id = si._id 
                      left join support_list sl on pbi.condition_id = sl._id 
                      where pbi.active = 1 and pbi.batch_id = ?`,
    insert: `insert into hmp_batch_input (batch_id, item_id, subitem_id, unit_id, condition_id, qty, rate, amount, lot_no, jawak_ref_id) 
            values (@batch_id, @item_id, @subitem_id, @unit_id, @condition_id, @qty, @rate, @amount, @lot_no, @jawak_ref_id)`,
    update: `update hmp_batch_input set item_id = @item_id, subitem_id = @subitem_id, unit_id = @unit_id, condition_id = @condition_id, qty = @qty, rate = @rate, amount = @amount, lot_no = @lot_no, jawak_ref_id = @jawak_ref_id where _id = @_id`,
    delete: `update hmp_batch_input set active = 0 where _id = @_id`
}

const hmp_batch_output = {
    select: `select pbo.*, pb.batch_no, i.item_hin, i.item_eng, u.unit_short, u.unit_full, si.subitem_hin, si.subitem_eng, sl.list_name_hin as condition_name, slt.list_name_hin as hmp_type_hin 
             from hmp_batch_output pbo 
             left join hmp_batch pb on pbo.batch_id = pb._id 
             left join v_item i on pbo.item_id = i._id 
             left join unit u on pbo.unit_id = u._id 
             left join v_subitem si on pbo.subitem_id = si._id 
             left join support_list sl on pbo.condition_id = sl._id 
             left join support_list slt on pbo.hmp_type = slt._id 
             where pbo.active = 1`,
    select_full: `select pbo.*, pb.batch_no, i.item_hin, i.item_eng, u.unit_short, u.unit_full, si.subitem_hin, si.subitem_eng, sl.list_name_hin as condition_name, slt.list_name_hin as hmp_type_hin 
             from hmp_batch_output pbo 
             left join hmp_batch pb on pbo.batch_id = pb._id 
             left join v_item i on pbo.item_id = i._id 
             left join unit u on pbo.unit_id = u._id 
             left join v_subitem si on pbo.subitem_id = si._id 
             left join support_list sl on pbo.condition_id = sl._id 
             left join support_list slt on pbo.hmp_type = slt._id 
             where pbo.active = 1 limit @limit offset @offset`,
    select_by_batch: `select pbo.*, i.item_hin, i.item_eng, u.unit_short, u.unit_full, si.subitem_hin, si.subitem_eng, sl.list_name_hin as condition_name, slt.list_name_hin as hmp_type_hin 
                from hmp_batch_output pbo 
                left join v_item i on pbo.item_id = i._id 
                left join unit u on pbo.unit_id = u._id 
                left join v_subitem si on pbo.subitem_id = si._id 
                left join support_list slt on pbo.hmp_type = slt._id 
                left join support_list sl on pbo.condition_id = sl._id 
                where pbo.active = 1 and pbo.batch_id = @batch_id`,
    insert: `insert into hmp_batch_output (batch_id, item_id, subitem_id, unit_id, condition_id, qty, rate, amount, lot_no, aawak_ref_id) 
            values (@batch_id, @item_id, @subitem_id, @unit_id, @condition_id, @qty, @rate, @amount, @lot_no, @aawak_ref_id)`,
    update: `update hmp_batch_output set item_id = @item_id, subitem_id = @subitem_id, unit_id = @unit_id, condition_id = @condition_id, qty = @qty, rate = @rate, amount = @amount, lot_no = @lot_no, batch_product_code = @batch_product_code, aawak_ref_id = @aawak_ref_id where _id = @_id`,
    delete: `update hmp_batch_output set active = 0 where _id = @_id`
}


const product = {
    select:
        `select * from product ?`
    , select_full:
        `select product.*,
        CASE WHEN product_code IS NULL AND sr_num IS NULL THEN NULL ELSE json_group_array(json_object( '_id',product._id,'product_code',product_code,'sr_num',sr_num,'awk_id',awk_id)) END as products,
        mm.mm_hin,mm.mm_eng,mm.mm_code, 
        nt.roll_no, nt.nimitt_hin, nt.nimitt_eng, nt.gender, nt.relative_name, nt.state_id, 
        ntst.state_hin as nimitt_state_hin, ntst.state_eng as nimitt_state_eng,
        item.item_hin,item.item_eng,item.item_code, item.item_roman,
        subitem.subitem_hin,subitem.subitem_eng, subitem.subitem_roman,
        unit.unit_short, unit.unit_full,
        support_list.list_name_hin as condition_hin,support_list.list_name_eng as condition_eng,
        at.list_name_hin as aawak_type_hin, at.list_name_eng as aawak_type_eng,
        lmm.mm_hin as last_mm_hin, lmm.mm_eng as last_mm_eng, lmm.mm_code as last_mm_code, 
        lc.list_name_hin as last_condition_hin, lc.list_name_eng as last_condition_eng        
        from product 
        left join mm on mm._id = product.mm_id
        left join mm lmm on lmm._id = product.last_mm
        left join v_item item on item._id = product.item_id
        left join v_subitem subitem on subitem._id = product.subitem_id
        left join unit on unit._id = product.unit_id
        left join nimitt nt on product.nimitt_id = nt._id
        left join state ntst on nt.state_id = ntst._id
        left join support_list on support_list._id = product.condition_id
        left join support_list at on at._id = product.aawak_type_id
        left join support_list lc on lc._id = product.last_condition ?
        group by voucher_no
     limit @limit offset @offset`
    , select_full_new:
        `select product.*,
        mm.mm_hin,mm.mm_eng,mm.mm_code, 
        item.item_hin,item.item_eng,item.item_code, item.item_roman,
        si.subitem_hin,si.subitem_eng, si.subitem_roman,
        support_list.list_name_hin as condition_hin,support_list.list_name_eng as condition_eng,
        lmm.mm_hin as last_mm_hin, lmm.mm_eng as last_mm_eng, lmm.mm_code as last_mm_code, 
        lc.list_name_hin as last_condition_hin, lc.list_name_eng as last_condition_eng,
        CASE WHEN pt._id IS NULL THEN json('[]') ELSE json_group_array(json_object('_id', pt._id, 'product_id', pt.product_id, 'date', pt.date, 'mm_id', pt.mm_id, 'mm_hin', pt.mm_hin, 'entry_type', pt.entry_type, 'aj_mm_id', pt.aj_mm_id, 'aj_mm_hin', pt.ajmm_hin, 'pkt_num', pt.pkt_num, 'nimitt_id', pt.nimitt_id, 'condition_id', pt.condition_id, 'condition_hin', pt.condition_hin, 'transfer_detail', pt.transfer_detail, 'hl', pt.hl )) END as tracking 
        from product 
        left join (select product_tracking.*,
            mm.mm_hin,mm.mm_eng,mm.mm_code, 
            ajmm.mm_hin as ajmm_hin, ajmm.mm_eng as ajmm_eng, ajmm.mm_code as ajmm_code, 
            support_list.list_name_hin as condition_hin,support_list.list_name_eng as condition_eng,
            oc.list_name_hin as old_condition_hin, oc.list_name_eng as old_condition_eng
            from product_tracking 
            left join product pd on pd._id = product_tracking.product_id
            left join mm on mm._id = product_tracking.mm_id
            left join mm ajmm on ajmm._id = product_tracking.aj_mm_id
            left join support_list on support_list._id = product_tracking.condition_id
            left join support_list oc on oc._id = product_tracking.old_condition_id) pt on pt.product_id = product._id
        left join mm on mm._id = product.mm_id
        left join mm lmm on lmm._id = product.last_mm
        left join v_item item on item._id = product.item_id
        left join v_subitem si on si._id = product.subitem_id
        left join support_list on support_list._id = product.condition_id
        left join support_list lc on lc._id = product.last_condition ? group by product._id # limit @limit offset @offset`
    , insert:
        `insert into product (
        mm_id, purchased_by, purchase_date, item_id, subitem_id, unit_id, product_code, company_name, nimitt_id,
        model_name, sr_num, condition_id, price, product_detail, accessories, purchase_from, aawak_type_id,
        warranty_period, dept_id, warranty_from, document, isbill, is_xl, voucher_no, bunch_no, qty, active, awk_id)
    values (
        @mm_id, @purchased_by, @purchase_date, @item_id, @subitem_id, @unit_id, @product_code, @company_name, @nimitt_id,
        @model_name, @sr_num, @condition_id, @price, @product_detail, @accessories, @purchase_from, @aawak_type_id,
        @warranty_period, @dept_id, @warranty_from, @document, @isbill, @is_xl, @voucher_no, @bunch_no, @qty, @active, @awk_id)`
    , update_aawak_ins:
        `update product set 
        last_date = @date,
        last_mm = @mm_id,
        last_condition = @condition_id,
        last_entry_type = 'awk',
        last_ref_id = @_id
        where _id = @product_id AND (last_date IS NULL OR last_date <= @date);`
    , update_jawak_ins:
        `update product set 
        last_date = @date,
        last_mm = @jawak_mm_id,
        last_condition = @condition_id,
        last_entry_type = 'jwk',
        last_ref_id = @_id
        where _id = @product_id AND (last_date IS NULL OR last_date <= @date);`
    , update_aawak_del:
        `update product set 
        last_entry_type = 'deleted',
        last_ref_id = null
        where _id = @product_id AND last_entry_type = 'awk' AND last_ref_id = @_id;`
    , update_jawak_del:
        `update product set 
        last_entry_type = 'deleted',
        last_ref_id = null
        where _id = @product_id AND last_entry_type = 'jwk' AND last_ref_id = @_id;`
    , update:
        `update product set 
        mm_id=@mm_id,
        purchased_by=@purchased_by,
        purchase_date=@purchase_date,
        item_id=@item_id,
        subitem_id=@subitem_id,
        unit_id=@unit_id,
        product_code=@product_code,
        company_name=@company_name,
        nimitt_id=@nimitt_id,
        model_name=@model_name,
        sr_num=@sr_num,
        condition_id=@condition_id,
        price=@price,
        product_detail=@product_detail,
        accessories=@accessories,
        purchase_from=@purchase_from,
        warranty_period=@warranty_period,
        dept_id=@dept_id,
        warranty_from=@warranty_from,
        document=@document,
        isbill=@isbill,
        is_xl=@is_xl,
        qty=@qty,
        bunch_no=@bunch_no,
        voucher_no=@voucher_no,
        aawak_type_id=@aawak_type_id,
        awk_id=@awk_id,
        updated_at=datetime('now','localtime')`
    , update_auto_pd:
        `update product set
        awk_id = @awk_id
        where _id = @_id`
    , order:
        `product._id desc`
    , grpByVoucher:
        `select voucher_no, json_group_array(json_object( '_id',_id,'product_code',product_code,'sr_num',sr_num,'awk_id',awk_id)) as productGroup, sum(qty) as qty, * from product group by voucher_no`
    , grpByBunch:
        `select voucher_no, json_group_array(json_object( '_id',_id,'product_code',product_code,'sr_num',sr_num,'awk_id',awk_id)) as productGroup, sum(qty) as qty, * from product group by voucher_no`
}

const state = {
    select:
        `select * from state ?`
    , select_full:
        `select state.*, 
        zn.zone_hin, zn.zone_eng,
        cnt.country_hin, cnt.country_eng 
        from state 
        left join zone zn on zn._id = state.zone_id
        left join country cnt on cnt._id = state.country_id  ? limit @limit offset @offset`
    , insert:
        `insert into state (
            state_hin,
            state_eng,
            zone_id,
            country_id,
            active)
        values (
            @state_hin,
            @state_eng,
            @zone_id,
            @country_id,
            @active)`
    , insert_ignore:
        `insert or ignore into state (
            _id,
            state_hin,
            state_eng,
            zone_id,
            country_id,
            created_at,
            updated_at,
            active) 
        values (
            @_id,
            @state_hin,
            @state_eng,
            @zone_id,
            @country_id,
            @created_at,
            @updated_at,
            @active)`
    , import_update:
        `update state set 
        state_hin=@state_hin,
        state_eng=@state_eng,
        zone_id=@zone_id,
        country_id=@country_id,
        created_at=@created_at,
        updated_at=@updated_at where _id = @_id`
    , update:
        `update state set 
        state_hin=@state_hin,
        state_eng=@state_eng,
        zone_id=@zone_id,
        country_id=@country_id,
        updated_at=datetime('now','localtime')`
    , update_active:
        `update state set
        active=@active,
        updated_at=datetime('now','localtime')`
    , order:
        `state_hin, state_eng`
}

const zone = {
    select:
        `select * from zone ?`
    , select_full:
        `select zone.*, 
        cnt.country_hin, cnt.country_eng 
        from zone 
        left join country cnt on cnt._id = zone.country_id  ? limit @limit offset @offset`
    , insert:
        `insert into zone (
            zone_hin,
            zone_eng,
            country_id,
            active)
        values (
            @zone_hin,
            @zone_eng,
            @country_id,
            @active)`
    , insert_ignore:
        `insert or ignore into zone (
            _id,
            zone_hin,
            zone_eng,
            country_id,
            created_at,
            updated_at,
            active) 
        values (
            @_id,
            @zone_hin,
            @zone_eng,
            @country_id,
            @created_at,
            @updated_at,
            @active)`
    , import_update:
        `update zone set 
        zone_hin=@zone_hin,
        zone_eng=@zone_eng,
        country_id=@country_id,
        created_at=@created_at,
        updated_at=@updated_at where _id = @_id`
    , update:
        `update zone set 
        zone_hin=@zone_hin,
        zone_eng=@zone_eng,
        country_id=@country_id,
        updated_at=datetime('now','localtime')`
    , update_active:
        `update zone set
        active=@active,
        updated_at=datetime('now','localtime')`
    , order:
        `zone_hin, zone_eng`
}

const district = {
    select:
        `select * from district ?`
    , select_full:
        `select district.*, 
        st.state_hin, st.state_eng,
        cnt.country_hin, cnt.country_eng from district 
        left join state st on st._id = district.state_id
        left join country cnt on cnt._id = st.country_id  ? limit @limit offset @offset`
    , insert:
        `insert into district (
            district_hin,
            district_eng,
            state_id,
            active)
        values (
            @district_hin,
            @district_eng,
            @state_id,
            @active)`
    , insert_ignore:
        `insert or ignore into district (
            _id,
            district_hin,
            district_eng,
            state_id,
            created_at,
            updated_at,
            active) 
        values (
            @_id,
            @district_hin,
            @district_eng,
            @state_id,
            @created_at,
            @updated_at,
            @active)`
    , import_update:
        `update district set 
        district_hin=@district_hin,
        district_eng=@district_eng,
        state_id=@state_id,
        created_at=@created_at,
        updated_at=@updated_at where _id = @_id`
    , update:
        `update district set 
        district_hin=@district_hin,
        district_eng=@district_eng,
        state_id=@state_id,
        updated_at=datetime('now','localtime')`
    , update_active:
        `update district set
        active=@active,
        updated_at=datetime('now','localtime')`
    , order:
        `district_hin, district_eng`
}

const subitem = {
    select:
        `select * from subitem ?`
    , select_full:
        `select subitem.*, (
          SELECT IFNULL(json_group_array(
              json_object(
                  '_id', c._id, 
                  'category_hin', c.category_hin, 
                  'category_eng', c.category_eng
              )
          ), json('[]'))
          FROM rel_subitem_category rsc
          JOIN category c ON c._id = rsc.category_id
          WHERE rsc.subitem_id = subitem._id
        ) as categories,
        unit.unit_full, unit.unit_short, item.item_eng, item.item_hin
        from subitem
        left join unit on unit._id = subitem.unit_id
        left join item on  item._id = subitem.item_id ? limit @limit offset @offset`
    , insert:
        `insert into subitem (
        item_id,
        subitem_hin,
        subitem_eng,
        subitem_roman,
        unit_id,
        extra_note,
        document,
        restrict_month,
        restrict_year,
        min_rate,
        max_rate,
        active)
    values (
        @item_id,
        @subitem_hin,
        @subitem_eng,
        @subitem_roman,
        @unit_id,
        @extra_note,
        @document,
        @restrict_month,
        @restrict_year,
        @min_rate,
        @max_rate,
        @active)`
    , import:
        `insert into subitem (
        item_id,
        subitem_hin,
        subitem_eng,
        subitem_roman,,
        unit_id,
        extra_note,
        document,
        restrict_month,
        restrict_year,
        min_rate,
        max_rate,
        created_at,
        updated_at,
        active)
    values (
        @item_id,
        @subitem_hin,
        @subitem_eng,
        @subitem_roman,,
        @unit_id,
        @extra_note,
        @document,
        @restrict_month,
        @restrict_year,
        @min_rate,
        @max_rate,
        @created_at,
        @updated_at,
        @active)`
    , insert_ignore:
        `insert or ignore into subitem (
            _id,
            item_id,
            subitem_hin,
            subitem_eng,
            subitem_roman,
            unit_id,
            extra_note,
            document,
            restrict_month,
            restrict_year,
            min_rate,
            max_rate,
            created_at,
            updated_at,
            active) 
        values (
            @_id,
            @item_id,
            @subitem_hin,
            @subitem_eng,
            @subitem_roman,
            @unit_id,
            @extra_note,
            @document,
            @restrict_month,
            @restrict_year,
            @min_rate,
            @max_rate,
            @created_at,
            @updated_at,
            @active)`
    , import_update:
        `update subitem set 
        item_id=@item_id,
        subitem_hin=@subitem_hin,
        subitem_eng=@subitem_eng,
        subitem_roman=@subitem_roman,
        unit_id=@unit_id,
        extra_note=@extra_note,
        document=@document,
        restrict_month=@restrict_month,
        restrict_year=@restrict_year,
        min_rate=@min_rate,
        max_rate=@max_rate,
        created_at=@created_at,
        updated_at=@updated_at where _id = @_id AND updated_at != @updated_at`
    , update:
        `update subitem set 
        item_id=@item_id,
        subitem_hin=@subitem_hin,
        subitem_eng=@subitem_eng,
        subitem_roman=@subitem_roman,
        unit_id=@unit_id,
        extra_note=@extra_note,
        document=@document,
        restrict_month=@restrict_month,
        restrict_year=@restrict_year,
        restrict_year=@restrict_year,
        min_rate=@min_rate,
        min_rate=@min_rate,
        max_rate=@max_rate,
        updated_at=datetime('now','localtime')`
    , update_active:
        `update subitem set
        active=@active,
        updated_at=datetime('now','localtime')`
    , update_lock:
        `update subitem set
        restrict_month=@restrict_month,
        restrict_year=@restrict_year,
        updated_at=datetime('now','localtime')`
    , order:
        `subitem_hin, subitem_eng`
}

const subitem_list = {
    select:
        `select min(_id) as _id, subitem_hin, subitem_eng, subitem_roman from subitem group by subitem_hin, subitem_eng, subitem_roman ?`
    , select_full:
        `select * from subitem_list ? limit @limit offset @offset`
    , insert:
        `insert into subitem_list (
        subitem_hin,
        subitem_eng,
        subitem_roman,
        active)
    values (
        @subitem_hin,
        @subitem_eng,
        @subitem_roman,
        @active)`
    , import:
        `insert into subitem_list (
        _id,
        subitem_hin,
        subitem_eng,
        subitem_roman,
        active)
    values (
        @_id,
        @subitem_hin,
        @subitem_eng,
        @subitem_roman,
        1)`
    , insert_ignore:
        `insert or ignore into subitem_list (
            _id,
            subitem_hin,
            subitem_eng,
            subitem_roman,
            created_at,
            updated_at,
            active) 
        values (
            @_id,
            @subitem_hin,
            @subitem_eng,
            @subitem_roman,
            @created_at,
            @updated_at,
            @active)`
    , import_update:
        `update subitem_list set 
        subitem_hin=@subitem_hin,
        subitem_eng=@subitem_eng,
        subitem_roman=@subitem_roman,
        created_at=@created_at,
        updated_at=@updated_at where _id = @_id`
    , update:
        `update subitem_list set 
        subitem_hin=@subitem_hin,
        subitem_eng=@subitem_eng,
        subitem_roman=@subitem_roman,
        updated_at=datetime('now','localtime')`
    , order:
        `subitem_hin, subitem_eng`
}

const support_list = {
    select:
        `select * from support_list ?`
    , select_full:
        `select * from support_list ? limit @limit offset @offset`
    , insert:
        `insert into support_list (
        list_type,
        list_name_hin,
        list_name_eng,
        list_name_roman,
        lock,
        active)
    values (
        @list_type,
        @list_name_hin,
        @list_name_eng,
        @list_name_roman,
        @lock,
        @active)`
    , insert_ignore:
        `insert or ignore into support_list (
            _id,
            list_type,
            list_name_hin,
            list_name_eng,
            list_name_roman,
            lock,
            created_at,
            updated_at,
            active) 
        values (
            @_id,
            @list_type,
            @list_name_hin,
            @list_name_eng,
            @list_name_roman,
            @lock,
            @created_at,
            @updated_at,
            @active)`
    , import_update:
        `update support_list set 
        list_type=@list_type,
        list_name_hin=@list_name_hin,
        list_name_eng=@list_name_eng,
        list_name_roman=@list_name_roman,
        lock=@lock,
        created_at=@created_at,
        updated_at=@updated_at where _id = @_id`
    , update:
        `update support_list set 
        list_type=@list_type,
        list_name_hin=@list_name_hin,
        list_name_roman=@list_name_roman,
        lock=@lock,
        updated_at=datetime('now','localtime')`
    , update_active:
        `update support_list set
        active=@active,
        updated_at=datetime('now','localtime')`
    , order:
        ``
}

const vehicle = {
    select:
        `select *, (vehicle.insurance_date * 1000) as insurance_date, (vehicle.insurance_exp_date * 1000) as insurance_exp_date, (vehicle.rc_date * 1000) as rc_date, (vehicle.rc_exp_date * 1000) as rc_exp_date, (vehicle.puc_date * 1000) as puc_date, (vehicle.puc_exp_date * 1000) as puc_exp_date from vehicle ?`
    , select_full:
        `select vehicle.*, (vehicle.insurance_date * 1000) as insurance_date, (vehicle.insurance_exp_date * 1000) as insurance_exp_date, (vehicle.rc_date * 1000) as rc_date, (vehicle.rc_exp_date * 1000) as rc_exp_date, (vehicle.puc_date * 1000) as puc_date, (vehicle.puc_exp_date * 1000) as puc_exp_date,
        mm.mm_hin, mm.mm_eng, mm.mm_code, mm.state_id from vehicle
        left join mm on mm._id = vehicle.mm_id ? limit @limit offset @offset`
    , insert:
        `insert into vehicle (
        mm_id,
        vehicle_type,
        gadi_name,
        gadi_num,
        fuel_type,
        seating_capacity,
        owner_name,
        nominee,
        aawak_type,
        rc_date,
        rc_exp_date,
        rc_amount,
        insurance_date,
        insurance_exp_date,
        insurance_amount,
        insurance_type,
        insurance_company,
        puc_date,
        puc_exp_date,
        puc_amount
        )
    values (
        @mm_id,
        @vehicle_type,
        @gadi_name,
        @gadi_num,
        @fuel_type,
        @seating_capacity,
        @owner_name,
        @nominee,
        @aawak_type,
        UNIXEPOCH(@rc_date),
        UNIXEPOCH(@rc_exp_date),
        @rc_amount,
        UNIXEPOCH(@insurance_date),
        UNIXEPOCH(@insurance_exp_date),
        @insurance_amount,
        @insurance_type,
        @insurance_company,
        UNIXEPOCH(@puc_date),
        UNIXEPOCH(@puc_exp_date),
        @puc_amount)`
    , insert_ignore:
        `insert or ignore into vehicle (
            _id,
            mm_id,
            vehicle_type,
            gadi_name,
            gadi_num,
            fuel_type,
            seating_capacity,
            owner_name,
            nominee,
            aawak_type,
            rc_date,
            rc_exp_date,
            rc_amount,
            insurance_date,
            insurance_exp_date,
            insurance_amount,
            insurance_type,
            insurance_company,
            puc_date,
            puc_exp_date,
            puc_amount,
            created_at,
            updated_at,
            active) 
        values (
            @_id,
            @mm_id,
            @vehicle_type,
            @gadi_name,
            @gadi_num,
            @fuel_type,
            @seating_capacity,
            @owner_name,
            @nominee,
            @aawak_type,
            @rc_date,
            @rc_exp_date,
            @rc_amount,
            @insurance_date,
            @insurance_exp_date,
            @insurance_amount,
            @insurance_type,
            @insurance_company,
            @puc_date,
            @puc_exp_date,
            @puc_amount,
            @created_at,
            @updated_at,
            @active)`
    , import_update:
        `update vehicle set 
            mm_id = @mm_id,
            vehicle_type = @vehicle_type,
            gadi_name = @gadi_name,
            gadi_num = @gadi_num,
            fuel_type = @fuel_type,
            seating_capacity = @seating_capacity,
            owner_name = @owner_name,
            nominee = @nominee,
            aawak_type = @aawak_type,
            rc_date = @rc_date,
            rc_exp_date = @rc_exp_date,
            rc_amount = @rc_amount,
            insurance_date = @insurance_date,
            insurance_exp_date = @insurance_exp_date,
            insurance_amount = @insurance_amount,
            insurance_type = @insurance_type,
            insurance_company = @insurance_company,
            puc_date = @puc_date,
            puc_exp_date = @puc_exp_date,
            puc_amount = @puc_amount,
            updated_at = UNIXEPOCH() where _id = @_id`
    , update:
        `update vehicle set 
            mm_id = @mm_id,
            vehicle_type = @vehicle_type,
            gadi_name = @gadi_name,
            gadi_num = @gadi_num,
            fuel_type = @fuel_type,
            seating_capacity = @seating_capacity,
            owner_name = @owner_name,
            nominee = @nominee,
            aawak_type = @aawak_type,
            rc_date = UNIXEPOCH(@rc_date),
            rc_exp_date = UNIXEPOCH(@rc_exp_date),
            rc_amount = @rc_amount,
            insurance_date = UNIXEPOCH(@insurance_date),
            insurance_exp_date = UNIXEPOCH(@insurance_exp_date),
            insurance_amount = @insurance_amount,
            insurance_type = @insurance_type,
            insurance_company = @insurance_company,
            puc_date = UNIXEPOCH(@puc_date),
            puc_exp_date = UNIXEPOCH(@puc_exp_date),
            puc_amount = @puc_amount,
            updated_at=UNIXEPOCH()`
    , update_active:
        `update vehicle set
        active=@active,
        updated_at=UNIXEPOCH()`
    , order:
        ``
}

const vehicle_document = {
    select:
        `select * from vehicle_document ?`
    , select_full:
        `select * from vehicle_document
        ? limit @limit offset @offset`
    , order:
        ``
}

const temp_import = {
    select:
        `select * from temp_import ?`
    , select_full:
        `select temp_import.*,
        mm.mm_hin,mm.mm_eng,mm.mm_code,
        amm.mm_hin as aj_mm_hin, amm.mm_eng as aj_mm_eng, amm.mm_code as aj_mm_code, 
        pbk.roll_no, pbk.pbk_hin, pbk.pbk_eng, pbk.relation, pbk.relative_name,
        item.item_hin, item.item_eng, item.item_code, item.item_roman,
        si.subitem_hin, si.subitem_eng, si.subitem_roman,
        slul.list_name_hin as usage_list_hin, slul.list_name_eng as usage_list_eng, slul.list_name_roman as usage_list_roman,
        product.sr_num, product.product_code,
        sl.list_name_hin as condition_hin, sl.list_name_eng as condition_eng,
        dept.dept_eng, dept.dept_hin, dept.dept_code,
        unit.unit_short, unit.unit_full,
        slat.list_name_hin as aj_type_hin, slat.list_name_eng as aj_type_eng,
        slas.list_name_hin as aawak_source_hin, slas.list_name_eng as aawak_source_eng,
        nmt.nimitt_hin, nmt.nimitt_eng, nmt.relative_name as father_name, nmt.state_id as nimitt_state_id, pst.state_hin as nimitt_state_hin, pst.state_eng as nimitt_state_eng
        from temp_import 
        left join mm on mm._id = temp_import.mm_id
        left join pbk on pbk._id = temp_import.pbk_id
        left join mm amm on amm._id = temp_import.aj_mm_id
        left join item on item._id = temp_import.item_id
        left join subitem si on si._id = temp_import.subitem_id
        left join support_list slul on slul._id = temp_import.usage_list_id
        left join product on product._id = temp_import.product_id
        left join support_list sl on sl._id = temp_import.condition_id
        left join unit on unit._id = temp_import.unit_id
        left join department dept on dept._id = temp_import.dept_id
        left join support_list slat on slat._id = temp_import.aj_type_id
        left join support_list slas on slas._id = temp_import.aawak_source_id
        left join nimitt nmt on nmt._id = temp_import.nimitt_id
        left join state pst on pst._id = nmt.state_id ? limit @limit offset @offset`
    , insert:
        `insert into temp_import (
        awk_id, type, date, lot_no, pkt_num, item_detail, qty, rate, actual_amt, 
        usage_list_id, usage_list, company_name, description, isbill, document, mm, mm_id, pbk,
        pbk_id, aj_mm, aj_mm_id, item, item_id, subitem, subitem_id,
        product, product_id, condition, condition_id, unit, unit_id, aj_type,
        aj_type_id, aawak_source, aawak_source_id, nimitt, nimitt_id, dept, dept_id, jawak_detail)
    values (
        @awk_id, @type, @date, @lot_no, @pkt_num, @item_detail, @qty, @rate, @actual_amt, 
        @usage_list_id, @usage_list, @company_name, @description, @isbill, @document, @mm, @mm_id, @pbk,
        @pbk_id, @aj_mm, @aj_mm_id, @item, @item_id, @subitem, @subitem_id,
        @product, @product_id, @condition, @condition_id, @unit, @unit_id, @aj_type,
        @aj_type_id, @aawak_source, @aawak_source_id, @nimitt, @nimitt_id, @dept, @dept_id, @jawak_detail)`
    , update:
        `update temp_import set 
        awk_id=@awk_id,
        type=@type,
        date=@date,
        lot_no=@lot_no,
        pkt_num=@pkt_num,
        item_detail=@item_detail,
        qty=@qty,
        rate=@rate,
        actual_amt=@actual_amt,
        usage_list=@usage_list,
        usage_list_id=@usage_list_id,
        company_name=@company_name,
        description=@description,
        isbill=@isbill,
        document=@document,
        mm=@mm,
        mm_id=@mm_id,
        pbk=@pbk,
        pbk_id=@pbk_id,
        aj_mm=@aj_mm,
        aj_mm_id=@aj_mm_id,
        item=@item,
        item_id=@item_id,
        subitem=@subitem,
        subitem_id=@subitem_id,
        product=@product,
        product_id=@product_id,
        condition=@condition,
        condition_id=@condition_id,
        unit=@unit,
        unit_id=@unit_id,
        aj_type=@aj_type,
        aj_type_id=@aj_type_id,
        aawak_source=@aawak_source,
        aawak_source_id=@aawak_source_id,
        nimitt=@nimitt,
        nimitt_id=@nimitt_id,
        dept=@dept,
        dept_id=@dept_id,
        jawak_detail=@jawak_detail`
    , order:
        ``,
    delete: `delete from temp_import`,
}

const import_history = {
    select:
        `select * from import_history ?`
    , select_full:
        `select json_group_array(json_object('_id', import_history._id, 'entry_date', import_history.entry_date, 'month', import_history.month, 'updated_at', import_history.updated_at)) as monthly_detail, import_history.year, import_history.mm_id, import_history.dept_id,
        mm.mm_hin,mm.mm_eng,mm.mm_code, mm.state_id,
        st.state_hin, st.state_eng,
        dept.dept_hin, dept.dept_eng, dept.dept_code
        from import_history 
        left join mm on mm._id = import_history.mm_id        
        left join state st on mm.state_id = st._id        
        left join department dept on dept._id = import_history.dept_id ? group by mm_id, year`
    , insert:
        `insert or replace into import_history (mm_id, month, year, dept_id, success_count, fail_count, import_count)
        values (@mm_id, @month, @year, @dept_id, @success_count, @fail_count, @import_count)`
    , update:
        `update import_history set  
        mm_id = @mm_id, 
        month = @month, 
        year = @year,
        success_count = @success_count,
        fail_count = @fail_count,
        import_count = @import_count,
        updated_at = (strftime('%Y-%m-%d %H:%M:%f', datetime('now', 'localtime')))`
    , update_add_count:
        `update import_history set  
        success_count = success_count + @success_count,
        fail_count = fail_count + @fail_count,
        import_count = import_count + @import_count,
        updated_at = (strftime('%Y-%m-%d %H:%M:%f', datetime('now', 'localtime'))) where mm_id = @mm_id AND month = @month AND year = @year AND dept_id = @dept_id`
    , order:
        ``,
    delete: `delete from import_history`,
}

// const closing = {
//     select:
//         `select * from closing ?`
//     , select_full:
//         `select json_group_array(json_object('_id', closing._id, 'month', closing.month, 'closed', closing.closed, 'updated_at', closing.updated_at)) as monthly_detail, closing.year, closing.mm_id, closing.dept_id,
//         mm.mm_hin,mm.mm_eng,mm.mm_code, mm.state_id,
//         st.state_hin, st.state_eng,
//         dept.dept_hin, dept.dept_eng, dept.dept_code
//         from closing 
//         left join mm on mm._id = closing.mm_id        
//         left join state st on mm.state_id = st._id        
//         left join department dept on dept._id = closing.dept_id ? group by mm_id, year`
//     , insert:
//         `insert into closing (mm_id, month, year, dept_id, closed)
//         values (@mm_id, @month, @year, @dept_id, @closed)`
//     , update:
//         `update closing set  
//         mm_id = @mm_id, 
//         month = @month, 
//         year = @year,
//         closed = @closed,
//         updated_at = @updated_at`
//     , order:
//         ``,
//     delete: `delete from closing`,
// }

const dictionary = {
    insert: `insert or ignore into dictionary(type, name, extra_note, id, id2) values(@type, @name, @extra_note, @id, @id2)`,
    select: `select * from dictionary ?`,
    select_full:
        `select dict.*,
        CASE WHEN dict.type in ('awk_type', 'jwk_type', 'condition' ) THEN spl.list_name_hin || ' : ' || spl.list_name_eng 
        WHEN dict.type = 'aj_mm' THEN mm.mm_hin || ' : ' || mm.mm_eng
        WHEN dict.type = 'state' THEN state.state_hin || ' : ' || state.state_eng
        WHEN dict.type = 'district' THEN district.district_hin || ' : ' || district.district_eng
        WHEN dict.type = 'zone' THEN zone.zone_hin || ' : ' || zone.zone_eng
        WHEN dict.type = 'city' THEN city.city_hin || ' : ' || city.city_eng
        WHEN dict.type = 'category' THEN ct.category_hin || ' : ' || ct.category_eng
        WHEN dict.type = 'unit' THEN unit.unit_short || ' : ' || unit.unit_full
        WHEN dict.type = 'item' THEN item.item_hin || ' : ' || item.item_eng
        ELSE NULL END as original_name,
        CASE WHEN dict.type = 'item' THEN si.subitem_hin || ' : ' || si.subitem_eng
        ELSE NULL END as sub_name
         from dictionary dict
        left join mm on dict.type = 'aj_mm' AND mm._id = dict.id
        left join support_list spl on dict.type in ('awk_type', 'jwk_type', 'condition' ) AND spl._id = dict.id
        left join state on dict.type = 'state' AND state._id = dict.id
        left join district on dict.type = 'district' AND district._id = dict.id
        left join zone on dict.type = 'zone' AND zone._id = dict.id
        left join city on dict.type = 'city' AND city._id = dict.id
        left join category ct on dict.type = 'category' AND ct._id = dict.id
        left join unit on dict.type = 'unit' AND unit._id = dict.id
        left join item on dict.type = 'item' AND item._id = dict.id
        left join subitem si on dict.type = 'item' AND si._id = dict.id2
         ?
        `,
    update: `update dictionary set 
        type = @type, 
        name = @name,
        extra_note = @extra_note,
        id = @id,
        id2 = @id2`
}

const merge_history = {
    insert: `insert or ignore into merge_history(type, dept_id, old_id, new_id, note) values(@type, @dept_id, @old_id, @new_id, @note)`,
    select: `select * from merge_history`,
    select_full: `select * from merge_history`,
    update: `update merge_history set 
        type = @type, 
        dept_id = @dept_id,
        old_id = @old_id,
        new_id = @new_id,
        note = @note`
}

const excel_correction = {
    get_mm: `select DISTINCT mm as name, 'mm' as type, null as id, false as dictionary from temp_import where mm IS NOT NULL AND mm_id IS NULL`,
    get_aj_mm: `select DISTINCT aj_mm as name, 'aj_mm' as type, null as id, false as dictionary from temp_import where aj_mm IS NOT NULL AND aj_mm_id IS NULL`,
    get_item: `select item as name, subitem as extra_note, 'item' as type, null as id, null as id2, false as dictionary from temp_import where (item IS NOT NULL AND item_id IS NULL) OR (subitem IS NOT NULL AND subitem_id IS NULL) group by item, subitem`,
    get_pbk: `select DISTINCT pbk, 'pbk' as type, null as id, false as dictionary from temp_import where pbk IS NOT NULL AND pbk_id IS NULL`,
    get_awk_type: `select DISTINCT aj_type as name, 'awk_type' as type, null as id, false as dictionary from temp_import where aj_type IS NOT NULL AND aj_type_id IS NULL AND temp_import.type='awk'`,
    get_jwk_type: `select DISTINCT aj_type as name, 'jwk_type' as type, null as id, false as dictionary from temp_import where aj_type IS NOT NULL AND aj_type_id IS NULL AND temp_import.type='jwk'`,
    get_aawak_source: `select DISTINCT aawak_source as name, 'aawak_source' as type, null as id, false as dictionary from temp_import where aawak_source IS NOT NULL AND aawak_source_id IS NULL AND temp_import.type='awk'`,
    get_condition: `select DISTINCT condition as name, 'condition' as type, null as id, false as dictionary from temp_import where condition IS NOT NULL AND condition_id IS NULL`,
    get_product: `select DISTINCT product as name, 'product' as type, null as id, false as dictionary from temp_import where product IS NOT NULL AND product_id IS NULL`,
    get_nimitt: `select DISTINCT nimitt as name, 'nimitt' as type, null as id, false as dictionary from temp_import where nimitt IS NOT NULL AND nimitt_id IS NULL`,
    get_unit: `select DISTINCT unit as name, 'unit' as type, null as id, false as dictionary from temp_import where unit IS NOT NULL AND unit_id IS NULL`,
    get_usage_list: `select DISTINCT usage_list as name, 'usage_list' as type, null as id, false as dictionary from temp_import where usage_list IS NOT NULL AND usage_list_id IS NULL`,

    update_mm: `update temp_import set mm_id = @id where mm = @name`,
    update_usage_list: `update temp_import set usage_list_id = @id where usage_list = @name`,
    update_item: `update temp_import set item_id = @id, subitem_id = @id2 where item = @name`,
    update_subitem: `update temp_import set item_id = @id, subitem_id = @id2 where item = @name AND subitem = @extra_note`,
    update_ignore_subitem: `update temp_import set item = item || ' ' || subitem, item_id = @id, subitem_id = @id2, subitem = null where item = @name AND subitem = @extra_note`,
    update_aj_mm: `update temp_import set aj_mm_id = @id where aj_mm = @name`,
    update_awk_type: `update temp_import set aj_type_id = @id where type = 'awk' AND aj_type = @name`,
    update_jwk_type: `update temp_import set aj_type_id = @id where type = 'jwk' AND aj_type = @name`,
    update_aawak_source: `update temp_import set aawak_source_id = @id where type = 'awk' AND aawak_source = @name`,
    update_condition: `update temp_import set condition_id = @id where condition = @name`,
    update_product: `update temp_import set product_id = @id where product = @name`,
    update_nimitt: `update temp_import set nimitt_id = @id where nimitt = @name`,
    update_pbk: `update temp_import set pbk_id = @id where pbk = @name`,
    update_unit: `update temp_import set unit_id = @id where unit = @name`,
    update_jawak: `update temp_import set jawak_detail = @jawak_detail where _id = @_id`,

    ignore_jwk_nimitt: ` update temp_import set 
        description = description || '; nimitt - ' || @name,
        jawak_detail = json_set(jawak_detail, ti.fk, json_set(ti.value, '$.nimitt', null))
    from (select _id, json_each.fullkey as fk, json_each.value as value from temp_import, json_each(jawak_detail) where json_extract(json_each.value, '$.nimitt') = @name) as ti where ti._id = temp_import._id`,
    ignore_nimitt: `update temp_import set description = description || '; nimitt - ' || nimitt, nimitt = null where nimitt = @name`,
    ignore_product: `update temp_import set item_detail = item_detail || '; CODE - ' || product, product = null where product = @name`,
    // ignore_item: `update temp_import set item = item || ' ' || subitem, item_id = @id, subitem = null where item = @name AND subitem = @extra_note`,


}

const unit = {
    select:
        `select * from unit ?`
    , select_full:
        `select * from unit ? limit @limit offset @offset`
    , insert:
        `insert into unit (
            unit_short,
            unit_full,
            active)
        values (
            @unit_short,
            @unit_full,
            @active)`
    , insert_ignore:
        `insert or ignore into unit (
            _id,
            unit_short,
            unit_full,
            created_at,
            updated_at,
            active) 
        values (
            @_id,
            @unit_short,
            @unit_full,
            @created_at,
            @updated_at,
            @active)`
    , import_update:
        `update unit set 
        unit_short=@unit_short,
        unit_full=@unit_full,
        created_at=@created_at,
        updated_at=@updated_at where _id = @_id`
    , update:
        `update unit set
        unit_short=@unit_short,
        unit_full=@unit_full,
        updated_at=datetime('now','localtime')`
    , order:
        `unit_short, unit_full`
}

const conditions = {
    vehicle_duplicate: `gadi_num = @gadi_num`,
    product_duplicate: `(product_code IS NOT NULL AND product_code = @product_code) OR (sr_num IS NOT NULL AND sr_num = @sr_num)`,
    pbk_duplicate: `roll_no = @roll_no OR (pbk_hin = @pbk_hin AND gender = @gender AND state_id = @state_id)`,
    nimitt_duplicate: `roll_no = @roll_no OR (nimitt_hin = @nimitt_hin AND gender = @gender AND state_id = @state_id)`,
    subitem_list_duplicate: `subitem_hin = @subitem_hin OR (subitem_eng IS NOT NULL AND subitem_eng = @subitem_eng) OR (subitem_roman IS NOT NULL AND subitem_roman = @subitem_roman)`,
    item_duplicate: `item_hin = @item_hin OR (item_eng IS NOT NULL AND item_eng = @item_eng) OR (item_roman IS NOT NULL AND item_roman = @item_roman) OR (item_code IS NOT NULL AND item_code = @item_code)`,
    subitem_duplicate: `item_id = @item_id AND subitem_hin = @subitem_hin`,
    support_list_duplicate: `list_type = @list_type AND list_name_eng = @list_name_eng `,
    category_duplicate: `category_eng = @category_eng OR category_hin = @category_hin `,
    district_duplicate: `(district_eng = @district_eng OR district_hin = @district_hin) AND state_id = @state_id`,
    rel_item_category_duplicate: `item_id = @item_id AND category_id = @category_id`,
    rel_subitem_category_duplicate: `subitem_id = @subitem_id AND category_id = @category_id`,
    attribute_duplicate: `attribute_hin = @attribute_hin OR (attribute_eng IS NOT NULL AND attribute_eng = @attribute_eng AND @attribute_eng != '') OR (attribute_roman IS NOT NULL AND attribute_roman = @attribute_roman AND @attribute_roman != '')`,
    attributes_value_duplicate: `attribute_id = @attribute_id AND (attribute_value_hin = @attribute_value_hin OR (attribute_value_eng IS NOT NULL AND attribute_value_eng = @attribute_value_eng AND @attribute_value_eng != '') OR (attribute_value_roman IS NOT NULL AND attribute_value_roman = @attribute_value_roman AND @attribute_value_roman != ''))`,
}

genDeptDB = {

    point: `insert into point select * from mainDB.point`,
    insertDept: `insert into department(_id, dept_eng, dept_hin, dept_code, settings, password, active, created_at, updated_at) select _id, dept_eng, dept_hin, dept_code, '{}', password, active, created_at, updated_at from mainDB.department`,

    updateDept: `update department set settings = (select settings from mainDB.department dp where dp._id = department._id) where department._id in (select json_each.value from mainDB.department_config, json_each(config_value) where dept_id = @dept_id AND config_key='department')`,

    // insertDeptConfig: `insert into department_config(_id, dept_id, config_key, config_value, active, created_at, updated_at) select _id, dept_id, config_key, '[]', active, created_at, updated_at from mainDB.department_config`,

    // insertDept: `insert into department select * from mainDB.department dept where (select dpc.config_value from mainDB.department_config dpc where dpc.dept_id = ? AND dpc.config_key = 'department') LIKE '%,'|| dept._id||',%'`,

    updateDeptConfig: `update department_config set config_value = (select config_value from mainDB.department_config dpc where dpc.dept_id = department_config.dept_id and dpc.config_key = department_config.config_key) where department_config.dept_id = @dept_id OR department_config.dept_id in (select json_each.value from mainDB.department_config, json_each(config_value) where dept_id = @dept_id AND config_key='department')`,

    country: `insert into country select * from mainDB.country`,
    zone: `insert into zone select * from mainDB.zone`,
    state: `insert into state select * from mainDB.state`,
    // dictionary: `insert into dictionary select * from dictionary`,
    delete_s_list: `delete from support_list`,
    // support_list: `insert into support_list select * from mainDB.support_list where list_type NOT IN ('aawak_type', 'jawak_type') OR support_list._id in (select json_each.value from department_config, json_each(config_value) where dept_id = @dept_id AND config_key='aj_type')`,
    support_list: `insert into support_list select * from mainDB.support_list`,
    city: `insert into city select * from mainDB.city`,
    unit: `insert into unit select * from mainDB.unit`,

    category: `insert into category select * from mainDB.category`,
    // category: `insert into category select * from mainDB.category where category._id in (select json_each.value from department_config, json_each(config_value) where dept_id = @dept_id AND config_key='category')`,

    mm: `insert into mm select * from mainDB.mm`,

    item: `insert into item select * from mainDB.item`,
    // item: `insert into item select * from mainDB.item where item._id in (select json_each.value from department_config, json_each(config_value) where dept_id = @dept_id AND config_key='item')`,

    // subitem_list: `insert into subitem_list select * from mainDB.subitem_list `,

    subitem: `insert into subitem select * from mainDB.subitem `,
    // subitem: `insert into subitem select * from mainDB.subitem where subitem._id in (select json_each.value from department_config, json_each(config_value) where dept_id = @dept_id AND config_key='subitem')`,

    pbk: `insert into pbk select * from mainDB.pbk where pbk._id in (select json_each.value from department_config, json_each(config_value) where dept_id = @dept_id AND config_key='pbk')`,

    nimitt: `insert into nimitt select * from mainDB.nimitt where nimitt._id in (select json_each.value from department_config, json_each(config_value) where dept_id = @dept_id AND config_key='nimitt')`,

    // product: `insert into product select * from mainDB.product where dept_id = @dept_id`,
    // aawak: `insert into aawak select * from mainDB.aawak where dept_id = @dept_id`,
    // jawak: `insert into jaw/ak select * from mainDB.jawak where dept_id = @dept_id`,
    // bachat_new: `insert into bachat_new select * from mainDB.bachat_new where dept_id = @dept_id`,
    vehicle: `insert into vehicle select * from mainDB.vehicle`,
    vehicle_document: `insert or ignore into vehicle_document select * from mainDB.vehicle_document`,

    // import_history: `insert into import_history select * from mainDB.import_history where dept_id = @dept_id`,
    dictionary: `insert into dictionary select * from mainDB.dictionary`,

    // bachat: `insert into bachat select * from mainDB.bachat where dept_id = ?`,
}

reports = {
    pbk: `select aawak.*, 
    mm.mm_hin,mm.mm_eng,mm.mm_code,
    amm.mm_hin as aawak_mm_hin, amm.mm_eng as aawak_mm_eng, amm.mm_code as aawak_mm_code, 
    pbk.roll_no, pbk.pbk_hin, pbk.pbk_eng, pbk.relation, pbk.relative_name,
    item.item_hin, item.item_eng, item.item_code, item.item_roman, item.icategories as icategories,
    si.subitem_hin, si.subitem_eng, si.subitem_roman, si.categories as scategories,
    product.sr_num, product.product_code,
    sl.list_name_hin as condition_hin, sl.list_name_eng as condition_eng,
    dept.dept_eng, dept.dept_hin, dept.dept_code,
    unit.unit_short, unit.unit_full,
    slat.list_name_hin as aawak_type_hin, slat.list_name_eng as aawak_type_eng,
    nmt.nimitt_hin, nmt.nimitt_eng, nmt.relative_name as father_name, nmt.state_id as nimitt_state_id, pst.state_hin as nimitt_state_hin, pst.state_eng as nimitt_state_eng
    from aawak 
    left join mm on mm._id = aawak.mm_id
    left join pbk on pbk._id = aawak.pbk_id
    left join mm amm on amm._id = aawak.aawak_mm_id
    left join v_item item on item._id = aawak.item_id
    left join v_subitem si on si._id = aawak.subitem_id
    left join product on product._id = aawak.product_id
    left join support_list sl on sl._id = aawak.condition_id
    left join unit on unit._id = aawak.unit_id
    left join department dept on dept._id = aawak.dept_id
    left join support_list slat on slat._id = aawak.aawak_type_id
    left join nimitt nmt on nmt._id = aawak.nimitt_id
    left join state pst on pst._id = nmt.state_id ?`
}

const aawak_enzyme = {
    select: `select * from aawak_enzyme ?`,
    select_full: `select aawak_enzyme.*,
        aawak.date, aawak.mm_id, aawak.item_id, aawak.subitem_id, aawak.qty as aawak_qty,
        sl1.list_name_hin as container_aawak_source_hin, sl1.list_name_eng as container_aawak_source_eng,
        sl2.list_name_hin as container_capacity_hin, sl2.list_name_eng as container_capacity_eng
        from aawak_enzyme
        left join aawak on aawak._id = aawak_enzyme.aawak_id
        left join support_list sl1 on sl1._id = aawak_enzyme.container_aawak_source_id
        left join support_list sl2 on sl2._id = aawak_enzyme.container_capacity ? limit @limit offset @offset`,
    insert: `insert into aawak_enzyme (
        aawak_id, container_aawak_source_id, container_enz_no, container_capacity, container_qty)
    values (
        @aawak_id, @container_aawak_source_id, @container_enz_no, @container_capacity, @container_qty)`,
    update: `update aawak_enzyme set
        container_aawak_source_id=@container_aawak_source_id,
        container_enz_no=@container_enz_no,
        container_capacity=@container_capacity,
        container_qty=@container_qty,
        updated_at=datetime('now','localtime') where _id = @_id`,
    delete_by_ref: `delete from aawak_enzyme where aawak_id = ?`,
    order: `aawak_enzyme._id`
}

const jawak_enzyme = {
    select: `select * from jawak_enzyme ?`,
    select_full: `select jawak_enzyme.*,
        jawak.date, jawak.mm_id, jawak.item_id, jawak.subitem_id, jawak.qty as jawak_qty,
        sl.list_name_hin as container_capacity_hin, sl.list_name_eng as container_capacity_eng
        from jawak_enzyme
        left join jawak on jawak._id = jawak_enzyme.jawak_id
        left join support_list sl on sl._id = jawak_enzyme.container_capacity ? limit @limit offset @offset`,
    insert: `insert into jawak_enzyme (
        jawak_id,
        container_capacity)
    values (
        @jawak_id,
        @container_capacity)`,
    update: `update jawak_enzyme set
        container_capacity=@container_capacity,
        updated_at=datetime('now','localtime') where _id = @_id`,
    delete_by_ref: `delete from jawak_enzyme where jawak_id = ?`,
    order: `jawak_enzyme._id`
}

const usage_report = {
    select: `select * from usage_report ?`,
    select_full: `select usage_report.*,
        jawak.date, jawak.mm_id, jawak.item_id, jawak.subitem_id, jawak.qty as jawak_qty,
        sl.list_name_hin as usage_type_hin, sl.list_name_eng as usage_type_eng
        from usage_report
        left join jawak on jawak._id = usage_report.jawak_id
        left join support_list sl on sl._id = usage_report.usage_type ? limit @limit offset @offset`,
    insert: `insert into usage_report (
        jawak_id, date, reporter, usage_type, fayda, nuksan, rating)
    values (
        @jawak_id, @date, @reporter, @usage_type, @fayda, @nuksan, @rating)`,
    update: `update usage_report set
        jawak_id=@jawak_id,
        date=@date,
        reporter=@reporter,
        usage_type=@usage_type,
        fayda=@fayda,
        nuksan=@nuksan,
        rating=@rating,
        updated_at=datetime('now','localtime') where _id = @_id`,
    delete_by_ref: `delete from usage_report where jawak_id = ?`,
    order: `usage_report.date desc`
}



const test = {
    select: `select * from test ?`,
    select_full: `select * from test ?`,
    insert: `insert into test(name) values(@name)`,
}

const prastav = {
    select: `select * from prastav ?`,
    select_full: `select prastav.*, mm.mm_hin, mm.mm_eng, mm.mm_code, item.item_hin, item.item_eng, item.item_code, item.item_roman, item.icategories as icategories, si.subitem_hin, si.subitem_eng, si.subitem_roman, si.categories as scategories, unit.unit_short, unit.unit_full 
    from prastav 
    left join mm on mm._id = prastav.mm_id 
    left join v_item item on item._id = prastav.item_id 
    left join v_subitem si on si._id = prastav.subitem_id 
    left join unit on unit._id = prastav.unit_id ?`,
    order: `prastav._id`
}

const prastav_jawak = {
    select: `select * from prastav_jawak ?`,
    select_full: `select prastav_jawak.*, prastav.date, prastav.mm_id, prastav.pbk_count, prastav.item_id, prastav.subitem_id, prastav.unit_id, prastav.qty, prastav.rate, prastav.amount, mm.mm_hin, mm.mm_eng, mm.mm_code, item.item_hin, item.item_eng, item.item_code, item.item_roman, item.icategories as icategories, si.subitem_hin, si.subitem_eng, si.subitem_roman, si.categories as scategories, unit.unit_short, unit.unit_full 
    from prastav_jawak 
    left join prastav on prastav._id = prastav_jawak.prastav_id 
    left join mm on mm._id = prastav_jawak.mm_id 
    left join v_item item on item._id = prastav_jawak.item_id 
    left join v_subitem si on si._id = prastav_jawak.subitem_id 
    left join unit on unit._id = prastav_jawak.unit_id ?`,
    order: `prastav_jawak._id`
}

const rel_item_category = {
    select: `select * from rel_item_category ?`,
    select_full: `select * from rel_item_category ? limit @limit offset @offset`,
    insert: `insert into rel_item_category(item_id, category_id) values(@item_id, @category_id)`
}

const rel_subitem_category = {
    select: `select * from rel_subitem_category ?`,
    select_full: `select * from rel_subitem_category ? limit @limit offset @offset`,
    insert: `insert into rel_subitem_category(subitem_id, category_id) values(@subitem_id, @category_id)`
}

const rel_aawak_jawak = {
    select: `select * from rel_aawak_jawak ?`,
    select_full: `select * from rel_aawak_jawak ? limit @limit offset @offset`,
    insert: `insert into rel_aawak_jawak(aawak_id, jawak_id, qty, split_qty, is_split) values(@aawak_id, @jawak_id, @qty, @split_qty, @is_split)`
}

const attribute = {
    select: `select * from attributes ?`,
    select_full: `select * from attributes ? limit @limit offset @offset`,
    insert: `insert into attributes(attribute_hin, attribute_eng, attribute_roman, active) values(@attribute_hin, @attribute_eng, @attribute_roman, @active)`,
    import: `insert into attributes(attribute_hin, attribute_eng, attribute_roman, created_at, active) values(@attribute_hin, @attribute_eng, @attribute_roman, datetime('now','localtime'), @active)`,
    update: `update attributes set attribute_hin=@attribute_hin, attribute_eng=@attribute_eng, attribute_roman=@attribute_roman, active=@active`
}

const attributes = attribute;

const attributes_value = {
    select: `select * from attributes_value ?`,
    select_full: `select attributes_value.*, attr.attribute_hin, attr.attribute_eng from attributes_value left join attributes attr on attributes_value.attribute_id = attr._id ? limit @limit offset @offset`,
    insert: `insert into attributes_value(attribute_id, attribute_value_hin, attribute_value_eng, attribute_value_roman, active) values(@attribute_id, @attribute_value_hin, @attribute_value_eng, @attribute_value_roman, @active)`,
    import: `insert into attributes_value(attribute_id, attribute_value_hin, attribute_value_eng, attribute_value_roman, created_at, active) values(@attribute_id, @attribute_value_hin, @attribute_value_eng, @attribute_value_roman, datetime('now','localtime'), @active)`,
    update: `update attributes_value set attribute_id=@attribute_id, attribute_value_hin=@attribute_value_hin, attribute_value_eng=@attribute_value_eng, attribute_value_roman=@attribute_value_roman, active=@active`
}

module.exports = {
    queryBuilder, country, city, category, department, department_config, item, itemmix, mm, nimitt, pbk, point, zone, district, state, subitem, subitem_list, support_list, unit, conditions,
    aawak, aawak_voucher, bachat, pbk_bachat, pbk_closing, jawak, jawak_voucher, bachat_new, temp_import, product, vehicle, vehicle_document,
    hmp_recipe, hmp_recipe_input, hmp_recipe_output, hmp_batch, hmp_batch_input, hmp_batch_output,
    aawak_enzyme, jawak_enzyme, usage_report,
    genDeptDB, excel_correction, dictionary, merge_history, reports, import_history, test, report_comment,
    prastav, prastav_jawak, rel_item_category, rel_subitem_category, rel_aawak_jawak,
    attribute, attributes, attributes_value
};
