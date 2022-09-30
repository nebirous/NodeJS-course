const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv/config');

const app = express();
const api = process.env.API_URL;

//Middleware
app.use(express.json());
app.use(morgan('tiny'));

const productSchema = mongoose.Schema({
  name: String,
  image: String,
  countInStock: { type: Number, required: true },
});

const Product = mongoose.model('Product', productSchema);

app.get(api + '/', (req, res) => {
  res.send('Hello API !');
});

app.get(`${api}/products`, async (req, res) => {
  const products = await Product.find();
  if (!products) res.status(500).json({ success: false });
  res.send(products);
});

app.post(`${api}/products`, (req, res) => {
  const product = new Product({
    name: req.body.name,
    image: req.body.image,
    countInStock: req.body.countInStock,
  });
  console.log(product);
  product
    .save()
    .then((createdProduct) => {
      res.status(201).json(createdProduct);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
        success: false,
      });
    });
});

mongoose
  .connect(process.env.DB_CONNECT, {
    dbName: 'eshop_first_DB',
  })
  .then(() => {
    console.log('DB Connection sucessful');
  })
  .catch((err) => {
    console.log('DB found error:' + err);
  });

app.listen(3000, () => {
  console.log(api);
  console.log('Server is running now on http://localhost:3000');
});
