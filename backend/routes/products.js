const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const { Product } = require('../models/product');
const mongoose = require('mongoose');

router.get('/', async (req, res) => {
  // localhost:3000/api/v1/products?categories=2342342,234234
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(',') };
  }

  const products = await Product.find().populate('category');
  if (!products) res.status(500).json({ success: false });
  res.send(products);
});

router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category');
  if (!product) res.status(400).json({ message: 'Product not found' });
  res.send(product);
});

router.post('/', async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send('Invalid category');

  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: req.body.image,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rate: req.body.rate,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
    dateCreated: req.body.dateCreated,
  });

  product = await product.save();

  if (!product) return res.status(500).send('Product could not be created');

  res.send(product);

  // product
  //   .save()
  //   .then((createdProduct) => {
  //     res.status(201).json(createdProduct);
  //   })
  //   .catch((err) => {
  //     res.status(500).json({
  //       error: err,
  //       success: false,
  //     });
  //   });
});

router.put('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send('Invalid Product Id');
  }

  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send('Invalid category');

  let product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rate: req.body.rate,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
      dateCreated: req.body.dateCreated,
    },
    { new: true }
  );

  product = await product.save();

  if (!product) return res.status(404).send('Product not updated!');

  res.send(product);
});

router.delete('/:id', (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: 'Deleted successfully' });
      } else {
        return res
          .status(404)
          .json({ success: false, message: 'Product not found' });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, message: err });
    });
});

router.get('/get/count', async (req, res) => {
  const productsCount = await Product.countDocuments();
  if (!productsCount) res.status(500).json({ success: false });
  res.send({ productsCount: productsCount });
});

router.get('/get/featured/:count', async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const featuredProducts = await Product.find({ isFeatured: true }).limit(
    +count
  );
  if (!featuredProducts) res.status(500).json({ success: false });
  res.send({ count: featuredProducts });
});

module.exports = router;
