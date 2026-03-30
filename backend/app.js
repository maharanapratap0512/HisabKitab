const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '500mb' }));

//public folder
app.use('/api/public', express.static(path.join(__dirname + '/../../Data/Documents')));

// Cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-with, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    req.setTimeout(900000);
    res.setTimeout(900000);
    next();
});


// Routes
const mmRoutes = require('./api/routes/mm.routes');
const stateRoutes = require('./api/routes/state.routes');
const zoneRoutes = require('./api/routes/zone.routes');
const districtRoutes = require('./api/routes/district.routes');
const unitRoutes = require('./api/routes/unit.routes');
const cityRoutes = require('./api/routes/city.routes');
const categoryRoutes = require('./api/routes/category.routes');
const pbkRoutes = require('./api/routes/pbk.routes');
const uploadRoutes = require('./api/routes/upload.routes');
const itemRoutes = require('./api/routes/item.routes');
const subitemRoutes = require('./api/routes/subitem.routes');
const subitemlistRoutes = require('./api/routes/subitemlist.routes');
const productRoutes = require('./api/routes/product.routes');
const entrytypeRoutes = require('./api/routes/entrytype.routes');
const countryRoutes = require('./api/routes/country.routes');
const dropdownRoutes = require('./api/routes/dropdown.routes');
const supportListRoutes = require('./api/routes/support_list.routes');
const departmentRoutes = require('./api/routes/department.routes');
const departmentConfigRoutes = require('./api/routes/department_config.routes');
const aawakEntryRoutes = require('./api/routes/aawak.routes');
const jawakEntryRoutes = require('./api/routes/jawak.routes');
const bachatRoutes = require('./api/routes/bachat.routes');
const bachatNewRoutes = require('./api/routes/bachat_new.routes');
const bachatNewOptimizedRoutes = require('./api/routes/bachat_new_optimized.routes');
const pointRoutes = require('./api/routes/point.routes');
const importExportRoutes = require('./api/routes/import-export.routes');
const excelImportRoutes = require('./api/routes/excel-import.routes');
const nimittRoutes = require('./api/routes/nimitt.routes');
const dictionaryRoutes = require('./api/routes/dictionary.routes');
const reportRoutes = require('./api/routes/reports.routes');
const importHistoryRoutes = require('./api/routes/import_history.routes');
const vehicleRoutes = require('./api/routes/vehicle.routes');
const vehicleDocRoutes = require('./api/routes/vehicle_document.routes');
const commentRoutes = require('./api/routes/report_comment.routes');
const mysqlRoutes = require('./api/routes/mysql.routes');
const pbkClosingRoutes = require('./api/routes/pbk_closing.routes');
const pbkBachatRoutes = require('./api/routes/pbk_bachat.routes');
const hmpRoutes = require('./api/routes/hmp.routes');
const prastavRoutes = require('./api/routes/prastav.routes');
const { sutramEngine } = require('./api/database/db.model');


// // Routes - Binding
app.use('/api/mms', mmRoutes);
app.use('/api/states', stateRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/pbks', pbkRoutes);
app.use('/api/pbk_bachat', pbkBachatRoutes);
app.use('/api/pbk_closing', pbkClosingRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/subitems', subitemRoutes);
app.use('/api/subitemlists', subitemlistRoutes);
app.use('/api/entrytypes', entrytypeRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api/dropdown', dropdownRoutes);
app.use('/api/supportlists', supportListRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/department_config', departmentConfigRoutes);
app.use('/api/aawak', aawakEntryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/jawak', jawakEntryRoutes);
app.use('/api/bachat', bachatRoutes);
app.use('/api/bachat_new', bachatNewRoutes);
app.use('/api/bachat_new_optimized', bachatNewOptimizedRoutes);
app.use('/api/points', pointRoutes);
app.use('/api/importexport', importExportRoutes);
app.use('/api/excelimport', excelImportRoutes);
app.use('/api/nimitt', nimittRoutes);
app.use('/api/dictionary', dictionaryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/import_history', importHistoryRoutes);
app.use('/api/vehicle', vehicleRoutes);
app.use('/api/vehicle_document', vehicleDocRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api/mysql', mysqlRoutes);
app.use('/api/hmp', hmpRoutes);
app.use('/api/prastav', prastavRoutes);





app.use('/api/sutram', sutramEngine.router());


// app.use((req, res, next) => {
//     const error = new Error('Not Found, please check the path');
//     //@ts-ignore
//     error.status = 404;
//     next(error);
// });


app.use((error, req, res, next) => {
    console.log(error);
    let status = error.status || 500;
    let msg = (status == 404) ? "Browsed path not found" : error.message;
    res.status(status).json(msg);
});


module.exports = app;