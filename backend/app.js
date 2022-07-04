const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '100mb' }));

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
    next();
});


// Routes
const mmRoutes = require('./api/routes/mm.routes');
const stateRoutes = require('./api/routes/state.routes');
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
const bachatMonthlyRoutes = require('./api/routes/bachat_monthly.routes');
const bachatRoutes = require('./api/routes/bachat.routes');
const pointRoutes = require('./api/routes/point.routes');
const importExportRoutes = require('./api/routes/import-export.routes');
const nimittRoutes = require('./api/routes/nimitt.routes');


// // Routes - Binding
app.use('/api/mms', mmRoutes);
app.use('/api/states', stateRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/pbks', pbkRoutes);
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
app.use('/api/bachat_monthly', bachatMonthlyRoutes);
app.use('/api/bachat', bachatRoutes);
app.use('/api/points', pointRoutes);
app.use('/api/importexport', importExportRoutes);
app.use('/api/nimitt', nimittRoutes);



// app.use((req, res, next) => {
//     const error = new Error('Not Found, please check the path');
//     //@ts-ignore
//     error.status = 404;
//     next(error);
// });


app.use((error, req, res, next) => {
    let status = error.status || 500;
    let msg = (status == 404) ? "Browsed path not found" : error.message;
    res.status(status).json(msg);
});


module.exports = app;