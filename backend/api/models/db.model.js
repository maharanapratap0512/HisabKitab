const { version } = require('os');
let path = require('path');

class dbModal {
  // path;
  db;
  query;
  Migrations = [
    // version: 1
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
    // version: 2
    /* changes
      => drop all triggers
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
    // version: 3
    //recreating aawak, jawak, mm table to drop unneccesory column
    {
      drop_dept_ins_config_ins: `DROP TRIGGER IF EXISTS "dept_ins_config_ins"`,
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
              mm_id integer not null references mm(_id) ON UPDATE CASCADE,
              pkt_num varchar(50) null,
              pbk_id integer null references pbk(_id) ON UPDATE CASCADE,
              aawak_mm_id integer null references mm(_id) ON UPDATE CASCADE,
              item_id integer not null references item(_id) ON UPDATE CASCADE,
              subitem_id integer null references subitem(_id) ON UPDATE CASCADE,
              product_id integer null references product(_id) ON UPDATE CASCADE,
              item_detail text null,
              company_name varchar(100) null,
              condition_id integer null references support_list(_id) ON UPDATE CASCADE,
              qty DECIMAL(10,2) not null,
              rate DECIMAL(10,2) null,
              actual_amt DECIMAL(10,2) null,
              aawak_type_id int not null references support_list(_id) ON UPDATE CASCADE,
              unit_id integer not null references unit(_id) ON UPDATE CASCADE,
              description text null,
              nimitt_id integer REFERENCES nimitt(_id) ON UPDATE CASCADE,
              jawak_ref_ids text null,
              remaining_qty decimal(10,2) null,
              isbill tinyint(1) default 0,
              document json,
              hl tinyint default 0,
              active tinyint default 0,
              dept_id integer references department(_id) ON UPDATE CASCADE,
              created_at timestamp default (datetime('now', 'localtime')),
              updated_at timestamp default (datetime('now', 'localtime')),
              unique(date,pkt_num,pbk_id,mm_id,item_id,subitem_id,product_id,condition_id,aawak_type_id,dept_id)
            );`,
      jawak: `create table jawak(
              _id integer UNIQUE primary key AUTOINCREMENT,
              date date not null,
              mm_id integer not null references mm(_id) ON UPDATE CASCADE,
              pkt_num varchar(50) null,
              pbk_id integer null references pbk(_id) ON UPDATE CASCADE,
              jawak_mm_id integer null references mm(_id) ON UPDATE CASCADE,
              item_id integer not null references item(_id) ON UPDATE CASCADE,
              subitem_id integer null references subitem(_id) ON UPDATE CASCADE,
              product_id integer null references product(_id) ON UPDATE CASCADE,
              item_detail text null,
              company_name varchar(100) null,
              condition_id integer null references support_list(_id) ON UPDATE CASCADE,
              qty DECIMAL(10,2) not null,
              jawak_type_id int not null references support_list(_id) ON UPDATE CASCADE,
              unit_id integer not null references unit(_id) ON UPDATE CASCADE,
              description text null,
              nimitt_id integer REFERENCES nimitt(_id) ON UPDATE CASCADE,
              aawak_ref_id integer null references aawak(_id) ON DELETE CASCADE,
              hl tinyint default 0,
              active tinyint default 0,
              dept_id integer references department(_id) ON UPDATE CASCADE,
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
    },
    // version: 4
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
    // version: 5
    //recreating temp import table, dictionary and merge_history table
    {
      drop_temp_import: `drop table IF EXISTS temp_import`,
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
          nimitt varchar(150),
          nimitt_id integer,
          dept varchar(100),
          dept_id integer,          
          jawak_detail json
    
        )`,
      drop_dictionary: `DROP table IF EXISTS dictionary`,
      dictionary: `create table IF NOT EXISTS dictionary(
          _id integer primary key AUTOINCREMENT,
          type varchar(50) not null,
          name text not null,
          extra_note text,	
          id integer not null,
          id2 int
          created_at timestamp default (datetime('now', 'localtime')),
          unique(type,name)
        )`,
      drop_merge_history: `DROP table IF EXISTS merge_history`,
      merge_history: `create table IF NOT EXISTS merge_history(
          _id integer primary key AUTOINCREMENT,
          type varchar(50) not null,
          dept_id int not null,
          old_id int not null,          	
          new_id integer not null,
          note text,
          created_at timestamp default (datetime('now', 'localtime')),
          unique(type, dept_id, old_id, new_id)
        )`,

    },
    // version: 6
    // add active in dictionary, merge_history
    {
      add_active_dict: `alter table dictionary Add column active tinyint default 0`,
      add_active_merge_history: `alter table merge_history Add column active tinyint default 0`,
    },
    //version: 7
    /* 
      => multiple category support to item & subitem, recreate both table
      => config_value in department_config change to type json, recreate department_config table
    */
    {
      rename_item: `alter table item rename to item_backup`,
      rename_subitem: `alter table subitem rename to subitem_backup`,
      rename_department_config: `alter table department_config rename to department_config_backup`,
      drop_item: `drop table if exists item`,
      drop_subitem: `drop table if exists subitem`,
      drop_department_config: `drop table if exists department_config`,
      create_item: `create table item(
        _id integer UNIQUE primary key AUTOINCREMENT,
        item_hin varchar(150) unique not null,
        item_eng varchar(150) unique null,
        item_roman varchar(150) null,
        item_code varchar(50) unique null, 
        categories json not null,
        unit_id integer null REFERENCES unit(_id),
        extra_note text,
        document json,
        active tinyint default 0,    
        created_at timestamp default (datetime('now', 'localtime')),
        updated_at timestamp default (datetime('now', 'localtime'))
      );`,
      create_subitem: `create table subitem(
        _id integer UNIQUE primary key AUTOINCREMENT,
        item_id integer not null REFERENCES item(_id),
        subitem_list_id integer not null REFERENCES subitem_list(_id),
        categories json not null,
        unit_id integer null REFERENCES unit(_id),
        extra_note text,
        document json,
        active tinyint default 0,    
        created_at timestamp default (datetime('now', 'localtime')),
        updated_at timestamp default (datetime('now', 'localtime')),
        UNIQUE(item_id, subitem_list_id)
      );`,
      create_department_config: `create table department_config(
        _id integer unique primary key AUTOINCREMENT,
        dept_id integer not null references department(_id) ON DELETE CASCADE,
        config_key varchar(100) not null,
        config_value json,
        active tinyint default 0,
        created_at timestamp default (datetime('now', 'localtime')),
        updated_at timestamp default (datetime('now', 'localtime')),
        unique(dept_id, config_key)
      );`,
      insert_items: `insert into item(_id, item_hin, item_eng, item_roman, item_code, categories, unit_id, extra_note, document, active, created_at, updated_at) select _id, item_hin, item_eng, item_roman, item_code, json('[' || category_id || ']') as categories , unit_id, extra_note, document, active, created_at, updated_at from item_backup`,
      insert_subitems: `insert into subitem(_id, item_id, subitem_list_id, categories, unit_id, extra_note, document, active, created_at, updated_at) select _id, item_id, subitem_list_id, json('[' || category_id || ']') , unit_id, extra_note, document, active, created_at, updated_at from subitem_backup`,
      insert_config: `insert or ignore into department_config(_id, dept_id, config_key, config_value, active, created_at, updated_at) select _id, dept_id, CASE WHEN (config_key='dept') THEN 'department' ELSE config_key END, CASE WHEN (config_key='settings') THEN config_value ELSE json('[' || trim(rtrim(config_value,','), ',') || ']') END, active, created_at, updated_at from department_config_backup`,
      drop_dept_ins_config_ins: `DROP TRIGGER IF EXISTS "dept_ins_config_ins"`,
      dept_ins_config_ins:
        `CREATE TRIGGER IF NOT EXISTS "dept_ins_config_ins"
          AFTER INSERT ON "department"
          FOR EACH ROW 
          BEGIN
            insert into department_config(dept_id, config_key, config_value, active) values(NEW._id, 'mm', json('[]'), NEW.active),(NEW._id, 'item', json('[]'), NEW.active),(NEW._id, 'category', json('[]'), NEW.active), (NEW._id, 'subitem', json('[]'), NEW.active), (NEW._id, 'subitem_list', json('[]'), NEW.active),(NEW._id, 'pbk', json('[]'), NEW.active),(NEW._id, 'department', json('[]'), NEW.active),(NEW._id, 'aj_type', json('[]'), NEW.active), (NEW._id, 'settings', json('{}'), NEW.active), (NEW._id, 'nimitt', json('[]'), NEW.active);
          END;`,
      drop_item_backup: `drop table if exists item_backup`,
      drop_subitem_backup: `drop table if exists subitem_backup`,
      drop_department_config_backup: `drop table if exists department_config_backup`,
    },
    //version: 8
    /* 
      => Aawak - drop jawak_ref_ids and insert jawak_ref_id as integer
      => Product - recreating table and triggers
      => product_tracking - aawak, jawak of products.
      => recreating subitem to add ON delete cascade on item reference.
    */
    {
      // aawak_drop_jref: `ALTER TABLE aawak DROP COLUMN 'jawak_ref_ids'`,
      aawak_add_jref: `ALTER TABLE aawak ADD COLUMN jawak_ref_id int null REFERENCES jawak(_id) ON UPDATE CASCADE ON DELETE CASCADE`,
      subitem_rename: `ALTER TABLE subitem rename to subitem_backup`,
      subitem_recreate: `CREATE TABLE subitem(
        _id integer UNIQUE primary key AUTOINCREMENT,
        item_id integer not null REFERENCES item(_id) ON UPDATE CASCADE ON DELETE CASCADE,
        subitem_list_id integer not null REFERENCES subitem_list(_id),
        categories json not null,
        unit_id integer null REFERENCES unit(_id),
        extra_note text,
        document json,
        active tinyint default 0,    
        created_at timestamp default (datetime('now', 'localtime')),
        updated_at timestamp default (datetime('now', 'localtime')),
        UNIQUE(item_id, subitem_list_id)
        );`,
      transfer_data: `insert into subitem select * from subitem_backup`,
      drop_backup: `drop table if exists subitem_backup`,
      drop_product: `drop table if exists product`,
      product: `create table product(
        _id integer UNIQUE primary key AUTOINCREMENT,
        mm_id integer not null REFERENCES mm(_id),
        purchased_by varchar(200) null,
        purchase_date date null,
        item_id integer not null references item(_id) ON UPDATE CASCADE,
        subitem_id integer null references subitem(_id) ON UPDATE CASCADE,
        unit_id integer not null references unit(_id),
        product_code varchar(100) unique null,
        company_name varchar(100) null,
        model_name varchar(100) null,
        sr_num varchar(50) unique null,
        condition_id integer not null references support_list(_id),
        price numeric(10,2) null,
        product_detail text null,
        accessories text null,
        purchase_from text null,
        warranty_period int null,
        dept_id integer references department(_id),
        warranty_from varchar(100) null,
        document json,
        nimitt_id integer null REFERENCES nimitt(_id),
        isbill tinyint default 0,  
        active tinyint default 0,  
        hl tinyint default 0,
        last_date date,
        last_mm integer null REFERENCES mm(_id),
        last_condition integer REFERENCES support_list(_id),
        last_ref_id integer references product_tracking(_id),
        created_at timestamp default (datetime('now', 'localtime')),
        updated_at timestamp default (datetime('now', 'localtime'))
      );`,
      product_tracking: `create table if not exists product_tracking(
        _id integer UNIQUE primary key AUTOINCREMENT,
        product_id integer not null REFERENCES product(_id) ON UPDATE CASCADE ON DELETE CASCADE,
        date date not null,
        mm_id integer not null REFERENCES mm(_id),
        entry_type varchar(25) not null,
        aj_mm_id integer not null REFERENCES mm(_id),
        pkt_num varchar(25),
        nimitt_id integer REFERENCES nimitt(_id),
        old_condition_id integer,
        condition_id integer REFERENCES support_list(_id),
        transfer_detail text,
        repairing_ref integer REFERENCES product_repair(_id),
        hl tinyint default 0,
        active tinyint default 0,
        created_at timestamp default (datetime('now', 'localtime')),
        updated_at timestamp default (datetime('now', 'localtime'))      
      )`,
      product_repair: `create table if not exists product_repair(
        _id integer UNIQUE primary key AUTOINCREMENT,
        product_id integer not null REFERENCES product(_id) ON UPDATE CASCADE ON DELETE CASCADE,
        date date not null
      )`,
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
            where mm_id = NEW.mm_id AND item_id = NEW.item_id AND dept_id = NEW.dept_id AND (NEW.subitem_id IS NULL OR subitem_id = NEW.subitem_id) AND unit_id = NEW.unit_id; 

            insert or ignore into bachat(mm_id,item_id,subitem_id, Stock, New, Old, Defective, Repairing, Scrap, unit_id, dept_id) 
            values(NEW.mm_id, NEW.item_id, NEW.subitem_id, 1, (CASE WHEN NEW.condition_id = 33 THEN 1 ELSE 0 END), (CASE WHEN NEW.condition_id = 34 THEN 1 ELSE 0 END), (CASE WHEN NEW.condition_id = 35 THEN 1 ELSE 0 END), (CASE WHEN (select list_name_eng from support_list where _id = NEW.condition_id) LIKE '%Repairing%' THEN 1 ELSE 0 END), (CASE WHEN NEW.condition_id = 36 THEN 1 ELSE 0 END), NEW.unit_id, NEW.dept_id);             
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

      tracking_ins_jawak:
        `CREATE TRIGGER IF NOT EXISTS "tracking_ins_jawak"
          AFTER INSERT ON "product_tracking" 
          FOR EACH ROW
          WHEN NEW.entry_type = 'jwk' AND NEW.mm_id <> NEW.aj_mm_id
          BEGIN                         
            insert into product_tracking(product_id, date, mm_id, entry_type, aj_mm_id, pkt_num, condition_id, transfer_detail, hl) values(NEW.product_id, NEW.date, NEW.aj_mm_id, 'awk', NEW.mm_id, NEW.pkt_num, NEW.condition_id, NEW.transfer_detail, 1);            
          END;`,
      tracking_ins_aawak:
        `CREATE TRIGGER IF NOT EXISTS "tracking_ins_aawak"
          AFTER INSERT ON "product_tracking"
          FOR EACH ROW
          WHEN NEW.entry_type = 'awk'
          BEGIN                         
          update product set last_date = NEW.date, last_mm = NEW.mm_id, last_condition = NEW.condition_id, last_ref_id = NEW._id, hl = 1, updated_at = (datetime('now', 'localtime')) where _id = NEW.product_id AND (last_date IS NULL OR last_date <= NEW.date);           
          END;`,

    },
    //version: 9
    /*
      => Product - recreating table and triggers
      => drop product_tracking and repairing
     */
    {
      drop_product: `drop table if exists product`,
      product: `create table product(
          _id integer UNIQUE primary key AUTOINCREMENT,
          mm_id integer not null REFERENCES mm(_id),
          purchased_by varchar(200) null,
          purchase_date date null,
          item_id integer not null references item(_id) ON UPDATE CASCADE,
          subitem_id integer null references subitem(_id) ON UPDATE CASCADE,
          unit_id integer not null references unit(_id),
          product_code varchar(100) unique null,
          company_name varchar(100) null,
          model_name varchar(100) null,
          sr_num varchar(50) unique null,
          condition_id integer not null references support_list(_id),
          price numeric(10,2) null,
          product_detail text null,
          accessories text null,
          purchase_from text null,
          warranty_period int null,
          dept_id integer references department(_id),
          warranty_from varchar(100) null,
          document json,
          nimitt_id integer null REFERENCES nimitt(_id),
          isbill tinyint default 0,  
          active tinyint default 0,  
          hl tinyint default 0,
          last_date date,
          last_mm integer null REFERENCES mm(_id),
          last_condition integer REFERENCES support_list(_id),
          last_entry_type varchar(25),
          last_ref_id integer,
          created_at timestamp default (datetime('now', 'localtime')),
          updated_at timestamp default (datetime('now', 'localtime'))
        );`,
      drop_product_tracking: `drop table if exists product_tracking`,
      drop_product_repair: `drop table if exists product_repair`,
      drop_prdct_ins_bcht_updt: `DROP TRIGGER IF EXISTS "prdct_ins_bcht_updt"`,
      drop_prdct_updt_bcht_updt: `DROP TRIGGER IF EXISTS "prdct_updt_bcht_updt"`,
      prdct_del_bcht_updt: `DROP TRIGGER IF EXISTS "prdct_del_bcht_updt"`,
      drop_tracking_ins_jawak: `DROP TRIGGER IF EXISTS "tracking_ins_jawak"`,
      tracking_ins_aawak: `DROP TRIGGER IF EXISTS "tracking_ins_aawak"`,
      drop_awk_ins_bcht_updt:
        `DROP TRIGGER IF exists "awk_ins_bcht_updt"`,
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
                
                update product set 
                last_date = NEW.date,
                last_mm = NEW.mm_id,
                last_condition = NEW.condition_id,
                last_entry_type = 'awk',
                last_ref_id = NEW._id
                where _id = NEW.product_id AND (last_date IS NULL OR last_date <= NEW.date);
            END;`,
      drop_awk_ins_bcht_ins:
        `DROP TRIGGER IF exists "awk_ins_bcht_ins" `,
      awk_ins_bcht_ins:
        `CREATE TRIGGER IF not exists "awk_ins_bcht_ins" 
          AFTER INSERT ON "aawak" 
          FOR EACH ROW   
          WHEN NOT EXISTS(select _id from bachat where mm_id = NEW.mm_id AND item_id = NEW.item_id AND dept_id = NEW.dept_id AND (NEW.subitem_id IS NULL OR subitem_id = NEW.subitem_id) AND unit_id = NEW.unit_id)  
          BEGIN
            insert or ignore into bachat(mm_id,item_id,subitem_id, Stock, New, Old, Defective, Repairing, Scrap, unit_id, dept_id) 
            values(NEW.mm_id, NEW.item_id, NEW.subitem_id, NEW.qty, (CASE WHEN NEW.condition_id = 33 THEN NEW.qty ELSE 0 END), (CASE WHEN NEW.condition_id = 34 THEN NEW.qty ELSE 0 END), (CASE WHEN NEW.condition_id = 35 THEN NEW.qty ELSE 0 END), (CASE WHEN (select list_name_eng from support_list where _id = NEW.condition_id) LIKE '%Repairing%' THEN NEW.qty ELSE 0 END), (CASE WHEN NEW.condition_id = 36 THEN NEW.qty ELSE 0 END), NEW.unit_id, NEW.dept_id); 
            
            update product set 
            last_date = NEW.date,
            last_mm = NEW.mm_id,
            last_condition = NEW.condition_id,
            last_entry_type = 'awk',
            last_ref_id = NEW._id
            where _id = NEW.product_id AND (last_date IS NULL OR last_date <= NEW.date);
          END;`,
      awk_updt_bcht_updt:
        `DROP TRIGGER IF EXISTS "awk_updt_bcht_updt"`,
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

                update product set 
                last_date = NEW.date,
                last_mm = NEW.mm_id,
                last_condition = NEW.condition_id
                where _id = NEW.product_id AND last_ref_id = NEW._id;
                
            END;`,
      drop_awk_del_bcht_updt:
        `DROP TRIGGER IF EXISTS "awk_del_bcht_updt"`,
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
              Repairing = Repairing - (CASE WHEN(select list_name_eng from support_list where _id = OLD.condition_id) LIKE '%Repairing%' THEN OLD.qty ELSE 0 END),
              Scrap = Scrap - (CASE WHEN OLD.condition_id = 36 THEN OLD.qty ELSE 0 END)
              where mm_id = OLD.mm_id AND item_id = OLD.item_id AND dept_id = OLD.dept_id AND(OLD.subitem_id IS NULL OR subitem_id = OLD.subitem_id) AND unit_id = OLD.unit_id;

              update product set 
              last_entry_type = 'deleted',
              last_ref_id = null
              where _id = NEW.product_id AND last_ref_id = OLD._id;
            END; `,

      drop_jwk_ins_bcht_updt:
        `DROP TRIGGER IF exists "jwk_ins_bcht_updt" `,
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
              Repairing = Repairing - (CASE WHEN(select list_name_eng from support_list where _id = NEW.condition_id) LIKE '%Repairing%' THEN NEW.qty ELSE 0 END),
              Scrap = Scrap - (CASE WHEN NEW.condition_id = 36 THEN NEW.qty ELSE 0 END)
              where mm_id = NEW.mm_id AND item_id = NEW.item_id AND dept_id = NEW.dept_id AND(NEW.subitem_id IS NULL OR subitem_id = NEW.subitem_id) AND unit_id = NEW.unit_id;

              update product set 
              last_date = NEW.date,
              last_mm = NEW.jawak_mm_id,
              last_condition = NEW.condition_id,
              last_entry_type = 'jwk',
              last_ref_id = NEW._id
              where _id = NEW.product_id AND (last_date IS NULL OR last_date <= NEW.date);

            END; `,

      drop_jwk_updt_bcht_updt:
        `DROP TRIGGER IF exists "jwk_updt_bcht_updt"`,
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
              Repairing = Repairing - (CASE WHEN(select list_name_eng from support_list where _id = NEW.condition_id) LIKE '%Repairing%' THEN NEW.qty ELSE 0 END) + (CASE WHEN(select list_name_eng from support_list where _id = OLD.condition_id) LIKE '%Repairing%' THEN OLD.qty ELSE 0 END),
              Scrap = Scrap - (CASE WHEN NEW.condition_id = 36 THEN NEW.qty ELSE 0 END) + (CASE WHEN OLD.condition_id = 36 THEN OLD.qty ELSE 0 END)
              where mm_id = NEW.mm_id AND item_id = NEW.item_id AND dept_id = NEW.dept_id AND(NEW.subitem_id IS NULL OR subitem_id = NEW.subitem_id) AND unit_id = NEW.unit_id;

              update product set 
              last_date = NEW.date,
              last_mm = NEW.mm_id,
              last_condition = NEW.condition_id
              where _id = NEW.product_id AND last_ref_id = NEW._id;
            END; `,

      drop_jwk_del_bcht_updt:
        `DROP TRIGGER IF exists "jwk_del_bcht_updt" `,
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
              Repairing = Repairing + (CASE WHEN(select list_name_eng from support_list where _id = OLD.condition_id) LIKE '%Repairing%' THEN OLD.qty ELSE 0 END),
              Scrap = Scrap + (CASE WHEN OLD.condition_id = 36 THEN OLD.qty ELSE 0 END)
              where mm_id = OLD.mm_id AND item_id = OLD.item_id AND dept_id = OLD.dept_id AND(OLD.subitem_id IS NULL OR subitem_id = OLD.subitem_id) AND unit_id = OLD.unit_id;

              update product set 
              last_entry_type = 'deleted',
              last_ref_id = null
              where _id = NEW.product_id AND last_ref_id = OLD._id;
            END; `,

      drop_awk_ins_bcht_ins:
        `DROP TRIGGER IF exists "awk_ins_bcht_ins" `,
      awk_ins_bcht_ins:
        `CREATE TRIGGER IF not exists "awk_ins_bcht_ins" 
          AFTER INSERT ON "aawak" 
          FOR EACH ROW   
          WHEN NOT EXISTS(select _id from bachat where mm_id = NEW.mm_id AND item_id = NEW.item_id AND dept_id = NEW.dept_id AND(NEW.subitem_id IS NULL OR subitem_id = NEW.subitem_id) AND unit_id = NEW.unit_id)  
          BEGIN
            insert or ignore into bachat(mm_id, item_id, subitem_id, Stock, New, Old, Defective, Repairing, Scrap, unit_id, dept_id) 
            values(NEW.mm_id, NEW.item_id, NEW.subitem_id, NEW.qty, (CASE WHEN NEW.condition_id = 33 THEN NEW.qty ELSE 0 END), (CASE WHEN NEW.condition_id = 34 THEN NEW.qty ELSE 0 END), (CASE WHEN NEW.condition_id = 35 THEN NEW.qty ELSE 0 END), (CASE WHEN(select list_name_eng from support_list where _id = NEW.condition_id) LIKE '%Repairing%' THEN NEW.qty ELSE 0 END), (CASE WHEN NEW.condition_id = 36 THEN NEW.qty ELSE 0 END), NEW.unit_id, NEW.dept_id);

            update product set 
            last_date = NEW.date,
            last_mm = NEW.mm_id,
            last_condition = NEW.condition_id,
            last_entry_type = 'awk',
            last_ref_id = NEW._id
            where _id = NEW.product_id AND(last_date IS NULL OR last_date <= NEW.date);

          END; `
    },
    //v10
    {
      drop_awk_ins_bcht_ins:
        `DROP TRIGGER IF exists 'awk_ins_bcht_ins' `,
      drop_awk_ins_bcht_updt:
        `DROP TRIGGER IF exists 'awk_ins_bcht_updt'`,
      rename_bachat:
        `ALTER TABLE bachat RENAME TO 'old_bachat'`,
      rename_aawak:
        `ALTER TABLE aawak RENAME TO 'old_aawak'`,
      recreate_bachat:
        `create table IF NOT EXISTS bachat(
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
          Repairing decimal(10, 2) default 0,
          unit_id integer not null references unit(_id) ON DELETE CASCADE,
          dept_id integer not null references department(_id) ON DELETE CASCADE,
          active tinyint default 0,
          created_at timestamp default (strftime('%Y-%m-%d %H:%M:%f', 'now')),
          updated_at timestamp default (strftime('%Y-%m-%d %H:%M:%f', 'now')),
          unique(mm_id,item_id,unit_id,dept_id,subitem_id)
        );`,
      recreate_aawak:
        `CREATE TABLE aawak(
          _id integer UNIQUE primary key AUTOINCREMENT,
          date date not null,
          mm_id integer not null references mm(_id) ON UPDATE CASCADE,
          pkt_num varchar(50) null,
          pbk_id integer null references pbk(_id) ON UPDATE CASCADE,
          aawak_mm_id integer null references mm(_id) ON UPDATE CASCADE,
          item_id integer not null references item(_id) ON UPDATE CASCADE,
          subitem_id integer null references subitem(_id) ON UPDATE CASCADE,
          product_id integer null references product(_id) ON UPDATE CASCADE,
          item_detail text null,
          company_name varchar(100) null,
          condition_id integer null references support_list(_id) ON UPDATE CASCADE,
          qty DECIMAL(10,2) not null,
          rate DECIMAL(10,2) null,
          actual_amt DECIMAL(10,2) null,
          aawak_type_id int not null references support_list(_id) ON UPDATE CASCADE,
          unit_id integer not null references unit(_id) ON UPDATE CASCADE,
          description text null,
          nimitt_id integer REFERENCES nimitt(_id) ON UPDATE CASCADE,
          remaining_qty decimal(10,2) null,
          isbill tinyint(1) default 0,
          document json,
          hl tinyint default 0,
          active tinyint default 0,
          dept_id integer references department(_id) ON UPDATE CASCADE,          
          updated_at timestamp default (strftime('%Y-%m-%d %H:%M:%f', 'now')), 
          created_at timestamp default (strftime('%Y-%m-%d %H:%M:%f', 'now')),
          unique(date,pkt_num,pbk_id,mm_id,item_id,subitem_id,product_id,condition_id,aawak_type_id,dept_id)
        );`,
      copy_awk:
        `insert into aawak(_id, date, mm_id, pkt_num, pbk_id, aawak_mm_id, item_id, subitem_id, product_id, item_detail, company_name, condition_id, qty, rate, actual_amt, aawak_type_id, unit_id, description, nimitt_id, remaining_qty, isbill, document, hl, active, dept_id, created_at, updated_at) select _id, date, mm_id, pkt_num, pbk_id, aawak_mm_id, item_id, subitem_id, product_id, item_detail, company_name, condition_id, qty, rate, actual_amt, aawak_type_id, unit_id, description, nimitt_id, remaining_qty, isbill, document, hl, active, dept_id, created_at, updated_at from old_aawak`,
      copy_bcht:
        `insert into bachat(_id, mm_id, item_id, subitem_id, Stock, Used, New, Old, Defective, Scrap, Repairing, unit_id, dept_id, active, created_at, updated_at) select _id, mm_id, item_id, subitem_id, Stock, Used, New, Old, Defective, Scrap, Repairing, unit_id, dept_id, active, created_at, updated_at from old_bachat`,
      drop_old_aawak:
        `drop table if exists 'old_aawak'`,
      drop_old_bachat:
        `drop table if exists 'old_bachat'`,
      awk_ins_bcht_ins:
        `CREATE TRIGGER IF not exists "awk_ins_bcht_ins" 
        AFTER INSERT ON "aawak" 
        FOR EACH ROW
        WHEN NOT EXISTS(select _id from bachat where mm_id = NEW.mm_id AND item_id = NEW.item_id AND dept_id = NEW.dept_id AND IFNULL(subitem_id, 0) = IFNULL(NEW.subitem_id, 0) AND unit_id = NEW.unit_id)  
        BEGIN
          insert or ignore into bachat(mm_id, item_id, subitem_id, Stock, New, Old, Defective, Repairing, Scrap, unit_id, dept_id) 
          values(NEW.mm_id, NEW.item_id, NEW.subitem_id, NEW.qty, (CASE WHEN NEW.condition_id = 33 THEN NEW.qty ELSE 0 END), (CASE WHEN NEW.condition_id = 34 THEN NEW.qty ELSE 0 END), (CASE WHEN NEW.condition_id = 35 THEN NEW.qty ELSE 0 END), (CASE WHEN(select list_name_eng from support_list where _id = NEW.condition_id) LIKE '%Repairing%' THEN NEW.qty ELSE 0 END), (CASE WHEN NEW.condition_id = 36 THEN NEW.qty ELSE 0 END), NEW.unit_id, NEW.dept_id);

          update product set 
          last_date = NEW.date,
          last_mm = NEW.mm_id,
          last_condition = NEW.condition_id,
          last_entry_type = 'awk',
          last_ref_id = NEW._id
          where _id = NEW.product_id AND(last_date IS NULL OR last_date <= NEW.date);

        END; `,
      awk_ins_bcht_updt:
        `CREATE TRIGGER IF not exists "awk_ins_bcht_updt" 
        AFTER INSERT ON "aawak" 
        FOR EACH ROW     
        WHEN EXISTS(select _id from bachat where created_at != NEW.created_at AND mm_id = NEW.mm_id AND item_id = NEW.item_id AND dept_id = NEW.dept_id AND IFNULL(subitem_id, 0) = IFNULL(NEW.subitem_id, 0) AND unit_id = NEW.unit_id)  
        BEGIN
            update bachat set 
            Stock = Stock + NEW.qty,
            New = New + (CASE WHEN NEW.condition_id = 33 THEN NEW.qty ELSE 0 END),
            Old = Old + (CASE WHEN NEW.condition_id = 34 THEN NEW.qty ELSE 0 END),
            Defective = Defective + (CASE WHEN NEW.condition_id = 35 THEN NEW.qty ELSE 0 END),
            Repairing = Repairing + (CASE WHEN (select list_name_eng from support_list where _id = NEW.condition_id) LIKE '%Repairing%' THEN NEW.qty ELSE 0 END),
            Scrap = Scrap + (CASE WHEN NEW.condition_id = 36 THEN NEW.qty ELSE 0 END)
            where mm_id = NEW.mm_id AND item_id = NEW.item_id AND dept_id = NEW.dept_id AND IFNULL(subitem_id, 0) = IFNULL(NEW.subitem_id, 0) AND unit_id = NEW.unit_id;        
            
            update product set 
            last_date = NEW.date,
            last_mm = NEW.mm_id,
            last_condition = NEW.condition_id,
            last_entry_type = 'awk',
            last_ref_id = NEW._id
            where _id = NEW.product_id AND (last_date IS NULL OR last_date <= NEW.date);
        END;`,
      awk_updt_bcht_updt:
        `DROP TRIGGER IF EXISTS "awk_updt_bcht_updt"`,
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
            where mm_id = NEW.mm_id AND item_id = NEW.item_id AND dept_id = NEW.dept_id AND IFNULL(subitem_id, 0) = IFNULL(NEW.subitem_id, 0) AND unit_id = NEW.unit_id;  

            update product set 
            last_date = NEW.date,
            last_mm = NEW.mm_id,
            last_condition = NEW.condition_id
            where _id = NEW.product_id AND last_ref_id = NEW._id;
              
          END;`,

      drop_jwk_ins_bcht_updt:
        `DROP TRIGGER IF exists "jwk_ins_bcht_updt" `,
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
              Repairing = Repairing - (CASE WHEN(select list_name_eng from support_list where _id = NEW.condition_id) LIKE '%Repairing%' THEN NEW.qty ELSE 0 END),
              Scrap = Scrap - (CASE WHEN NEW.condition_id = 36 THEN NEW.qty ELSE 0 END)
              where mm_id = NEW.mm_id AND item_id = NEW.item_id AND dept_id = NEW.dept_id AND IFNULL(subitem_id, 0) = IFNULL(NEW.subitem_id, 0) AND unit_id = NEW.unit_id;

              update product set 
              last_date = NEW.date,
              last_mm = NEW.jawak_mm_id,
              last_condition = NEW.condition_id,
              last_entry_type = 'jwk',
              last_ref_id = NEW._id
              where _id = NEW.product_id AND (last_date IS NULL OR last_date <= NEW.date);

            END; `,

      drop_jwk_updt_bcht_updt:
        `DROP TRIGGER IF exists "jwk_updt_bcht_updt"`,
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
              Repairing = Repairing - (CASE WHEN(select list_name_eng from support_list where _id = NEW.condition_id) LIKE '%Repairing%' THEN NEW.qty ELSE 0 END) + (CASE WHEN(select list_name_eng from support_list where _id = OLD.condition_id) LIKE '%Repairing%' THEN OLD.qty ELSE 0 END),
              Scrap = Scrap - (CASE WHEN NEW.condition_id = 36 THEN NEW.qty ELSE 0 END) + (CASE WHEN OLD.condition_id = 36 THEN OLD.qty ELSE 0 END)
              where mm_id = NEW.mm_id AND item_id = NEW.item_id AND dept_id = NEW.dept_id AND IFNULL(subitem_id, 0) = IFNULL(NEW.subitem_id, 0) AND unit_id = NEW.unit_id;

              update product set 
              last_date = NEW.date,
              last_mm = NEW.mm_id,
              last_condition = NEW.condition_id
              where _id = NEW.product_id AND last_ref_id = NEW._id;
            END; `,

      drop_awk_del_bcht_updt:
        `DROP TRIGGER IF EXISTS "awk_del_bcht_updt"`,
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
            Repairing = Repairing - (CASE WHEN(select list_name_eng from support_list where _id = OLD.condition_id) LIKE '%Repairing%' THEN OLD.qty ELSE 0 END),
            Scrap = Scrap - (CASE WHEN OLD.condition_id = 36 THEN OLD.qty ELSE 0 END)
            where mm_id = OLD.mm_id AND item_id = OLD.item_id AND dept_id = OLD.dept_id AND IFNULL(subitem_id, 0) = IFNULL(OLD.subitem_id, 0) AND unit_id = OLD.unit_id;

            update product set 
            last_entry_type = 'deleted',
            last_ref_id = null
            where _id = OLD.product_id AND last_ref_id = OLD._id;
          END; `,
      drop_jwk_del_bcht_updt:
        `DROP TRIGGER IF exists "jwk_del_bcht_updt" `,
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
            Repairing = Repairing + (CASE WHEN(select list_name_eng from support_list where _id = OLD.condition_id) LIKE '%Repairing%' THEN OLD.qty ELSE 0 END),
            Scrap = Scrap + (CASE WHEN OLD.condition_id = 36 THEN OLD.qty ELSE 0 END)
            where mm_id = OLD.mm_id AND item_id = OLD.item_id AND dept_id = OLD.dept_id AND IFNULL(subitem_id, 0) = IFNULL(OLD.subitem_id, 0) AND unit_id = OLD.unit_id;

            update product set 
            last_entry_type = 'deleted',
            last_ref_id = null
            where _id = OLD.product_id AND last_ref_id = OLD._id;
          END; `,
    },
    //version: 11
    /*
      => Import History - new table for maintaining import data history.
      => Alter table item, subitem, mm - Add restrict_month and restrict_year columns. 
    */
    {
      import_history: `create table if not exists import_history(
        _id integer primary key AUTOINCREMENT,
        entry_date timestamp default (datetime('now', 'localtime')),
        mm_id integer not null references mm(_id),
        month integer not null,
        year integer not null,
        dept_id integer not null references department(_id),
        updated_at timestamp default (strftime('%Y-%m-%d %H:%M:%f', datetime('now', 'localtime'))),
        unique(mm_id, month, year, dept_id)
      )`,
      add_col_mon_item: `alter table item add column restrict_month integer null`,
      add_col_year_item: `alter table item add column restrict_year integer null`,
      add_col_mon_subitem: `alter table subitem add column restrict_month integer null`,
      add_col_year_subitem: `alter table subitem add column restrict_year integer null`,
      add_col_mon_mm: `alter table mm add column restrict_month integer null`,
      add_col_year_mm: `alter table mm add column restrict_year integer null`
    },
    //version 12
    /*
      => creating new table vehicle and vehicle_document
    */
    {
      vehicle: `create table if not exists vehicle(
        _id integer primary key AUTOINCREMENT,
        mm_id integer not null references mm(_id),
        vehicle_type varchar(100),
        gadi_name varchar(100),
        gadi_num varhcar(25) unique not null,
        fuel_type varchar(50),
        seating_capacity integer,
        owner_name varchar(100),
        nominee varchar(100),
        aawak_type varchar(50) not null,
        rc_date date,
        rc_exp_date date,
        rc_amount decimal(7, 2),
        insurance_date date,
        insurance_exp_date date,
        insurance_type varchar(25),
        insurance_company varchar(50),
        insurance_amount decimal(7, 2),
        puc_date date,
        puc_exp_date date,
        puc_amount decimal(7, 2),
        created_at timestamp default (UNIXEPOCH()),
        updated_at timestamp default (UNIXEPOCH()),
        unique(gadi_num)
        )`,
      vehicle_document: `create table if not exists vehicle_document(
        _id integer primary key AUTOINCREMENT,
        vehicle_id integer not null references vehicle(_id),
        gadi_num varhcar(25),
        doc_type varchar(25) not null,
        doc_date date,
        exp_date date not null,
        insurance_type varchar(25),
        amount decimal(7,2),
        created_at timestamp default (UNIXEPOCH())
      )`,
      vehicle_ins_doc_insert: `CREATE TRIGGER IF not exists "vehicle_ins_doc_ins" 
        AFTER INSERT ON "vehicle" 
        FOR EACH ROW        
        BEGIN
          insert or ignore into vehicle_document(vehicle_id, gadi_num, doc_type, doc_date, exp_date, amount) 
          values(NEW._id, NEW.gadi_num, 'rc', NEW.rc_date, NEW.rc_exp_date, NEW.rc_amount);
          insert or ignore into vehicle_document(vehicle_id, gadi_num, doc_type, doc_date, exp_date, insurance_type, amount) 
          values(NEW._id, NEW.gadi_num, 'insurance', NEW.insurance_date, NEW.insurance_exp_date, NEW.insurance_type, NEW.insurance_amount);
          insert or ignore into vehicle_document(vehicle_id, gadi_num, doc_type, doc_date, exp_date, amount) 
          values(NEW._id, NEW.gadi_num, 'puc', NEW.puc_date, NEW.puc_exp_date, NEW.puc_amount);
        END; `,
      vehicle_updt_doc_insert: `CREATE TRIGGER IF not exists "vehicle_updt_doc_ins" 
        AFTER UPDATE ON "vehicle" 
        FOR EACH ROW        
        BEGIN
          insert or ignore into vehicle_document(vehicle_id, gadi_num, doc_type, doc_date, exp_date, amount) 
          values(NEW._id, NEW.gadi_num, 'rc', NEW.rc_date, NEW.rc_exp_date, NEW.rc_amount);
          insert or ignore into vehicle_document(vehicle_id, gadi_num, doc_type, doc_date, exp_date, insurance_type, amount) 
          values(NEW._id, NEW.gadi_num, 'insurance', NEW.insurance_date, NEW.insurance_exp_date, NEW.insurance_type, NEW.insurance_amount);
          insert or ignore into vehicle_document(vehicle_id, gadi_num, doc_type, doc_date, exp_date, amount) 
          values(NEW._id, NEW.gadi_num, 'puc', NEW.puc_date, NEW.puc_exp_date, NEW.puc_amount);
        END; `,


    },
    // version13
    /*
      =>new table : bachat_history, closing
      =>settings transfer from department_config to department.
     */
    {
      closing: `create table if not exists closing(
        _id integer primary key AUTOINCREMENT,
        month int not null,
        year int not null,
        mm_id integer not null references mm(_id) ON UPDATE CASCADE ON DELETE CASCADE, 
        dept_id integer not null references dept(_id) ON UPDATE CASCADE ON DELETE CASCADE,
        closed tinyint(1) default 0,
        created_at timestamp default (UNIXEPOCH()),
        updated_at timestamp default (UNIXEPOCH()),
        unique(month, year, mm_id, dept_id)
      )`,
      item_dictionary: `create table if not exists item_dictionary(
        _id integer primary key AUTOINCREMENT,
        item_id integer not null references item(_id) ON UPDATE CASCADE ON DELETE CASCADE,
        subitem_id integer references subitem(_id) ON UPDATE CASCADE ON DELETE CASCADE,
        alt_name varchar(150) not null unique,
        updated_at timestamp default (UNIXEPOCH())
      )`,
      rel_item_category: `create table if not exists rel_item_category(
        item_id integer not null references item(_id) ON UPDATE CASCADE ON DELETE CASCADE,
        category_id integer not null references category(_id) ON UPDATE CASCADE ON DELETE CASCADE,
        updated_at timestamp default (UNIXEPOCH()),
        primary key(item_id, category_id)
      )`,
      rel_subitem_category: `create table if not exists rel_subitem_category(
        subitem_id integer not null references subitem(_id) ON UPDATE CASCADE ON DELETE CASCADE,
        category_id integer not null references category(_id) ON UPDATE CASCADE ON DELETE CASCADE,
        updated_at timestamp default (UNIXEPOCH()),
        primary key(subitem_id, category_id)
      )`,
      rename_dept: `alter table department rename to dept`,
      department: `create table department(
        _id integer primary key AUTOINCREMENT,
        dept_eng varchar(100) not null unique,
        dept_hin varchar(100) unique,
        dept_code varchar(100) unique,
        settings json default (json('{}')),
        password varchar(300) not null,
        active tinyint(1) default 0,
        created_at timestamp default (UNIXEPOCH()),
        updated_at timestamp default (UNIXEPOCH())
      )`,
      transfer_dept: `insert into department(_id, dept_eng, dept_hin, dept_code, settings, password, active, created_at, updated_at) select _id, dept_eng, dept_hin, dept_code, (select config_value from department_config dc where dc.dept_id = dept._id AND config_key = 'settings'), password, active, created_at, updated_at from dept`,
      drop_dept: `drop table dept`,
      alt_temp_import: `alter table temp_import add column awk_id int`,
    },
    // version 14
    /*
      => add min max rate for items
      => add usage_category in aawak and jawak.
      => Create bachat_new Table.
     */
    {
      alter_item_min: `alter table item add column min_rate decimal(7,2) default 0`,
      alter_item_max: `alter table item add column max_rate decimal(7,2) default 0`,
      alter_subitem_min: `alter table subitem add column min_rate decimal(7,2) default 0`,
      alter_subitem_max: `alter table subitem add column max_rate decimal(7,2) default 0`,
      alter_temp_import_cat: `alter table temp_import add column usage_category varchar(100)`,
      alter_temp_import: `alter table temp_import add column usage_category_id integer`,
      alt_awk: `alter table aawak add column usage_category_id integer references category(_id) ON UPDATE CASCADE ON DELETE CASCADE`,
      alt_jwk: `alter table jawak add column usage_category_id integer references category(_id) ON UPDATE CASCADE ON DELETE CASCADE`,
      drop_bachat_history: `drop table if exists bachat_history`,
      drop_bachat_new: `drop table if exists bachat_new`,
      bachat_new: `create table if not exists bachat_new(
        _id integer primary key AUTOINCREMENT,
        month int not null,
        year int not null,
        mm_id integer not null references mm(_id) ON UPDATE CASCADE ON DELETE CASCADE,
        item_id integer not null references item(_id),
        subitem_id integer null references subitem(_id) ,
        unit_id integer not null references unit(_id) ON UPDATE CASCADE ON DELETE CASCADE,
        dept_id integer not null references department(_id) ON UPDATE CASCADE ON DELETE CASCADE,
        condition_id integer null references support_list(_id) ON UPDATE CASCADE,
        total_aawak decimal(10,2) default 0,
        jawak decimal(10,2) default 0,
        used_jawak decimal(10,2) default 0,
        bachat decimal(10,2) default 0,
        created_at timestamp default (julianday('now','localtime')),
        updated_at timestamp default (julianday('now','localtime')),
        unique(month, year, mm_id, item_id, unit_id, dept_id, subitem_id, condition_id)
      )`,

    },

    // version 15
    /*
      =>creating triger for dept_config insert after new dept insert
      =>new table: usage_category.
      =>roman field added in category
      =>recreating AJPP with new Column: voucher_no, is_xl, usage_category_id fk with new table.
      =>recreating import_history: new field - awk, jwk, total, success.
    */
    {
      dept_ins_config_ins:
        `CREATE TRIGGER IF NOT EXISTS "dept_ins_config_ins"
          AFTER INSERT ON "department"
          FOR EACH ROW 
          BEGIN
            insert into department_config(dept_id, config_key, config_value, active) values(NEW._id, 'mm', json('[]'), NEW.active),(NEW._id, 'item', json('[]'), NEW.active),(NEW._id, 'category', json('[]'), NEW.active), (NEW._id, 'subitem', json('[]'), NEW.active), (NEW._id, 'subitem_list', json('[]'), NEW.active),(NEW._id, 'pbk', json('[]'), NEW.active),(NEW._id, 'department', json('[]'), NEW.active),(NEW._id, 'aj_type', json('[]'), NEW.active), (NEW._id, 'settings', json('{}'), NEW.active), (NEW._id, 'nimitt', json('[]'), NEW.active);
          END;`,
      cat_roman: `ALTER table category add column category_roman varchar(50);`,
      alt_prdct: `ALTER TABLE product add column voucher_no int`,
      alt_prdct_xl: `ALTER TABLE product add column is_xl tinyint(1) default false`,
      alt_awk: `ALTER TABLE aawak add column voucher_no int`,
      alt_awk_xl: `ALTER TABLE aawak add column is_xl tinyint(1) default false`,
      alt_awk_ul: `ALTER TABLE aawak add column usage_list_id integer references support_list(_id)`,
      alt_jwk: `ALTER TABLE jawak add column voucher_no int`,
      alt_jwk_xl: `ALTER TABLE jawak add column is_xl tinyint(1) default false`,
      alt_jwk_ul: `ALTER TABLE jawak add column usage_list_id integer references support_list(_id)`,
      rename_bachat_new: `alter table bachat_new rename to bachat_new_backup`,
      bachat_new: `create table if not exists bachat_new(
        _id integer primary key AUTOINCREMENT,
        month int not null,
        year int not null,
        mm_id integer not null references mm(_id) ON UPDATE CASCADE ON DELETE CASCADE,
        item_id integer not null references item(_id),
        subitem_id integer null references subitem(_id) ,
        unit_id integer not null references unit(_id) ON UPDATE CASCADE ON DELETE CASCADE,
        dept_id integer not null references department(_id) ON UPDATE CASCADE ON DELETE CASCADE,
        condition_id integer null references support_list(_id) ON UPDATE CASCADE,
        total_aawak decimal(10,2) default 0,
        jawak decimal(10,2) default 0,
        used_jawak decimal(10,2) default 0,
        bachat decimal(10,2) default 0,
        created_at timestamp default (julianday('now','localtime')),
        updated_at timestamp default (julianday('now','localtime')),
        unique(month, year, mm_id, item_id, unit_id, dept_id, subitem_id, condition_id)
      )`,
      transfer_bachat: `insert into bachat_new(_id ,month ,year ,mm_id ,item_id ,subitem_id ,unit_id ,dept_id ,condition_id ,total_aawak ,jawak ,used_jawak ,bachat ,created_at ,updated_at) select _id ,month + 1 ,year ,mm_id ,item_id ,subitem_id ,unit_id ,dept_id ,condition_id ,total_aawak ,jawak ,used_jawak ,bachat ,created_at ,updated_at from bachat_new_backup`,
      drop_backup: `drop table if exists bachat_new_backup`,
      report_comment: `create table report_comment(
        _id integer primary key AUTOINCREMENT,
        report_type varchar(25) not null,
        row_type varchar(25) not null,
        month int null,
        year int null,
        dept_id integer not null references department(_id),
        mm_id integer not null references mm(_id),
        item_id integer not null references item(_id),
        subitem_id integer null references subitem(_id) ,
        unit_id integer not null references unit(_id),
        type_id integer null references support_list(_id),
        comment text,
        updated_at timestamp default (UNIXEPOCH())
      )`

    },

    /* TODO cleanup task 
      1. remove table - closing.
      2. remove usage_category_id column from awk, jwk.
    */
  ];

  views = {
    // drop_1: `drop view if exists mn_jwk_aj_type`,
    mn_jwk_aj_type:
      `create view if not exists mn_jwk_aj_type
      AS
      select dept_id, month, year, mm_id, item_id, subitem_id, unit_id, aawak_type_id, 
      sum(t_qty) as total_jawak, 
      sum(used_qty) as used, 
      sum(other_qty) as other 
        from (select CAST(strftime('%Y', jawak.date) AS INTEGER) as year, CAST(strftime('%m', jawak.date) AS INTEGER) as month, sum(jawak.qty) as t_qty, 
        CASE WHEN jawak_type_id = 28 THEN sum(jawak.qty) ELSE 0 END as 'used_qty', 
        CASE WHEN jawak_type_id <> 28 THEN sum(jawak.qty) ELSE 0 END as 'other_qty', 
        CASE WHEN jawak_type_id = 28 THEN 'used' ELSE 'other' END as jawak_type, jawak.*, aawak.aawak_type_id 
        from jawak
        left join aawak on aawak._id = jawak.aawak_ref_id 
        group by month, year, jawak.dept_id, jawak.mm_id, jawak.item_id, jawak.subitem_id, jawak.unit_id, aawak_type_id, jawak_type) jwk
      GROUP BY month, year, dept_id, mm_id, item_id, subitem_id, unit_id, aawak_type_id;`,
    // drop_2: `drop view if exists mn_awk_type_wise`,
    mn_awk_type_wise:
      `create view if not exists mn_awk_type_wise
      as
      select CAST(strftime('%Y', date) AS INTEGER) as year, CAST(strftime('%m', date) AS INTEGER) as month, dept_id, mm_id, item_id, subitem_id, unit_id, aawak_type_id,
      sum(qty) as t_qty, sum(rate) as t_rate, sum(actual_amt) as t_amt, sum(remaining_qty) as t_remaining_qty 
      from aawak
      group by month, year, dept_id, mm_id, item_id, subitem_id, unit_id, aawak_type_id;`,
  }
  migrationLength;
  constructor(dbPath) {
    try {
      const Database = require('better-sqlite3');
      this.query = require('./query');
      this.migrationLength = this.Migrations.length;
      // path = require('path');
      this.db = new Database(dbPath);
      console.log("connected with Database");

      // transactions for updating database changes called migration.
      let runMigration = this.db.transaction(() => {
        try {
          //getting current user version
          let userVersion = this.db.pragma('user_version', { simple: true });
          console.log("current user version : ", userVersion);
          //comparing userversion with total migrations
          if (this.migrationLength > userVersion) {
            //looping through migrations positioned after userversion.
            for (const migrationQueries of this.Migrations.splice(userVersion)) {
              //loop through all queries exists in migration           
              // need to change for...of to for...in.
              for (let query of Object.keys(migrationQueries)) {
                console.log(migrationQueries[query]);
                //executing individual query.
                this.db.prepare(migrationQueries[query]).run();
              }
              console.log("updating database ... ");
            }

            this.db.pragma(`user_version = ${this.migrationLength}`);

            console.log("database updated to `version` ", this.migrationLength);
          }

        }
        catch (err) {
          console.log(err);
        }

      });

      // console.log(this.db.pragma(`table_info('aawak')`));
      // console.log(this.db.prepare(`select strftime('%Y-%m', 2022 || '-' || 10 || '-01') < strftime('%Y-%m', @year);`).all({ month: 11, year: '2022-11-01' }));
      this.db.pragma('foreign_keys=OFF');
      this.db.pragma('legacy_alter_table=ON');
      runMigration();

      for (const viewQuery of Object.values(this.views)) {
        // console.log(viewQuery);
        this.db.prepare(viewQuery).run();
      }


      this.db.pragma('legacy_alter_table=OFF');
      this.db.pragma('foreign_keys=ON');

      // console.log(this.db.prepare(this.query.bachat_new.select_exists).get({
      //   month: 2,
      //   year: 2023,
      //   month: 2,
      //   year: 2023,
      //   mm_id: 1,
      //   item_id: 355,
      //   subitem_id: null,
      //   unit_id: 1,
      //   dept_id: 1,
      //   condition_id: null,
      // }));
    }
    catch (ex) {
      console.log("error db model", ex);
    }
  }

}

let dbmodal = new dbModal(path.resolve(__dirname, '../../../../Data/Database.db'))
module.exports = { dbModal, dbmodal }



