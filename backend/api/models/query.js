// const db = require('../models/db.model').db;

const country = {
    select:
        `select * from country ?`
    , select_full:
        `select * from country ? limit @limit offset @offset`
    , insert:
        `insert into country (
            country_hin,
            country_eng,
            active) 
        values (
            @country_hin,
            @country_eng,
            @active)`
    , update:
        `update country set 
        country_hin=@country_hin,
        country_eng=@country_eng,
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
            category_hin,
            category_eng,
            active)
        values (
            @category_hin,
            @category_eng,
            @active)`
    , update:
        `update category set
        category_hin=@category_hin,
        category_eng=@category_eng,
        updated_at=datetime('now','localtime')`
    , update_active:
        `update category set
        active=@active,
        updated_at=datetime('now','localtime')`
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
            password,
            active)
        values (
            @dept_eng,
            @dept_hin,
            @dept_code,
            @password,
            @active)`
    , update:
        `update department set
        dept_eng=@dept_eng,
        dept_hin=@dept_hin,
        dept_code=@dept_code,
        password=@password,
        updated_at=datetime('now','localtime')`
    , update_active:
        `update department set
        active=@active,
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
    , update:
        `update department_config set
        config_key=@config_key,
        config_value=@config_value,
        updated_at=datetime('now','localtime')`
    , update_config_value:
        `update department_config set config_value = CASE WHEN(config_value = '') THEN ',' ELSE config_value END  || @new_id || ',' where dept_id = @dept_id AND config_key = '@tblname'`
}

const item = {
    select:
        `select * from item ?`
    , select_full:
        `select item.*,  si.category_id,
        cat.category_hin, cat.category_eng, 
        unit.unit_full, unit.unit_short 
        from item
        left join category cat on cat._id = item.category_id
        left join subitem si  on si.item_id = item._id
        left join unit on unit._id = item.unit_id ? limit @limit offset @offset`
    , insert:
        `insert into item (
            item_hin,
            item_eng,
            item_code,
            category_id,
            unit_id,
            extra_note,
            active)
        values (
            @item_hin,
            @item_eng,
            @item_code,
            @category_id,
            @unit_id,
            @extra_note,
            @active)`
    , update:
        `update item set
        item_hin=@item_hin,
        item_eng=@item_eng,
        item_code=@item_code,
        category_id=@category_id,
        unit_id=@unit_id,
        extra_note=@extra_note,
        updated_at=datetime('now','localtime')`
    , update_active:
        `update item set
        active=@active,
        updated_at=datetime('now','localtime')`
    , order:
        ` item_hin, item_eng`
}

const itemmix = {
    select_full: `select item.*, 
    cat.category_hin, cat.category_eng, 
    unit.unit_full, unit.unit_short ,
    json_group_array(JSON('{"_id": ' || si._id || ', "item_id": ' || si.item_id || ', "subitem_list_id": ' || si.subitem_list_id || ', "subitem_hin": "' ||sl.subitem_hin || '", "subitem_eng": "' ||sl.subitem_eng || '", "category_hin": "' || ct.category_hin || '", "category_eng": "' || ct.category_eng || '", "unit_full": "' || ut.unit_full || '", "unit_short": "' || ut.unit_short || '", "category_id": ' || si.category_id || ', "unit_id": ' || si.unit_id || ', "active": ' || si.active || '}')) as subitems, json_group_array(si.category_id) as categories
    from item
    left join category cat on cat._id = item.category_id
    left join unit on unit._id = item.unit_id
    left join subitem si on si.item_id = item._id
    left join category ct on ct._id = si.category_id
    left join unit ut on ut._id = si.unit_id
    left join subitem_list sl on  sl._id = si.subitem_list_id ? group by item._id # limit @limit offset @offset`,
    order: `item_hin, item_eng`,
    count: `select count(*) as total_count from (select count(*) from item 
        left join subitem si on si.item_id = item._id ? group by item._id)`
}

const jawak = {
    select:
        `select * from jawak ?`
    , select_full:
        `select jawak.*,
        amm.mm_hin,amm.mm_eng,amm.mm_code,
        jmm.mm_hin as jawak_mm_hin, jmm.mm_eng as jawak_mm_eng, jmm.mm_code as jawak_mm_code,
        pbk.roll_no, pbk.pbk_hin, pbk.pbk_eng, pbk.relation,
        it.item_hin, it.item_eng, it.item_code,
        sil.subitem_hin, sil.subitem_eng,
        sl.list_name_hin as condition_hin, sl.list_name_eng as condition_eng,
        dept.dept_eng, dept.dept_hin, dept.dept_code,
        unit.unit_short, unit.unit_full,
        jsl.list_name_hin as jawak_type_hin, jsl.list_name_eng as jawak_type_eng ,
        nmt.nimitt_hin, nmt.nimitt_eng, nmt.relative_name as father_name, nmt.state_id as nimitt_state_id, pst.state_hin as nimitt_state_hin, pst.state_eng as nimitt_state_eng
        from jawak
        left join mm amm on amm._id = jawak.mm_id 
        left join pbk on pbk._id = jawak.pbk_id
        left join mm jmm on jmm._id = jawak.jawak_mm_id
        left join item it on it._id = jawak.item_id
        left join subitem si on si._id = jawak.subitem_id
        left join subitem_list sil on sil._id = si.subitem_list_id
        left join product pd on pd._id = jawak.product_id
        left join support_list sl on sl._id = jawak.condition_id 
        left join support_list jsl on jsl._id = jawak.jawak_type_id
        left join unit on unit._id = jawak.unit_id
        left join department dept on dept._id = jawak.dept_id
        left join nimitt nmt on nmt._id = jawak.nimitt_id
        left join state pst on pst._id = nmt.state_id ? limit @limit offset @offset`
    , insert:
        `insert into jawak(
        date, mm_id, pkt_num, pbk_id, jawak_mm_id, item_id,
        subitem_id, product_id, item_detail, condition_id, qty, jawak_type_id,
        unit_id, description, nimitt_id, company_name, aawak_ref_id, dept_id,
        active)
    values (
        @date, @mm_id, @pkt_num, @pbk_id, @jawak_mm_id, @item_id,
        @subitem_id, @product_id, @item_detail, @condition_id, @qty, @jawak_type_id,
        @unit_id, @description, @nimitt_id, @company_name, @aawak_ref_id, @dept_id,
        @active)`
    , update:
        `update jawak set 
        date=@date,
        mm_id=@mm_id,
        pkt_num=@pkt_num,
        pbk_id=@pbk_id,
        jawak_mm_id=@jawak_mm_id,
        item_id=@item_id,
        subitem_id=@subitem_id,
        product_id=@product_id,
        item_detail=@item_detail,
        condition_id=@condition_id,
        qty=@qty,
        jawak_type_id=@jawak_type_id,
        unit_id=@unit_id,
        description=@description,
        nimitt_id=@nimitt_id,
        company_name=@compant_name,
        aawak_ref_id=@aawak_ref_id,
        dept_id=@dept_id,
        updated_at=datetime('now','localtime')`
    , update_active:
        `update jawak set
        active=@active,
        updated_at=datetime('now','localtime')`
    , order:
        `date, jawak_mm_hin, jawak_mm_eng, pkt_num`
}

const aawak = {
    update:
        `update aawak set
        date=@date,
        mm_id=@mm_id,
        pkt_num=@pkt_num,
        pbk_id=@pbk_id,
        aawak_mm_id=@aawak_mm_id,
        item_id=@item_id,
        subitem_id=@subitem_id,
        product_id=@product_id,
        item_detail=@item_detail,
        condition_id=@condition_id,
        qty=@qty,
        rate=@rate,
        actual_amt=@actual_amt,
        aawak_type_id=@aawak_type_id,
        unit_id=@unit_id,
        description=@description,
        nimitt_id=@nimitt_id,
        dept_id=@dept_id,
        company_name=@company_name,
        isbill=@isbill,
        document=@document,
        updated_at=datetime('now','localtime')`
    , insert:
        `insert into aawak (
            date, mm_id, pkt_num, pbk_id, aawak_mm_id, item_id, subitem_id, 
            product_id, item_detail, condition_id, qty, rate, actual_amt, 
            aawak_type_id, unit_id, description, nimitt_id, dept_id, company_name, 
            isbill, remaining_qty, document, active)
        values (
            @date, @mm_id, @pkt_num, @pbk_id, @aawak_mm_id, @item_id, @subitem_id, 
            @product_id, @item_detail, @condition_id, @qty, @rate, @actual_amt, 
            @aawak_type_id, @unit_id, @description, @nimitt_id, @dept_id, @company_name, 
            @isbill, @qty, @document, @active)`
    , select:
        `select * from aawak ?`
    , select_full:
        `select aawak.*, 
        mm.mm_hin,mm.mm_eng,mm.mm_code,
        amm.mm_hin as aawak_mm_hin, amm.mm_eng as aawak_mm_eng, amm.mm_code as aawak_mm_code, 
        pbk.roll_no, pbk.pbk_hin, pbk.pbk_eng, pbk.relation, pbk.relative_name,
        item.item_hin, item.item_eng, item.item_code,
        sil.subitem_hin, sil.subitem_eng,
        sl.list_name_hin as condition_hin, sl.list_name_eng as condition_eng,
        dept.dept_eng, dept.dept_hin, dept.dept_code,
        unit.unit_short, unit.unit_full,
        slat.list_name_hin as aawak_type_hin, slat.list_name_eng as aawak_type_eng,
        nmt.nimitt_hin, nmt.nimitt_eng, nmt.relative_name as father_name, nmt.state_id as nimitt_state_id, pst.state_hin as nimitt_state_hin, pst.state_eng as nimitt_state_eng
        from aawak 
        left join mm on mm._id = aawak.mm_id
        left join pbk on pbk._id = aawak.pbk_id
        left join mm amm on amm._id = aawak.aawak_mm_id
        left join item on item._id = aawak.item_id
        left join subitem si on si._id = aawak.subitem_id
        left join subitem_list sil on sil._id = si.subitem_list_id
        left join product on product._id = aawak.product_id
        left join support_list sl on sl._id = aawak.condition_id
        left join unit on unit._id = aawak.unit_id
        left join department dept on dept._id = aawak.dept_id
        left join support_list slat on slat._id = aawak.aawak_type_id
        left join nimitt nmt on nmt._id = aawak.nimitt_id
        left join state pst on pst._id = nmt.state_id ? limit @limit offset @offset`
    , order:
        `date, aawak_mm_hin, aawak_mm_eng, pkt_num`
}

const bachat = {
    select:
        `select * from bachat ?`
    , select_full:
        `select bachat.*,
        mm.mm_hin,mm.mm_eng,mm.mm_code, mm.state_id, st.state_hin, st.state_eng,      
        it.item_hin, it.item_eng, it.item_code, it.category_id as icat_id, cti.category_hin as icat_hin, cti.category_eng as icat_eng, 
        sil.subitem_hin, sil.subitem_eng, si.category_id as scat_id, cts.category_hin as scat_hin, cts.category_eng as scat_eng, 
        bachat.unit_id,unit.unit_short, unit.unit_full,             
        dept.dept_eng, dept.dept_hin, dept.dept_code
        from bachat
        left join mm on mm._id = bachat.mm_id
        left join item it on it._id = bachat.item_id
        left join subitem si on si._id = bachat.subitem_id
        left join subitem_list sil on sil._id = si.subitem_list_id
        left join unit on unit._id = bachat.unit_id
        left join category cti on cti._id = it.category_id
        left join category cts on cts._id = si.category_id
        left join state st on st._id = mm.state_id
        left join department dept on dept._id = bachat.dept_id ? limit @limit offset @offset`
    , insert:
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
            @active)`
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
        updated_at=datetime('now','localtime')`
    , order:
        `mm.mm_hin, mm.mm_eng, item_hin, subitem_hin, item_eng, subitem_eng, unit.unit_short`
}

const mm = {
    select:
        `select * from mm ?`
    , select_full:
        `select mm.*,
        
        st.state_hin, st.state_eng, 
        pm.mm_hin as parent_mm_hin, pm.mm_eng as parent_mm_eng, pm.mm_code as parent_mm_code, 
        nm.nimitt_hin, nm.nimitt_eng, 
        nst.state_hin as nimitt_state_hin, nst.state_eng as nimitt_state_eng,
        dept.dept_hin, dept.dept_eng, dept.dept_code 
        from mm
        left join state st on st._id = mm.state_id
        left join mm pm on pm._id = mm.parent_mm_id
        left join nimitt nm on nm._id = mm.nimitt_id
        left join state nst on nst._id = nm.state_id
        left join department dept on dept._id = mm.dept_id ? 
     limit @limit offset @offset`
    , insert:
        `insert into mm (
            mm_hin, mm_eng, mm_code, dept_id, state_id,
            parent_mm_id, opening_date, nimitt_id, active)
        values (
            @mm_hin, @mm_eng,  @mm_code, @dept_id, @state_id,
            @parent_mm_id, @opening_date, @nimitt_id, @active)`
    , update:
        `update mm set 
        mm_hin=@mm_hin,
        mm_eng=@mm_eng,
        mm_code=@mm_code,
        dept_id=@dept_id,
        state_id=@state_id,
        parent_mm_id=@parent_mm_id,
        opening_date=@opening_date,
        nimitt_id=@nimitt_id,
        updated_at=datetime('now','localtime')`
    , update_active:
        `update mm set
        active=@active,
        updated_at=datetime('now','localtime')`
    , order:
        `mm_hin, mm_eng`
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
        `select pbk.*, 
        state.state_hin,state.state_eng, 
        city.city_hin,city.city_eng, 
        mm.mm_hin, mm.mm_eng, mm.mm_code
        from pbk 
        left join state on state._id = pbk.state_id
        left join city on city._id = pbk.city_id
        left join mm on mm._id = pbk.class_mm_id ? limit @limit offset @offset`
    , insert:
        `insert into pbk (
            roll_no, pbk_hin, pbk_eng, gender, relation, relative_name, relative_ref,
            birth_date, age, status, address, townarea, state_id, city_id,
            mo_no, alt_mo_no, class_mm_id, bhatti_date, document, active)
        values (
            @roll_no, @pbk_hin, @pbk_eng, @gender, @relation, @relative_name, @relative_ref,
            @birth_date, @age, @status, @address, @townarea, @state_id, @city_id,
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
        city_id=@city_id,
        mo_no=@mo_no,
        alt_mo_no=@alt_mo_no,
        class_mm_id=@class_mm_id,
        bhatti_date=@bhatti_date,
        document=@document,
        updated_at=datetime('now','localtime')`
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

const product = {
    select:
        `select * from product ?`
    , select_full:
        `select product.*,
        mm.mm_hin,mm.mm_eng,mm.mm_code, 
        item.item_hin,item.item_eng,item.item_code,
        subitem_list.subitem_hin,subitem_list.subitem_eng,
        support_list.list_name_hin as condition_hin,support_list.list_name_eng as condition_eng
        from product 
        left join mm on mm._id = product.mm_id
        left join item on item._id = product.item_id
        left join subitem on subitem._id = product.subitem_id
        left join subitem_list on subitem_list._id = subitem.subitem_list_id
        left join support_list on support_list._id = product.condition_id ?
     limit @limit offset @offset`
    , insert:
        `insert into product (
        mm_id, purchased_by, purchase_date, item_id, subitem_id, product_code, company_name,
        model_name, sr_num, condition_id, price, product_detail, accessories, purchase_from,
        warranty_period, dept_id, warranty_from, document, isbill, active)
    values (
        @mm_id, @purchased_by, @purchase_date, @item_id, @subitem_id, @product_code, @company_name,
        @model_name, @sr_num, @condition_id, @price, @product_detail, @accessories, @purchase_from,
        @warranty_period, @dept_id, @warranty_from, @document, @isbill, @active)`
    , update:
        `update product set 
        mm_id=@mm_id,
        purchased_by=@purchased_by,
        purchase_date=@purchase_date,
        item_id=@item_id,
        subitem_id=@subitem_id,
        product_code=@product_code,
        company_name=@company_name,
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
        updated_at=datetime('now','localtime')`
    , order:
        `purchase_date, mm.mm_hin, mm.mm_eng, item_hin, item_eng, subitem_hin, subitem_eng`
}

const state = {
    select:
        `select * from state ?`
    , select_full:
        `select state.*, 
        cnt.country_hin, cnt.country_eng 
        from state 
        left join country cnt on cnt._id = state.country_id  ? limit @limit offset @offset`
    , insert:
        `insert into state (
        state_hin,
        state_eng,
        country_id,
        active)
    values (
        @state_hin,
        @state_eng,
        @country_id,
        @active)`
    , update:
        `update state set 
        state_hin=@state_hin,
        state_eng=@state_eng,
        country_id=@country_id,
        updated_at=datetime('now','localtime')`
    , update_active:
        `update state set
        active=@active,
        updated_at=datetime('now','localtime')`
    , order:
        `state_hin, state_eng`
}

const subitem = {
    select:
        `select * from subitem ?`
    , select_full:
        `select subitem.*, 
        cat.category_hin, cat.category_eng, 
        unit.unit_full, unit.unit_short, 
        item.item_eng, item.item_hin, 
        subitem_list.subitem_eng, subitem_list.subitem_hin 
        from subitem
        left join category cat on cat._id = subitem.category_id
        left join unit on unit._id = subitem.unit_id
        left join item on  item._id = subitem.item_id
        left join subitem_list on  subitem_list._id = subitem.subitem_list_id ? limit @limit offset @offset`
    , insert:
        `insert into subitem (
        item_id,
        subitem_list_id,
        category_id,
        unit_id,
        extra_note,
        active)
    values (
        @item_id,
        @subitem_list_id,
        @category_id,
        @unit_id,
        @extra_note,
        @active)`
    , update:
        `update subitem set 
        item_id=@item_id,
        subitem_list_id=@subitem_list_id,
        category_id=@category_id,
        unit_id=@unit_id,
        extra_note=@extra_note,
        updated_at=datetime('now','localtime')`
    , update_active:
        `update subitem set
        active=@active,
        updated_at=datetime('now','localtime')`
    , order:
        `subitem_hin, subitem_eng`
}

const subitem_list = {
    select:
        `select * from subitem_list ?`
    , select_full:
        `select * from subitem_list ? limit @limit offset @offset`
    , insert:
        `insert into subitem_list (
        subitem_hin,
        subitem_eng,
        extra_note,
        active)
    values (
        @subitem_hin,
        @subitem_eng,
        @extra_note,
        @active)`
    , update:
        `update subitem_list set 
        subitem_hin=@subitem_hin,
        subitem_eng=@subitem_eng,
        extra_note=@extra_note,
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
        active)
    values (
        @list_type,
        @list_name_hin,
        @list_name_eng,
        @active)`
    , update:
        `update support_list set 
        list_type=@list_type,
        list_name_hin=@list_name_hin,
        list_name_eng=@list_name_eng,
        updated_at=datetime('now','localtime')`
    , update_active:
        `update support_list set
        active=@active,
        updated_at=datetime('now','localtime')`
    , order:
        ``
}

const temp_import = {
    select:
        `select * from temp_import ?`
    , select_full:
        `select * from temp_import ? limit @limit offset @offset`
    , insert:
        `insert into temp_import (
        type, date, pkt_num, item_detail, qty, rate, actula_amt,
        company_name, description, isbill, document, mm, mm_id, pbk,
        pbk_id, aj_mm, aj_mm_id, item, item_id, subitem, subitem_id,
        product, product_id, condition, condition_id, unit, unit_id, aj_type,
        aj_type_id, nimitt, nimitt_id, dept, dept_id, ref_id, active)
    values (
        @type, @date, @pkt_num, @item_detail, @qty, @rate, @actula_amt,
        @company_name, @description, @isbill, @document, @mm, @mm_id, @pbk,
        @pbk_id, @aj_mm, @aj_mm_id, @item, @item_id, @subitem, @subitem_id,
        @product, @product_id, @condition, @condition_id, @unit, @unit_id, @aj_type,
        @aj_type_id, @nimitt, @nimitt_id, @dept, @dept_id, @ref_id, @active)`
    , update:
        `update temp_import set 
        type=@type,
        date=@date,
        pkt_num=@pkt_num,
        item_detail=@item_detail,
        qty=@qty,
        rate=@rate,
        actula_amt=@actula_amt,
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
        nimitt=@nimitt,
        nimitt_id=@nimitt_id,
        dept=@dept,
        dept_id=@dept_id,
        ref_id=@ref_id,
        updated_at=datetime('now','localtime')`
    , order:
        ``
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
    , update:
        `update unit set
        unit_short=@unit_short,
        unit_full=@unit_full,
        updated_at=datetime('now','localtime')`
    , order:
        `unit_short, unit_full`
}

genDeptDB = {

    point: `insert into point select * from mainDB.point`,
    insertDept: `insert into department select * from mainDB.department`,
    // insertDeptConfig: `insert into department_config select * from mainDB.department_config`,

    // insertDept: `insert into department select * from mainDB.department dept where (select dpc.config_value from mainDB.department_config dpc where dpc.dept_id = ? AND dpc.config_key = 'department') LIKE '%,'|| dept._id||',%'`,

    updateDeptConfig: `update department_config set config_value = (select config_value from mainDB.department_config dpc where dpc.dept_id = department_config.dept_id and dpc.config_key = department_config.config_key) where department_config.dept_id = @dept_id OR (select depc.config_value from mainDB.department_config depc where depc.dept_id = @dept_id AND depc.config_key = 'department') LIKE '%,'|| department_config.dept_id||',%'`,

    country: `insert into country select * from mainDB.country`,
    state: `insert into state select * from mainDB.state`,
    dictionary: `insert into dictionary select * from dictionary`,
    delete_s_list: `delete from support_list`,
    support_list: `insert into support_list select * from mainDB.support_list where list_type NOT IN ('aawak_type', 'jawak_type') OR (select config_value from department_config where dept_id = @dept_id AND config_key = 'aj_type') LIKE '%,'||_id||',%'`,
    city: `insert into city select * from mainDB.city`,
    unit: `insert into unit select * from mainDB.unit`,

    category: `insert into category select * from mainDB.category where (select config_value from department_config where dept_id = @dept_id AND config_key = 'category') LIKE '%,'||_id||',%'`,

    mm: `insert into mm select * from mainDB.mm where (select config_value from department_config where dept_id = @dept_id AND config_key = 'mm') LIKE '%,'||_id||',%'`,

    item: `insert into item select * from mainDB.item where (select config_value from department_config where dept_id = @dept_id AND config_key = 'item') LIKE '%,'||_id||',%'`,

    subitem_list: `insert into subitem_list select * from mainDB.subitem_list `,

    subitem: `insert into subitem select * from mainDB.subitem where (select config_value from department_config where dept_id = @dept_id AND config_key = 'subitem') LIKE '%,'||_id||',%'`,

    pbk: `insert into pbk select * from mainDB.pbk where (select config_value from department_config where dept_id = @dept_id AND config_key = 'pbk') LIKE '%,'|| pbk._id||',%'`,

    nimitt: `insert into nimitt select * from mainDB.nimitt where (select config_value from department_config where dept_id = @dept_id AND config_key = 'nimitt') LIKE '%,'|| nimitt._id||',%'`,


    product: `insert into product select * from mainDB.product where dept_id = @dept_id`,
    aawak: `insert into aawak select * from mainDB.aawak where dept_id = @dept_id`,
    jawak: `insert into jawak select * from mainDB.jawak where dept_id = @dept_id`,

    // bachat: `insert into bachat select * from mainDB.bachat where dept_id = ?`,
}

const Migrations = [
    //creating all tables
    {
        country: `create table country(
            _id integer UNIQUE primary key AUTOINCREMENT,
            country_hin varchar(50) unique not null,
            country_eng varchar(50) unique null,
            created_at timestamp default (datetime('now', 'localtime')),
            updated_at timestamp default (datetime('now', 'localtime')),
            active tinyint default 0
          )`,
        category: `create table category(
          _id integer UNIQUE primary key AUTOINCREMENT,      
          category_hin varchar(50) unique not null,
          category_eng varchar(50) unique null,
          created_at timestamp default (datetime('now', 'localtime')),
          updated_at timestamp default (datetime('now', 'localtime')),
          active tinyint default 0
        );`,
        unit: `create table unit(
          _id integer UNIQUE primary key AUTOINCREMENT,
          unit_short varchar(50) unique not null,
          unit_full varchar(100) unique null, 
          created_at timestamp default (datetime('now', 'localtime')),
          updated_at timestamp default (datetime('now', 'localtime')),
          active tinyint default 0
        );`,
        subitem_list: `create table subitem_list(
          _id integer UNIQUE primary key AUTOINCREMENT,
          subitem_hin varchar(150) unique not null,
          subitem_eng varchar(150) unique null,
          subitem_roman varchar(150) unique null,
          extra_note text,
          active tinyint default 0,    
          created_at timestamp default (datetime('now', 'localtime')),
          updated_at timestamp default (datetime('now', 'localtime'))
        );`,
        support_list: `create table support_list(
          _id integer UNIQUE primary key AUTOINCREMENT,
          list_type varchar(50) not null,
          list_name_hin varchar(50) null,
          list_name_eng varchar(50) not null,
          list_name_roman varchar(50) null,
          active tinyint default 0,
          created_at timestamp default (datetime('now', 'localtime')),
          updated_at timestamp default (datetime('now', 'localtime')),
          unique(list_type,list_name_hin),
          unique(list_type,list_name_eng)
      );`,
        department: `create table department(
          _id integer UNIQUE primary key AUTOINCREMENT,
          dept_eng varchar(100) unique not null, 
          dept_hin varchar(100) null unique,
          dept_code varchar(50) null unique,  
          password varchar(100) not null,  
          active tinyint default 0,  
          created_at timestamp default (datetime('now', 'localtime')),
          updated_at timestamp default (datetime('now', 'localtime'))
      );`,
        state: `create table state(
        _id integer UNIQUE primary key AUTOINCREMENT,
        state_hin varchar(100) not null,
        state_eng varchar(100) null, 
        country_id integer not null REFERENCES country(_id),
        created_at timestamp default (datetime('now', 'localtime')),
        updated_at timestamp default (datetime('now', 'localtime')),
        active tinyint default 0,    
        UNIQUE(state_hin, country_id),
        UNIQUE(state_eng, country_id)
      );`,
        city: `create table city(
        _id integer UNIQUE primary key AUTOINCREMENT,
        city_hin varchar(100) not null,
        city_eng varchar(100) null, 
        state_id integer not null REFERENCES state(_id),
        created_at timestamp default (datetime('now', 'localtime')),
        updated_at timestamp default (datetime('now', 'localtime')),
        active tinyint default 0,    
        UNIQUE(city_hin, state_id),
        UNIQUE(city_eng, state_id)
      );`,
        item: `create table item(
        _id integer UNIQUE primary key AUTOINCREMENT,
        item_hin varchar(150) unique not null,
        item_eng varchar(150) unique null,
        item_roman varchar(150) null,
        item_code varchar(50) unique null, 
        category_id integer not null REFERENCES category(_id),
        unit_id integer null REFERENCES unit(_id),
        extra_note text,
        document json,
        active tinyint default 0,    
        created_at timestamp default (datetime('now', 'localtime')),
        updated_at timestamp default (datetime('now', 'localtime'))
      );`,
        subitem: `create table subitem(
        _id integer UNIQUE primary key AUTOINCREMENT,
        item_id integer not null REFERENCES item(_id),
        subitem_list_id integer not null REFERENCES subitem_list(_id),
        category_id integer not null REFERENCES category(_id),
        unit_id integer null REFERENCES unit(_id),
        extra_note text,
        document json,
        active tinyint default 0,    
        created_at timestamp default (datetime('now', 'localtime')),
        updated_at timestamp default (datetime('now', 'localtime')),
        UNIQUE(item_id, subitem_list_id)
      );`,
        mm: `create table mm(
        _id integer UNIQUE primary key AUTOINCREMENT,
        mm_hin varchar(100) not null,
        mm_eng varchar(100) null, 
        mm_roman varchar(100) null, 
        mm_code varchar(50) unique null, 
        dept_id integer null references department(_id),
        state_id integer not null references state(_id),
        parent_mm_id integer null REFERENCES mm(_id),
        opening_date date null,
        nimmit_id integer REFERENCES pbk(_id),
        active tinyint default 0,  
        created_at timestamp default (datetime('now', 'localtime')),
        updated_at timestamp default (datetime('now', 'localtime')),
        unique(mm_eng,dept_id),
        unique(mm_hin,dept_id)
      );`,
        pbk: `create table pbk(
        _id integer UNIQUE primary key AUTOINCREMENT,
        roll_no decimal unique null,
        pbk_hin varchar(150) not null,
        pbk_eng varchar(150) null,
        pbk_roman varchar(150) null,
        gender varchar(50) not null,
        relation varchar(50) null,
        relative_name varchar(150) null,
        relative_ref json null,
        birth_date date,
        age int,
        status varchar(50) null,
        address text null,
        townarea varchar(200) null,
        state_id integer not null REFERENCES state(_id),
        city_id integer null REFERENCES city(_id),
        mo_no numeric(10) null,
        alt_mo_no json null,
        class_mm_id integer null references mm(_id),
        bhatti_date date null,
        document json,
        active tinyint default 0,    
        created_at timestamp default (datetime('now', 'localtime')),
        updated_at timestamp default (datetime('now', 'localtime')),
        unique(pbk_hin,pbk_eng,gender,state_id,relation,relative_name,city_id)
      );`,
        department_config: `create table department_config(
        _id integer unique primary key AUTOINCREMENT,
        dept_id integer not null references department(_id) ON DELETE CASCADE,
        config_key varchar(100) not null,
        config_value text null,
        active tinyint default 0,
        created_at timestamp default (datetime('now', 'localtime')),
        updated_at timestamp default (datetime('now', 'localtime')),
        unique(dept_id, config_key)
    );`,
        product: `create table product(
      _id integer UNIQUE primary key AUTOINCREMENT,
      mm_id integer null REFERENCES mm(_id),
      purchased_by varchar(200) null,
      purchase_date date null,
      item_id integer not null references item(_id),
      subitem_id integer null references subitem(_id),
      product_code varchar(100) null,
      company_name varchar(100) null,
      model_name varchar(100) null,
      sr_num varchar(50) null,
      condition_id integer not null references support_list(_id),
      price numeric(10,2) null,
      product_detail text null,
      accessories text null,
      purchase_from text null,
      warranty_period int null,
      dept_id integer references department(_id),
      warranty_from varchar(100) null,
      document json,
      nimmit varchar(150) null,
      active tinyint default 0,  
      created_at timestamp default (datetime('now', 'localtime')),
      updated_at timestamp default (datetime('now', 'localtime')),
      unique(product_code,sr_num)    
    );`,
        aawak: `create table aawak(
      _id integer UNIQUE primary key AUTOINCREMENT,
      date date not null,
      mm_id integer not null references mm(_id),
      pkt_num varchar(50) null,
      pbk_id integer null references pbk(_id),
      aawak_mm_id integer null references mm(_id),
      item_id integer not null references item(_id),
      subitem_id integer null references subitem(_id),
      product_id integer null references product(_id),
      item_detail text null,
      company_name varchar(100) null,
      condition_id integer null references support_list(_id),
      qty DECIMAL(10,2) not null,
      rate DECIMAL(10,2) null,
      actual_amt DECIMAL(10,2) null,
      aawak_type_id int not null references support_list(_id),
      unit_id integer not null references unit(_id),
      description text null,
      nimmit_id integer REFERENCES pbk(_id),
      jawak_ref_ids text null,
      remaining_qty decimal(10,2) null,
      hl tinyint default 0,
      active tinyint default 0,
      dept_id integer references department(_id),
      created_at timestamp default (datetime('now', 'localtime')),
      updated_at timestamp default (datetime('now', 'localtime')),
      unique(date,pkt_num,pbk_id,mm_id,item_id,subitem_id,product_id,condition_id,aawak_type_id,dept_id)
    );`,
        jawak: `create table jawak(
      _id integer UNIQUE primary key AUTOINCREMENT,
      date date not null,
      mm_id integer not null references mm(_id),
      pkt_num varchar(50) null,
      pbk_id integer null references pbk(_id),
      jawak_mm_id integer null references mm(_id),
      item_id integer not null references item(_id),
      subitem_id integer null references subitem(_id),
      product_id integer null references product(_id),
      item_detail text null,
      company_name varchar(100) null,
      condition_id integer null references support_list(_id),
      qty DECIMAL(10,2) not null,
      jawak_type_id int not null references support_list(_id),
      unit_id integer not null references unit(_id),
      description text null,
      nimmit_id integer REFERENCES pbk(_id),
      aawak_ref_id integer null references aawak(_id) ON DELETE CASCADE,
      hl tinyint default 0,
      active tinyint default 0,
      dept_id integer references department(_id),
      created_at timestamp default (datetime('now', 'localtime')),
      updated_at timestamp default (datetime('now', 'localtime')),
      unique(date,pkt_num,pbk_id,mm_id,item_id,subitem_id,product_id,condition_id,jawak_type_id,dept_id)
    );`,
        bachat: `create table bachat(
        _id integer primary key AUTOINCREMENT,
        mm_id integer not null references mm(_id),
        item_id integer not null references item(_id),
        subitem_id integer null references subitem(_id),
        Stock decimal(10,2) default 0,
        Used decimal(10,2) default 0,
        New decimal(10,2) default 0,
        Old decimal(10,2) default 0,
        Defective decimal(10,2) default 0,      
        Scrap decimal(10,2) default 0,  
        unit_id integer not null references unit(_id),
        dept_id integer not null references department(_id),
        active tinyint default 0,
        created_at timestamp default (datetime('now', 'localtime')),
        updated_at timestamp default (datetime('now', 'localtime')),
        unique(mm_id,item_id,unit_id,dept_id,subitem_id)
      );`,
        points: `CREATE TABLE IF NOT EXISTS "point"(
        _id integer PRIMARY KEY AUTOINCREMENT,
        type varchar(100),
        no int,
        mrl_date date,
        clrf_date date,
        time_from varchar(15),
        time_to varchar(15),
        point_hin text not null,
        point_eng text,
        created_at timestamp default (datetime('now', 'localtime')),
        updated_at timestamp default (datetime('now', 'localtime')),
        active tinyint default 0
      )`
    },
    /* changes
      => drop all procedures
      => new table : dictionary
      => new table : nimmit
      => tranfering nimmit from pbk
      => updating nimmit_id reference from aawak, jawak, mm from pbk to nimmit
      => delete nimmit from pbk
      => change bachat references to ON DELETE CASCADE.
      => new col : isbill in aawak, jawak, product.
      => new col : Reapiring in bachat. 
      => insert new condition : Repairing
    */
    {
        drop_bachat_monthly: `DROP TABLE IF EXISTS bachat_monthly`,
        drop_import_temp: `DROP TABLE IF EXISTS import_temp`,
        drop_dept_ins_config_ins: `DROP TRIGGER IF EXISTS "dept_ins_config_ins"`,
        drop_awk_ins_bcht_updt: `DROP TRIGGER IF EXISTS "awk_ins_bcht_updt"`,
        drop_awk_ins_bcht_ins: `DROP TRIGGER IF EXISTS "awk_ins_bcht_ins"`,
        drop_awk_updt_bcht_updt: `DROP TRIGGER IF EXISTS "awk_updt_bcht_updt"`,
        drop_awk_del_bcht_updt: `DROP TRIGGER IF EXISTS "awk_del_bcht_updt"`,
        drop_jwk_ins_bcht_updt: `DROP TRIGGER IF EXISTS "jwk_ins_bcht_updt"`,
        drop_jwk_updt_bcht_updt: `DROP TRIGGER IF EXISTS "jwk_updt_bcht_updt"`,
        drop_jwk_del_bcht_updt: `DROP TRIGGER IF EXISTS "jwk_del_bcht_updt"`,
        drop_prdct_ins_bcht_updt: `DROP TRIGGER IF EXISTS "prdct_ins_bcht_updt"`,
        drop_prdct_updt_bcht_updt: `DROP TRIGGER IF EXISTS "prdct_updt_bcht_updt"`,
        drop_prdct_del_bcht_updt: `DROP TRIGGER IF EXISTS "prdct_del_bcht_updt"`,
        drop_jwk_del_updt_ref_awk: `DROP TRIGGER IF EXISTS "jwk_del_updt_ref_awk"`,
        drop_jwk_ins_avk_ref_updt: `DROP TRIGGER IF EXISTS "jwk_ins_avk_ref_updt"`,
        drop_jwk_updt_avk_ref_updt: `DROP TRIGGER IF EXISTS "jwk_updt_avk_ref_updt"`,

        dictionary: `create table IF NOT EXISTS dictionary(
        _id integer primary key AUTOINCREMENT,
        type varchar(50) not null,
        name text not null,
        extra_note text,	
        real_id integer not null,
        created_at timestamp default (datetime('now', 'localtime'))
      )`,

        nimitt: `create table IF NOT EXISTS nimitt(
        _id integer UNIQUE primary key AUTOINCREMENT,
        old_id integer,
        roll_no decimal unique null,
        nimitt_hin varchar(150) not null,
        nimitt_eng varchar(150) null,
        gender varchar(50) not null,
        relative_name varchar(150) null,
        state_id integer not null REFERENCES state(_id),
        townarea varchar(200) null,
        document json,
        active tinyint default 0,    
        created_at timestamp default (datetime('now', 'localtime')),
        updated_at timestamp default (datetime('now', 'localtime')),
        unique(nimitt_hin,nimitt_eng,gender,state_id,relative_name)
      )`,

        insert_nimitt_from_pbk: `insert into nimitt(old_id, roll_no, nimitt_hin, nimitt_eng, gender, relative_name, state_id, townarea, document, active) select _id, roll_no, pbk_hin, pbk_eng, gender, relative_name, state_id, townarea, document, active from pbk where status = 'nimmit'`,

        aawak_new_nimitt_id: `alter table "aawak" add column new_nimitt_id integer REFERENCES nimitt(_id)`,
        jawak_new_nimitt_tid: `alter table "jawak" add column new_nimitt_id integer REFERENCES nimitt(_id)`,
        mm_new_nimitt_id: `alter table "mm" add column new_nimitt_id integer REFERENCES nimitt(_id)`,

        aawak_set_new_nimitt: `update "aawak" set new_nimitt_id = (select _id from nimitt where old_id = aawak.nimmit_id limit 1) where nimmit_id IS NOT NULL`,
        jawak_set_new_nimitt: `update "jawak" set new_nimitt_id = (select _id from nimitt where old_id = jawak.nimmit_id limit 1) where nimmit_id IS NOT NULL`,
        mm_set_new_nimitt: `update "mm" set new_nimitt_id = (select _id from nimitt where old_id = mm.nimmit_id limit 1) where nimmit_id IS NOT NULL`,

        aawak_drop_nimitt_id: `alter table "aawak" drop column nimmit_id`,
        jawak_drop_nimitt_id: `alter table "jawak" drop column nimmit_id`,
        mm_drop_nimitt_id: `alter table "mm" drop column nimmit_id`,

        aawak_add_nimitt_id: `alter table "aawak" add column nimitt_id integer REFERENCES nimitt(_id)`,
        jawak_add_nimitt_id: `alter table "jawak" add column nimitt_id integer REFERENCES nimitt(_id)`,
        mm_add_nimitt_id: `alter table "mm" add column nimitt_id integer REFERENCES nimitt(_id)`,

        aawak_copy_new_nimitt: `update "aawak" set nimitt_id = new_nimitt_id`,
        jawak_copy_new_nimitt: `update "jawak" set nimitt_id = new_nimitt_id`,
        mm_copy_new_nimitt: `update "mm" set nimitt_id = new_nimitt_id`,

        aawak_drop_nimitt_new: `alter table "aawak" drop column new_nimitt_id`,
        jawak_drop_nimitt_new: `alter table "jawak" drop column new_nimitt_id`,
        mm_drop_nimitt_new: `alter table "mm" drop column new_nimitt_id`,

        delete_nimitt_from_pbk: `delete from pbk where status = 'nimmit'`,

        bachat_rename: `alter table "bachat" rename to "bachat_backup"`,
        bachat_recreate: `create table IF NOT EXISTS bachat(
        _id integer primary key AUTOINCREMENT,
        mm_id integer not null references mm(_id) ON DELETE CASCADE,
        item_id integer not null references item(_id) ON DELETE CASCADE,
        subitem_id integer null references subitem(_id) ON DELETE CASCADE,
        Stock decimal(10,2) default 0,
        Used decimal(10,2) default 0,
        New decimal(10,2) default 0,
        Old decimal(10,2) default 0,
        Defective decimal(10,2) default 0,     
        Scrap decimal(10,2) default 0,  
        unit_id integer not null references unit(_id) ON DELETE CASCADE,
        dept_id integer not null references department(_id) ON DELETE CASCADE,
        active tinyint default 0,
        created_at timestamp default (datetime('now', 'localtime')),
        updated_at timestamp default (datetime('now', 'localtime')),
        unique(mm_id,item_id,unit_id,dept_id,subitem_id)
      );`,
        bachat_insert: `insert into bachat(_id, mm_id, item_id, subitem_id, Stock, Used, New, Old, Defective, Scrap, unit_id, dept_id, active, created_at, updated_at) select _id, mm_id, item_id, subitem_id, Stock, Used, New, Old, Defective, Scrap, unit_id, dept_id, active, created_at, updated_at from bachat_backup`,
        drop_bachat_backup: `drop table "bachat_backup"`,

        temp_import: `create table IF NOT EXISTS temp_import(
        _id integer primary key AUTOINCREMENT,
        type varchar(50),      
        date date,
        pkt_num varchar(50),
        item_detail text,
        qty decimal(10,2),
        rate decimal(10,2),
        actual_amt decimal(10,2),
        company_name varchar(150),
        description text,
        isbill tinyint(1),
        document json,
        mm varchar(100),
        mm_id integer,
        pbk varchar(150),
        pbk_id integer,
        aj_mm varchar(100),
        aj_mm_id integer,
        item varchar(100),
        item_id integer,
        subitem varchar(100),
        subitem_id integer,
        product varchar(150),
        product_id integer,
        condition varchar(100),
        condition_id integer,
        unit varchar(50),
        unit_id integer,
        aj_type varchar(50),
        aj_type_id integer,
        nimmit varchar(150),
        nimmit_id integer,
        dept varchar(100),
        dept_id integer,
        ref_id integer
  
      )`,
        add_col_repairing: `ALTER TABLE "bachat" ADD COLUMN Repairing decimal(10,2) default 0`,

        add_nimitt_dept_conf: ` insert into department_config(dept_id, config_key, config_value, active) select _id, 'nimmit', ',', 1 from department `,

        add_col_isbill: `ALTER TABLE "aawak" ADD COLUMN isbill tinyint(1) default 0`,
        add_col_doc_to_aawak: `ALTER TABLE "aawak" ADD COLUMN document json`,
        add_col_isbill_prdct: `ALTER TABLE "product" ADD COLUMN isbill tinyint(1) default 0`,

        insert_repairing_condition: `Insert or ignore into support_list(list_type, list_name_hin, list_name_eng, active) values('condition', 'रिपेरींग', 'Repairing', 1)`,
    },
    //creating all triggers
    {
        dept_ins_config_ins:
            `CREATE TRIGGER IF NOT EXISTS "dept_ins_config_ins"
          AFTER INSERT ON "department"
          FOR EACH ROW 
          BEGIN
            insert into department_config(dept_id, config_key, config_value, active) values(NEW._id, 'mm', '', NEW.active),(NEW._id, 'item', '', NEW.active),(NEW._id, 'category', '', NEW.active), (NEW._id, 'subitem', '', NEW.active), (NEW._id, 'subitem_list', '', NEW.active),(NEW._id, 'pbk', '', NEW.active),(NEW._id, 'department', '', NEW.active),(NEW._id, 'aj_type', '', NEW.active), (NEW._id, 'settings', json('{}'), NEW.active);
          END;`,
        awk_ins_bcht_updt:
            `CREATE TRIGGER IF not exists "awk_ins_bcht_updt" 
          AFTER INSERT ON "aawak" 
          FOR EACH ROW     
          WHEN EXISTS(select _id from bachat where created_at != NEW.created_at AND mm_id = NEW.mm_id AND item_id = NEW.item_id AND dept_id = NEW.dept_id AND (NEW.subitem_id IS NULL OR subitem_id = NEW.subitem_id) AND unit_id = NEW.unit_id)  
          BEGIN
              update bachat set 
              Stock = Stock + NEW.qty,
              New = New + (CASE WHEN NEW.condition_id = 33 THEN NEW.qty ELSE 0 END),
              Old = Old + (CASE WHEN NEW.condition_id = 34 THEN NEW.qty ELSE 0 END),
              Defective = Defective + (CASE WHEN NEW.condition_id = 35 THEN NEW.qty ELSE 0 END),
              Repairing = Repairing + (CASE WHEN (select list_name_eng from support_list where _id = NEW.condition_id) LIKE '%Repairing%' THEN NEW.qty ELSE 0 END),
              Scrap = Scrap + (CASE WHEN NEW.condition_id = 36 THEN NEW.qty ELSE 0 END)
              where mm_id = NEW.mm_id AND item_id = NEW.item_id AND dept_id = NEW.dept_id AND (NEW.subitem_id IS NULL OR subitem_id = NEW.subitem_id) AND unit_id = NEW.unit_id;                                      
          END;`,
        awk_ins_bcht_ins:
            `CREATE TRIGGER IF not exists "awk_ins_bcht_ins" 
        AFTER INSERT ON "aawak" 
        FOR EACH ROW   
        WHEN NOT EXISTS(select _id from bachat where mm_id = NEW.mm_id AND item_id = NEW.item_id AND dept_id = NEW.dept_id AND (NEW.subitem_id IS NULL OR subitem_id = NEW.subitem_id) AND unit_id = NEW.unit_id)  
        BEGIN
          insert or ignore into bachat(mm_id,item_id,subitem_id, Stock, New, Old, Defective, Repairing, Scrap, unit_id, dept_id) 
          values(NEW.mm_id, NEW.item_id, NEW.subitem_id, NEW.qty, (CASE WHEN NEW.condition_id = 33 THEN NEW.qty ELSE 0 END), (CASE WHEN NEW.condition_id = 34 THEN NEW.qty ELSE 0 END), (CASE WHEN NEW.condition_id = 35 THEN NEW.qty ELSE 0 END), (CASE WHEN (select list_name_eng from support_list where _id = NEW.condition_id) LIKE '%Repairing%' THEN NEW.qty ELSE 0 END), (CASE WHEN NEW.condition_id = 36 THEN NEW.qty ELSE 0 END), NEW.unit_id, NEW.dept_id);             
        END;`,

        awk_updt_bcht_updt:
            `CREATE TRIGGER IF NOT EXISTS "awk_updt_bcht_updt"
          AFTER UPDATE ON "aawak"
          FOR EACH ROW
          BEGIN
              update bachat set 
              Stock = Stock + (NEW.qty - OLD.qty),
              New = New + (CASE WHEN NEW.condition_id = 33 THEN NEW.qty ELSE 0 END) - (CASE WHEN OLD.condition_id = 33 THEN OLD.qty ELSE 0 END),
              Old = Old + (CASE WHEN NEW.condition_id = 34 THEN NEW.qty ELSE 0 END) - (CASE WHEN OLD.condition_id = 34 THEN OLD.qty ELSE 0 END),
              Defective = Defective + (CASE WHEN NEW.condition_id = 35 THEN NEW.qty ELSE 0 END) - (CASE WHEN OLD.condition_id = 35 THEN OLD.qty ELSE 0 END),
              Repairing = Repairing + (CASE WHEN (select list_name_eng from support_list where _id = NEW.condition_id) LIKE '%Repairing%' THEN NEW.qty ELSE 0 END) - (CASE WHEN (select list_name_eng from support_list where _id = OLD.condition_id) LIKE '%Repairing%' THEN OLD.qty ELSE 0 END),
              Scrap = Scrap + (CASE WHEN NEW.condition_id = 36 THEN NEW.qty ELSE 0 END) - (CASE WHEN OLD.condition_id = 36 THEN OLD.qty ELSE 0 END)
              where mm_id = NEW.mm_id AND item_id = NEW.item_id AND dept_id = NEW.dept_id AND (NEW.subitem_id IS NULL OR subitem_id = NEW.subitem_id) AND unit_id = NEW.unit_id;  
              
          END;`,

        awk_del_bcht_updt:
            `CREATE TRIGGER IF NOT EXISTS "awk_del_bcht_updt" 
          AFTER DELETE ON "aawak" 
          FOR EACH ROW
          BEGIN
            update bachat set 
            Stock = Stock - OLD.qty,
            New = New - (CASE WHEN OLD.condition_id = 33 THEN OLD.qty ELSE 0 END),
            Old = Old - (CASE WHEN OLD.condition_id = 34 THEN OLD.qty ELSE 0 END),
            Defective = Defective - (CASE WHEN OLD.condition_id = 35 THEN OLD.qty ELSE 0 END),
            Repairing = Repairing - (CASE WHEN (select list_name_eng from support_list where _id = OLD.condition_id) LIKE '%Repairing%' THEN OLD.qty ELSE 0 END),
            Scrap = Scrap - (CASE WHEN OLD.condition_id = 36 THEN OLD.qty ELSE 0 END)
            where mm_id = OLD.mm_id AND item_id = OLD.item_id AND dept_id = OLD.dept_id AND (OLD.subitem_id IS NULL OR subitem_id = OLD.subitem_id) AND unit_id = OLD.unit_id;                       
          END;`,

        jwk_ins_bcht_updt:
            `CREATE TRIGGER IF not exists "jwk_ins_bcht_updt" 
          AFTER INSERT ON "jawak" 
          FOR EACH ROW        
          BEGIN
            update bachat set 
            Stock = Stock - NEW.qty,
            Used = Used + (CASE WHEN NEW.jawak_type_id = 27 THEN NEW.qty ELSE 0 END),
            New = New - (CASE WHEN NEW.condition_id = 33 THEN NEW.qty ELSE 0 END),
            Old = Old - (CASE WHEN NEW.condition_id = 34 THEN NEW.qty ELSE 0 END),
            Defective = Defective - (CASE WHEN NEW.condition_id = 35 THEN NEW.qty ELSE 0 END),
            Repairing = Repairing - (CASE WHEN (select list_name_eng from support_list where _id = NEW.condition_id) LIKE '%Repairing%' THEN NEW.qty ELSE 0 END),
            Scrap = Scrap - (CASE WHEN NEW.condition_id = 36 THEN NEW.qty ELSE 0 END)
            where mm_id = NEW.mm_id AND item_id = NEW.item_id AND dept_id = NEW.dept_id AND (NEW.subitem_id IS NULL OR subitem_id = NEW.subitem_id) AND unit_id = NEW.unit_id; 
  
          END;`,

        jwk_updt_bcht_updt:
            `CREATE TRIGGER IF not exists "jwk_updt_bcht_updt" 
          AFTER UPDATE ON "jawak" 
          FOR EACH ROW        
          BEGIN
            update bachat set 
            Stock = Stock - (NEW.qty - OLD.qty),
            Used = Used + (CASE WHEN NEW.jawak_type_id = 27 THEN NEW.qty ELSE 0 END) - (CASE WHEN OLD.jawak_type_id = 27 THEN OLD.qty ELSE 0 END),
            New = New - (CASE WHEN NEW.condition_id = 33 THEN NEW.qty ELSE 0 END) + (CASE WHEN OLD.condition_id = 33 THEN OLD.qty ELSE 0 END),
            Old = Old - (CASE WHEN NEW.condition_id = 34 THEN NEW.qty ELSE 0 END) + (CASE WHEN OLD.condition_id = 34 THEN OLD.qty ELSE 0 END),
            Defective = Defective - (CASE WHEN NEW.condition_id = 35 THEN NEW.qty ELSE 0 END) + (CASE WHEN OLD.condition_id = 35 THEN OLD.qty ELSE 0 END),
            Repairing = Repairing - (CASE WHEN (select list_name_eng from support_list where _id = NEW.condition_id) LIKE '%Repairing%' THEN NEW.qty ELSE 0 END) + (CASE WHEN (select list_name_eng from support_list where _id = OLD.condition_id) LIKE '%Repairing%' THEN OLD.qty ELSE 0 END),
            Scrap = Scrap - (CASE WHEN NEW.condition_id = 36 THEN NEW.qty ELSE 0 END) + (CASE WHEN OLD.condition_id = 36 THEN OLD.qty ELSE 0 END)
            where mm_id = NEW.mm_id AND item_id = NEW.item_id AND dept_id = NEW.dept_id AND (NEW.subitem_id IS NULL OR subitem_id = NEW.subitem_id) AND unit_id = NEW.unit_id; 
  
          END;`,

        jwk_del_bcht_updt:
            `CREATE TRIGGER IF not exists "jwk_del_bcht_updt" 
          AFTER DELETE ON "jawak" 
          FOR EACH ROW
          BEGIN
            update bachat set 
            Stock = Stock + OLD.qty,
            Used = Used - (CASE WHEN OLD.jawak_type_id = 27 THEN OLD.qty ELSE 0 END),
            New = New + (CASE WHEN OLD.condition_id = 33 THEN OLD.qty ELSE 0 END),
            Old = Old + (CASE WHEN OLD.condition_id = 34 THEN OLD.qty ELSE 0 END),
            Defective = Defective + (CASE WHEN OLD.condition_id = 35 THEN OLD.qty ELSE 0 END),
            Repairing = Repairing + (CASE WHEN (select list_name_eng from support_list where _id = OLD.condition_id) LIKE '%Repairing%' THEN OLD.qty ELSE 0 END),
            Scrap = Scrap + (CASE WHEN OLD.condition_id = 36 THEN OLD.qty ELSE 0 END)
            where mm_id = OLD.mm_id AND item_id = OLD.item_id AND dept_id = OLD.dept_id AND (OLD.subitem_id IS NULL OR subitem_id = OLD.subitem_id) AND unit_id = OLD.unit_id;  
          END;`,

        prdct_ins_bcht_updt:
            `CREATE TRIGGER IF NOT EXISTS "prdct_ins_bcht_updt"
          AFTER INSERT ON "product"
          FOR EACH ROW
          BEGIN 
            update bachat set 
            Stock = Stock + 1,
            New = New + (CASE WHEN NEW.condition_id = 33 THEN 1 ELSE 0 END),
            Old = Old + (CASE WHEN NEW.condition_id = 34 THEN 1 ELSE 0 END),
            Defective = Defective + (CASE WHEN NEW.condition_id = 35 THEN 1 ELSE 0 END),
            Repairing = Repairing + (CASE WHEN (select list_name_eng from support_list where _id = NEW.condition_id) LIKE '%Repairing%' THEN 1 ELSE 0 END),
            Scrap = Scrap + (CASE WHEN NEW.condition_id = 36 THEN 1 ELSE 0 END)
            where mm_id = NEW.mm_id AND item_id = NEW.item_id AND dept_id = NEW.dept_id AND (NEW.subitem_id IS NULL OR subitem_id = NEW.subitem_id) AND unit_id = 1; 
  
            insert or ignore into bachat(mm_id,item_id,subitem_id, Stock, unit_id, dept_id) 
            values(NEW.mm_id, NEW.item_id, NEW.subitem_id, 1, 1, NEW.dept_id);            
          END;`,

        prdct_updt_bcht_updt:
            `CREATE TRIGGER IF NOT EXISTS "prdct_updt_bcht_updt"
          AFTER UPDATE ON "product"
          FOR EACH ROW
          WHEN OLD.condition_id != NEW.condition_id
          BEGIN 
            update bachat set 
            New = New + (CASE WHEN NEW.condition_id = 33 THEN 1 ELSE 0 END) - (CASE WHEN OLD.condition_id = 33 THEN 1 ELSE 0 END),
            Old = Old + (CASE WHEN NEW.condition_id = 34 THEN 1 ELSE 0 END) - (CASE WHEN OLD.condition_id = 33 THEN 1 ELSE 0 END),
            Defective = Defective + (CASE WHEN NEW.condition_id = 35 THEN 1 ELSE 0 END) - (CASE WHEN OLD.condition_id = 33 THEN 1 ELSE 0 END),
            Repairing = Repairing + (CASE WHEN (select list_name_eng from support_list where _id = NEW.condition_id) LIKE '%Repairing%' THEN 1 ELSE 0 END) - (CASE WHEN (select list_name_eng from support_list where _id = OLD.condition_id) LIKE '%Repairing%' THEN 1 ELSE 0 END),
            Scrap = Scrap + (CASE WHEN NEW.condition_id = 36 THEN 1 ELSE 0 END) - (CASE WHEN OLD.condition_id = 33 THEN 1 ELSE 0 END)
            where mm_id = NEW.mm_id AND item_id = NEW.item_id AND dept_id = NEW.dept_id AND (OLD.subitem_id IS NULL OR subitem_id = NEW.subitem_id) AND unit_id = 1;           
          END;`,

        prdct_del_bcht_updt:
            `CREATE TRIGGER IF NOT EXISTS "prdct_del_bcht_updt"
          AFTER DELETE ON "product"
          FOR EACH ROW        
          BEGIN 
            update bachat set 
            Stock = Stock - 1,
            New = New - (CASE WHEN OLD.condition_id = 33 THEN 1 ELSE 0 END),
            Old = Old - (CASE WHEN OLD.condition_id = 34 THEN 1 ELSE 0 END),
            Defective = Defective - (CASE WHEN OLD.condition_id = 35 THEN 1 ELSE 0 END),
            Repairing = Repairing - (CASE WHEN (select list_name_eng from support_list where _id = OLD.condition_id) LIKE '%Repairing%' THEN 1 ELSE 0 END),
            Scrap = Scrap - (CASE WHEN OLD.condition_id = 36 THEN 1 ELSE 0 END)
            where mm_id = OLD.mm_id AND item_id = OLD.item_id AND dept_id = OLD.dept_id AND (OLD.subitem_id IS NULL OR subitem_id = OLD.subitem_id) AND unit_id = 1;  
          END;`,

        jwk_del_updt_ref_awk:
            `CREATE TRIGGER IF not exists "jwk_del_updt_ref_awk" 
          AFTER DELETE ON "jawak" 
          FOR EACH ROW
          When OLD.aawak_ref_id IS NOT NULL
          BEGIN
            update aawak set remaining_qty = remaining_qty + OLD.qty where _id = OLD.aawak_ref_id;     
          END;`,

        jwk_ins_avk_ref_updt:
            `CREATE TRIGGER if not EXISTS "jwk_ins_avk_ref_updt"
          AFTER INSERT ON "jawak"
          FOR EACH ROW
          when NEW.aawak_ref_id is not NULL
          BEGIN
              update aawak set remaining_qty = remaining_qty - NEW.qty where _id = NEW.aawak_ref_id;
          END;`,

        jwk_updt_avk_ref_updt:
            `CREATE TRIGGER if not EXISTS "jwk_updt_avk_ref_updt"
          AFTER UPDATE ON "jawak"
          FOR EACH ROW
          when OLD.aawak_ref_id is not NULL
          BEGIN
              update aawak set remaining_qty = remaining_qty - (NEW.qty - OLD.qty) where _id = OLD.aawak_ref_id;
          END;`,

        awk_ins_bcht_ins:
            `CREATE TRIGGER IF not exists "awk_ins_bcht_ins" 
          AFTER INSERT ON "aawak" 
          FOR EACH ROW   
          WHEN NOT EXISTS(select _id from bachat where mm_id = NEW.mm_id AND item_id = NEW.item_id AND dept_id = NEW.dept_id AND (NEW.subitem_id IS NULL OR subitem_id = NEW.subitem_id) AND unit_id = NEW.unit_id)  
          BEGIN
            insert or ignore into bachat(mm_id,item_id,subitem_id, Stock, New, Old, Defective, Repairing, Scrap, unit_id, dept_id) 
            values(NEW.mm_id, NEW.item_id, NEW.subitem_id, NEW.qty, (CASE WHEN NEW.condition_id = 33 THEN NEW.qty ELSE 0 END), (CASE WHEN NEW.condition_id = 34 THEN NEW.qty ELSE 0 END), (CASE WHEN NEW.condition_id = 35 THEN NEW.qty ELSE 0 END), (CASE WHEN (select list_name_eng from support_list where _id = NEW.condition_id) LIKE '%Repairing%' THEN NEW.qty ELSE 0 END), (CASE WHEN NEW.condition_id = 36 THEN NEW.qty ELSE 0 END), NEW.unit_id, NEW.dept_id);             
          END;`
    },
    //recreating aawak, jawak, mm table to drop unneccesory column
    {
        drop_dept_ins_config_ins:`DROP TRIGGER IF EXISTS "dept_ins_config_ins"`,
        dept_ins_config_ins:
            `CREATE TRIGGER IF NOT EXISTS "dept_ins_config_ins"
          AFTER INSERT ON "department"
          FOR EACH ROW 
          BEGIN
            insert into department_config(dept_id, config_key, config_value, active) values(NEW._id, 'mm', '', NEW.active),(NEW._id, 'item', '', NEW.active),(NEW._id, 'category', '', NEW.active), (NEW._id, 'subitem', '', NEW.active), (NEW._id, 'subitem_list', '', NEW.active),(NEW._id, 'pbk', '', NEW.active),(NEW._id, 'department', '', NEW.active),(NEW._id, 'aj_type', '', NEW.active), (NEW._id, 'nimitt', '', NEW.active), (NEW._id, 'settings', json('{}'), NEW.active);
          END;`,

        aawak_rename: `alter table aawak rename to aawak_backup`,
        jawak_rename: `alter table jawak rename to jawak_backup`,
        mm_rename: `alter table mm rename to mm_backup`,
        mm: `create table mm(
            _id integer UNIQUE primary key AUTOINCREMENT,
            mm_hin varchar(100) not null,
            mm_eng varchar(100) null, 
            mm_roman varchar(100) null, 
            mm_code varchar(50) unique null, 
            dept_id integer null references department(_id),
            state_id integer not null references state(_id),
            parent_mm_id integer null REFERENCES mm(_id),
            opening_date date null,
            nimitt_id integer REFERENCES nimitt(_id),
            active tinyint default 0,  
            created_at timestamp default (datetime('now', 'localtime')),
            updated_at timestamp default (datetime('now', 'localtime')),
            unique(mm_eng,dept_id),
            unique(mm_hin,dept_id)
          );`,
        aawak: `create table aawak(
            _id integer UNIQUE primary key AUTOINCREMENT,
            date date not null,
            mm_id integer not null references mm(_id),
            pkt_num varchar(50) null,
            pbk_id integer null references pbk(_id),
            aawak_mm_id integer null references mm(_id),
            item_id integer not null references item(_id),
            subitem_id integer null references subitem(_id),
            product_id integer null references product(_id),
            item_detail text null,
            company_name varchar(100) null,
            condition_id integer null references support_list(_id),
            qty DECIMAL(10,2) not null,
            rate DECIMAL(10,2) null,
            actual_amt DECIMAL(10,2) null,
            aawak_type_id int not null references support_list(_id),
            unit_id integer not null references unit(_id),
            description text null,
            nimitt_id integer REFERENCES nimitt(_id),
            jawak_ref_ids text null,
            remaining_qty decimal(10,2) null,
            isbill tinyint(1) default 0,
            document json,
            hl tinyint default 0,
            active tinyint default 0,
            dept_id integer references department(_id),
            created_at timestamp default (datetime('now', 'localtime')),
            updated_at timestamp default (datetime('now', 'localtime')),
            unique(date,pkt_num,pbk_id,mm_id,item_id,subitem_id,product_id,condition_id,aawak_type_id,dept_id)
          );`,
        jawak: `create table jawak(
            _id integer UNIQUE primary key AUTOINCREMENT,
            date date not null,
            mm_id integer not null references mm(_id),
            pkt_num varchar(50) null,
            pbk_id integer null references pbk(_id),
            jawak_mm_id integer null references mm(_id),
            item_id integer not null references item(_id),
            subitem_id integer null references subitem(_id),
            product_id integer null references product(_id),
            item_detail text null,
            company_name varchar(100) null,
            condition_id integer null references support_list(_id),
            qty DECIMAL(10,2) not null,
            jawak_type_id int not null references support_list(_id),
            unit_id integer not null references unit(_id),
            description text null,
            nimitt_id integer REFERENCES nimitt(_id),
            aawak_ref_id integer null references aawak(_id) ON DELETE CASCADE,
            hl tinyint default 0,
            active tinyint default 0,
            dept_id integer references department(_id),
            created_at timestamp default (datetime('now', 'localtime')),
            updated_at timestamp default (datetime('now', 'localtime')),
            unique(date,pkt_num,pbk_id,mm_id,item_id,subitem_id,product_id,condition_id,jawak_type_id,dept_id)
          );`,

        mm_copy: `insert into mm(_id,mm_hin, mm_eng, mm_roman, mm_code, dept_id, state_id, parent_mm_id, opening_date, nimitt_id, active, created_at, updated_at) select _id,mm_hin, mm_eng, mm_roman, mm_code, dept_id, state_id, parent_mm_id, opening_date, nimitt_id, active, created_at, updated_at from mm_backup`,
        aawak_copy: `insert into aawak(_id, date, mm_id, pkt_num, pbk_id, aawak_mm_id, item_id, subitem_id, product_id, item_detail, company_name, condition_id, qty, rate, actual_amt, aawak_type_id, unit_id, description, nimitt_id, jawak_ref_ids, remaining_qty, isbill, document, hl, active, dept_id, created_at, updated_at) select _id, date, mm_id, pkt_num, pbk_id, aawak_mm_id, item_id, subitem_id, product_id, item_detail, company_name, condition_id, qty, rate, actual_amt, aawak_type_id, unit_id, description, nimitt_id, jawak_ref_ids, remaining_qty, isbill, document, hl, active, dept_id, created_at, updated_at from aawak_backup`,
        jawak_copy: `insert into jawak(_id, date, mm_id, pkt_num, pbk_id, jawak_mm_id, item_id, subitem_id, product_id, item_detail, company_name, condition_id, qty, jawak_type_id, unit_id, description, nimitt_id, aawak_ref_id, hl, active, dept_id, created_at, updated_at) select _id, date, mm_id, pkt_num, pbk_id, jawak_mm_id, item_id, subitem_id, product_id, item_detail, company_name, condition_id, qty, jawak_type_id, unit_id, description, nimitt_id, aawak_ref_id, hl, active, dept_id, created_at, updated_at from jawak_backup`,

        drop_jawak: `drop table if exists jawak_backup`,
        drop_aawak: `drop table if exists aawak_backup`,
        drop_mm: `drop table if exists mm_backup`,    
    }
  ];




module.exports = {
    Migrations, country, city, category, department, department_config, item, itemmix, aawak, bachat, jawak, mm, nimitt, pbk, point, product, state, subitem, subitem_list, support_list, temp_import, unit, genDeptDB
};