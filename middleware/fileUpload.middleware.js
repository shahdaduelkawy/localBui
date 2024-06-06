const multer = require("multer")
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "img/uploads/")
    },
    filename: (req, file, cb) => {
        const ext = file.originalname.split(".").pop()
        const newName = `${req.params.ownerID}+${Date.now()}.${ext}`
        cb(null, newName)
    }
})
const upload = multer({
    storage,
    limits: { fileSize: 2000000 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
})

const profilePicStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "img/profile-pics/");
    },
    filename: (req, file, cb) => {
        const ext = file.originalname.split(".").pop();
        const newName = `profile_${req.params.customerId}+${Date.now()}.${ext}`;
        cb(null, newName);
    }
});

const uploadProfilePic = multer({
    storage: profilePicStorage,
    limits: { fileSize: 2000000 },
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype === "image/png" ||
            file.mimetype === "image/jpg" ||
            file.mimetype === "image/jpeg"
        ) {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
        }
    }
});
const categorystorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "img/categorypics/");
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const newName = `category_${req.params.categoryId}_${Date.now()}${ext}`;
      cb(null, newName);
    }
  });
  
  const categoryupload = multer({
    storage: categorystorage,
    limits: { fileSize: 2000000 }, // 2MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
        cb(null, true);
      } else {
        cb(null, false);
        return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
      }
    }
  });
  
module.exports = {
    upload,
    uploadProfilePic,
    categoryupload
};


