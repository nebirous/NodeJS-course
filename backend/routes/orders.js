const { Order } = require('../models/order');
const { OrderItem } = require('../models/order-item');
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) => {
  const orderList = await Order.find()
    .populate('user', 'name')
    .sort({ dateOrdered: -1 });
  //.sort('dateOrdered'); this

  if (!orderList) {
    res.status(500).json({ success: false });
  }
  res.send(orderList);
});

router.get(`/:id`, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name')
    .populate({
      path: 'orderItems',
      populate: {
        path: 'product',
        populate: 'category',
      },
    });

  if (!order) {
    res.status(500).json({ success: false });
  }
  res.send(order);
});

router.post('/', async (req, res) => {
  let orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });

      newOrderItem = await newOrderItem.save();
      return newOrderItem._id;
    })
  );

  const resolvedItemsIds = await orderItemsIds;

  const totalPrices = await Promise.all(
    resolvedItemsIds.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        'product',
        'price'
      );
      const totalPrice = orderItem.product.price * orderItem.quantity;
      return totalPrice;
    })
  );

  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

  let order = new Order({
    orderItems: resolvedItemsIds,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
  });
  order = await order.save();

  if (!order) return res.status(400).send('the category cannot be created!');

  res.send(order);
});

router.put('/:id', async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    { new: true }
  );

  if (!order) return res.status(400).send('the order cannot be updated!');

  res.send(order);
});

router.delete('/:id', (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async (order) => {
      if (order) {
        await order.orderItems.map(async (orderItem) => {
          await OrderItem.findByIdAndDelete(orderItem);
        });

        return res
          .status(200)
          .json({ success: true, message: 'the order is deleted!' });
      } else {
        return res
          .status(404)
          .json({ success: false, message: 'order not found!' });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

router.get('/get/totalsales', async (req, res)=> {
  const totalSales= await Order.aggregate([
      { $group: { _id: null , totalsales : { $sum : '$totalPrice'}}}
  ])

  if(!totalSales) {
      return res.status(400).send('The order sales cannot be generated')
  }

  res.send({totalsales: totalSales.pop().totalsales})
})

router.get(`/get/count`, async (req, res) =>{
  const orderCount = await Order.countDocuments((count) => count)

  if(!orderCount) {
      res.status(500).json({success: false})
  } 
  res.send({
      orderCount: orderCount
  });
})

router.get(`/get/userorders/:userid`, async (req, res) =>{
  const userOrderList = await Order.find({user: req.params.userid}).populate({ 
      path: 'orderItems', populate: {
          path : 'product', populate: 'category'} 
      }).sort({'dateOrdered': -1});

  if(!userOrderList) {
      res.status(500).json({success: false})
  } 
  res.send(userOrderList);
})

module.exports = router;
