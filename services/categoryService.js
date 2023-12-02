const CategoryModel = require("../models/categoryModel")

exports.getCategory = (req, res) => {
const name = req.body.name;
  console.log(req.body);

  const newCategory = new CategoryModel({ name });
  newCategory
      .save()
      .then((doc) => {
        res.json(doc);
      })
      .catch((err) => {
        console.error(`Database Error: ${err.message}`);
        res.json({ error: err.message });
     });
};
