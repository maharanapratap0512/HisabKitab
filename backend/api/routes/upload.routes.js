
const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const errorHandler = (err) => {
   console.error('Error at upload route: ' + err.message);
   return { success: false, message: err.message };
}
const rootPath = path.resolve(__dirname + "/../../../../Data/Documents/");
const imagePath = path.resolve(__dirname + "/../../../../Data/Documents/Images");
const upload = multer({ dest: __dirname + "/../../../../Data/Documents/" })

const driveMulterConfig = {
   storage: multer.diskStorage({
      destination: (req, file, next) => {
         next(null, __dirname + "/../../../../Data/Documents/");
      },

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

const dbMulterConfig = {
   storage: multer.diskStorage({
      destination: (req, file, next) => { next(null, __dirname + "/../../../../Data/" + file.originalname + "/"); },

      filename: (req, file, next) => { next(null, file.originalname + '_update_' + Date.now() + '.db') }
   }),
   limits: { fileSize: 5000000 }, // 1 MB = 1000000 Bytes    
   fileFilter: (req, file, next) => {
      if (file.mimetype == 'application/octet-stream') {
         next(null, true)
      } else {
         next(null, false);
      }
   }
};

const imageMulterConfig = {
   storage: multer.diskStorage({
      destination: (req, file, next) => {
         if (!fs.existsSync(imagePath)) {
            fs.mkdirSync(imagePath, { recursive: true });
         }
          next(null, imagePath); },

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

const pbkImageMulterConfig = {
   storage: multer.diskStorage({
      destination: (req, file, next) => { next(null, __dirname + "/../../../../Data/Documents/Pbk"); },

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

const productImageMulterConfig = {
   storage: multer.diskStorage({
      destination: (req, file, next) => { next(null, __dirname + "/../../../../Data/Documents/Product"); },

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

//upload DB for monthly updates
router.post('/db', multer(dbMulterConfig).single('updateDB'), async (req, res) => {
   try {
      if (!req.file) {
         res.json({
            success: false,
            message: 'Invalid or No file provided'
         });
      } else {
         // const path = '/api' + req.file.destination.split('.')[1] + '/' + req.file.filename;
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

// Single Image for PBK
router.post('/image/pbk', multer(pbkImageMulterConfig).single('image'), async (req, res) => {
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

// Single Image for Product
router.post('/image/product', multer(productImageMulterConfig).single('image'), async (req, res) => {
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

//return list of all pbk images.
router.get('/image/pbk', async (req, res) => {
   try {
      //  console.log("WElcome");
      fs.readdir(__dirname + "/../../../../Data/Documents/Pbk", (err, files) => {
         res.json({
            success: true,
            result: files,
            dirpath: 'public//Pbk//',
         });
      });
   }
   catch (err) {
      res.status(500).json(errorHandler(err));
   }
});

//return list of all pbk images.
router.get('/image/product', async (req, res) => {
   try {
      //  console.log("WElcome");
      fs.readdir(__dirname + "/../../../../Data/Documents/Product", (err, files) => {
         res.json({
            success: true,
            result: files,
            dirpath: 'public//Product//',
         });
      });
   }
   catch (err) {
      res.status(500).json(errorHandler(err));
   }
});

//delete images.
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

//delete pbk image.
router.delete('/image/pbk', async (req, res, next) => {
   try {
      if (req.body.filename) {
         fs.rm(__dirname + "/../../../../Data/Documents/Pbk/" + req.body.filename, (err) => {
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

//return list of all available images.
router.delete('/image/product', async (req, res, next) => {
   try {
      if (req.body.filename) {
         fs.rm(__dirname + "/../../../../Data/Documents/Product/" + req.body.filename, (err) => {
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