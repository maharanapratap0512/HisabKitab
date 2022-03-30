//@ts-check
const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const errorHandler = (err) => {
   console.error('Error at upload route: ' + err.message);
   return { success: false, message: err.message };
}

const upload = multer({ dest: __dirname + "/../../../../Data/Documents/" })

const driveMulterConfig = {
   storage: multer.diskStorage({
      destination: (req, file, next) => { next(null, __dirname + "/../../../../Data/Documents/"); },

      filename: (req, file, next) => { next(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname)); }
   }),
   limits: { fileSize: 5000000 }, // 1 MB = 1000000 Bytes 
   fileFilter: (req, file, next) => {
      if (file.mimetype.includes("application")) {
         file.mimetype.startsWith('application/') ? next(null, true) : next(null, false);
      } else {
         file.mimetype.startsWith('image/') ? next(null, true) : next(null, false);
      }
   }
};

const imageMulterConfig = {
   storage: multer.diskStorage({
      destination: (req, file, next) => { next(null, __dirname + "/../../../../Data/Documents/Images"); },

      filename: (req, file, next) => { next(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname)); }
   }),
   limits: { fileSize: 5000000 }, // 1 MB = 1000000 Bytes 
   fileFilter: (req, file, next) => {
      if (file.mimetype != "application/pdf") {
         file.mimetype.startsWith('image/') ? next(null, true) : next(null, false);
      } else {
         file.mimetype.startsWith('application/') ? next(null, true) : next(null, false);
      }
   }
};


// drive document
router.post('/doc', multer(driveMulterConfig).single('document'), async (req, res) => {
   try {
      if (!req.file) {
         res.json({
            success: false,
            message: 'Invalid or No file provided'
         });
      } else {
         const path = '/api' + req.file.destination.split('.')[1] + '/' + req.file.filename;
         res.json({
            success: true,
            filePath: path
         });
      }
   } catch (err) {
      res.status(500).json(errorHandler(err));
   }
});


// Single Image
router.post('/image', multer(imageMulterConfig).single('image'), async (req, res) => {
   try {
      if (!req.file) {
         res.json({
            success: false,
            message: 'Invalid or No file provided'
         });
      } else {
         const imgPath = req.file.destination.split('.')[1] + '/' + req.file.filename;
         res.json({
            success: true,
            file: req.file.path
         });
      }
   } catch (err) {
      res.status(500).json(errorHandler(err));
   }
});


//return list of all available images.
router.get('/image', async (req, res) => {
   try {
      //  console.log("WElcome");
      fs.readdir(__dirname + "/../../../../Data/Documents/Images", (err, files) => {
         res.json({
            success: true,
            result: files,
            dirpath: 'public//images//',
         });
      });
   }
   catch (err) {
      res.status(500).json(errorHandler(err));
   }
});


//return list of all available images.
router.delete('/image', async (req, res, next) => {
   try {
      if (req.body.filename) {
         fs.rm(__dirname + "/../../../../Data/Documents/Images/" + req.body.filename, (err) => {
            if (err) {
               return next(err);
            }
            res.json({
               success: true,
               result: 'file delete succesfully.'
            })

         });
      }
   }
   catch (err) {
      res.status(500).json(errorHandler(err));
   }
});


module.exports = router;