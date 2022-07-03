const db = require('../models/db.model').db;

const country = {
    select:
        `select * from country ?`
    , select_full:
        `select * from country ? order by @order limit @limit offset @offset`
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
        order by @order limit @limit offset @offset`
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
        `select * from category ? order by @order limit @limit offset @offset`
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
        active=@ative,
        updated_at=datetime('now','localtime')`
}

const department = {
    select:
        `select * from department ?`
    , select_full:
        `select * from department ? order by @order limit @limit offset @offset`
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
}

const department_config = {
    select:
        `select * from department_config ?`
    , select_full:
        `select * from department_config ? order by @order limit @limit offset @offset`
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
        left join unit on unit._id = item.unit_id ? order by @order limit @limit offset @offset`
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
    left join subitem_list sl on  sl._id = si.subitem_list_id ? group by item._id order by @order limit @limit offset @offset`,
    order: `item_hin, item_eng`,
    count: `select count(*) as total_count from item 
        left join subitem si on si.item_id = item._id ?
        group by item._id `
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
        left join state pst on pst._id = nmt.state_id ? order by @order limit @limit offset @offset`
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
        remaining_qty=@remaining_qty,
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
        left join state pst on pst._id = nmt.state_id ? order by @order limit @limit offset @offset`
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
        left join department dept on dept._id = bachat.dept_id ? order by @order limit @limit offset @offset`
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
        `select * from mm ? order by @order limit @limit offset @offset`
    , insert:
        `insert in to mm (
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
    , order:
        `mm_hin, mm_eng`
}

const nimitt = {
    select:
        `select * from nimitt ?`
    , select_full:
        `select * from nimitt ? order by @order limit @limit offset @offset`
    , insert:
        `insert in to nimitt (
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
        active=@active
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
        left join mm on mm._id = pbk.class_mm_id ? order by @order limit @limit offset @offset`
    , insert:
        `insert into pbk (
            roll_no,
            pbk_hin,	
            pbk_eng,
            gender,
            relation,
            relative_name,
            relative_ref,
            birth_date,
            age,
            status,
            address,
            townarea,
            state_id,
            city_id,
            mo_no,
            alt_mo_no,
            class_mm_id,
            bhatti_date,
            document,
            active)
        values (
            @roll_no,
            @pbk_hin,
            @pbk_eng,
            @gender,
            @relation,
            @relative_name,
            @relative_ref,
            @birth_date,
            @age,
            @status,
            @address,
            @townarea,
            @state_id,
            @city_id,
            @mo_no,
            @alt_mo_no,
            @class_mm_id,
            @bhatti_date,
            @document,
            @active)`
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
    , order:
        `roll_no`
}

const point = {
    select:
        `select * from point ?`
    , select_full:
        `select * from point ? order by @order limit @limit offset @offset`
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
        order by @order limit @limit offset @offset`
    , insert:
        `insert into product (
        mm_id,
        purchased_by,
        purchase_date,
        item_id,
        subitem_id,
        product_code,
        company_name,
        model_name,
        sr_num,
        condition_id,
        price,
        product_detail,
        accessories,
        purchase_from,
        warranty_period,
        dept_id,
        warranty_from,
        document,
        isbill,
        active)
    values (
        @mm_id,
        @purchased_by,
        @purchase_date,
        @item_id,
        @subitem_id,
        @product_code,
        @company_name,
        @model_name,
        @sr_num,
        @condition_id,
        @price,
        @product_detail,
        @accessories,
        @purchase_from,
        @warranty_period,
        @dept_id,
        @warranty_from,
        @document,
        @isbill,
        @active)`
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
        left join country cnt on cnt._id = state.country_id  ? order by @order limit @limit offset @offset`
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
        left join subitem_list on  subitem_list._id = subitem.subitem_list_id ? order by @order limit @limit offset @offset`
    , insert:
        `insert into subitem (
        item_id,
        subitem_list_id,
        category_id,
        unit_id,
        extra_note,
        document,
        active)
    values (
        @item_id,
        @subitem_list_id,
        @category_id,
        @unit_id,
        @extra_note,
        @document,
        @active)`
    , update:
        `update subitem set 
        item_id=@item_id,
        subitem_list_id=@subitem_list_id,
        category_id=@category_id,
        unit_id=@unit_id,
        extra_note=@extra_note,
        document=@document,
        updated_at=datetime('now','localtime')`
    , order:
        `subitem_hin, subitem_eng`
}

const subitem_list = {
    select:
        `select * from subitem_list ?`
    , select_full:
        `select * from subitem_list ? order by @order limit @limit offset @offset`
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
        `select * from support_list ? order by @order limit @limit offset @offset`
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
    , order:
        ``
}

const temp_import = {
    select:
        `select * from temp_import ?`
    , select_full:
        `select * from temp_import ? order by @order limit @limit offset @offset`
    , insert:
        `insert into temp_import (
        type,
        date,
        pkt_num,
        item_detail,
        qty,
        rate,
        actula_amt,
        company_name,
        description,
        isbill,
        document,
        mm,
        mm_id,
        pbk,
        pbk_id,
        aj_mm,
        aj_mm_id,
        item,
        item_id,
        subitem,
        subitem_id,
        product,
        product_id,
        condition,
        condition_id,
        unit,
        unit_id,
        aj_type,
        aj_type_id,
        nimitt,
        nimitt_id,
        dept,
        dept_id,
        ref_id,
        active)
    values (
        @type,
        @date,
        @pkt_num,
        @item_detail,
        @qty,
        @rate,
        @actula_amt,
        @company_name,
        @description,
        @isbill,
        @document,
        @mm,
        @mm_id,
        @pbk,
        @pbk_id,
        @aj_mm,
        @aj_mm_id,
        @item,
        @item_id,
        @subitem,
        @subitem_id,
        @product,
        @product_id,
        @condition,
        @condition_id,
        @unit,
        @unit_id,
        @aj_type,
        @aj_type_id,
        @nimitt,
        @nimitt_id,
        @dept,
        @dept_id,
        @ref_id,
        @active)`
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
        `select * from unit ? order by @order limit @limit offset @offset`
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






module.exports = {
    country, city, category, department, department_config, item, itemmix, aawak, bachat, jawak, mm, nimitt, pbk, point, product, state, subitem, subitem_list, support_list, temp_import, unit
};