const Order = require('../../../models/order');
const moment = require('moment');
const { ObjectId } = require('mongodb');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

function orderController() {
  return {

    async index(req, res) {
      try {
        const orders = await Order.find(
          { customerId: req.user._id , status: {$nin : ["completed", "cancelled"]}},
          null,
          { sort: { 'createdAt': -1} }
        );
        return res.render('customers/orders', { orders: orders, moment: moment });
      } catch (e) {
        return res.render('error/404');
      }

    },

    store(req, res) {
      const { phone, address, guests, eventtype, datetime, customization, stripeToken, paymentType } = req.body;

    // TODO: input sanitization

      if (!phone || !address || !guests || !eventtype || !datetime ) {
        return res.status(422).json({message: 'All Fields Are Required'});
      }

      if ( datetime <= (moment().format('YYYY-MM-DDTHH:MM')) ) {

        return res.status(422).json({message: 'Invalid Date.'});
      }

      const order = new Order({
        customerId: req.user._id,
        items:req.session.cart.items,
        phone: phone,
        address: address,
        guests: guests,
        eventtype: eventtype,
        datetime: datetime,
        customization: (customization ? customization : "None"),
      });

      order.save()
      .then(result => {

        Order.populate(result, { path: 'customerId' }, (err, placedOrder) => {
          const eventEmitter = req.app.get('eventEmitter');

        if(paymentType === 'card') {
            stripe.charges.create({
                amount: req.session.cart.totalPrice * guests * 100,
                source: stripeToken,
                currency: 'inr',
                description: `Order Number: ${placedOrder._id}`
            }).then(() => {
                placedOrder.paymentStatus = true;
                placedOrder.paymentType = paymentType;
                placedOrder.save().then((ord) => {

                eventEmitter.emit('orderPlaced', ord);
                delete req.session.cart;
                return res.json({ message : 'Payment successful, Order placed successfully' });
                }).catch((err) => {
                    console.log(err);
                });

            }).catch((err) => {
                delete req.session.cart;
                console.log(err);
                eventEmitter.emit('orderPlaced', placedOrder);
                return res.json({ message : 'Order Placed but payment failed, You can pay at delivery time' });
            });
          } else {
              delete req.session.cart;
              eventEmitter.emit('orderPlaced', placedOrder);
              return res.json({ message : 'Order placed succesfully'});
            }

          });

        })
      .catch(err => {
        return res.status(500).json({ message : 'Something went wrong, Order Could Not be Placed.'});
      });
    },

    async show(req, res) {

          try {
            const order = await Order.findById(req.params.id);
            if(req.user._id.toString() === order.customerId.toString()) {
              let totalPrice = 0;
              for (var variable of Object.values(order.items)) {
              for (var item of Object.values(variable)) {
                totalPrice += item.price;
              }}

                return res.render('customers/singleOrder', { order, moment: moment, totalPrice});
            }
          } catch (e) {
            return res.redirect('/');
          }
    },

    async feedback(req, res) {
      try {
        var order_id = JSON.parse(req.body.order_id);
        const order = await Order.updateOne(
          {_id : ObjectId(order_id)},
          { feedback: req.body.feedback },
          (err, data) => {
            if (err) {
              req.flash('error','Feedback Could Not Be submitted');
              return res.redirect('/customer/orders/completed');
            }
              req.flash('success','Feedback Submitted Successfully');
              return res.redirect('/customer/orders');
          }

        );

      } catch (e) {
        return res.redirect('/');
      }
    },

    async completedOrders(req, res) {
      try {
        const orders = await Order.find(
          { status: { $eq: 'completed' }, customerId: req.user._id },
          null,
          { sort: { 'createdAt': -1} }
        );

        return res.render('customers/completedOrders', { orders, moment: moment });

        } catch (e) {
            return res.redirect('/customer/orders');
        }

    },

    async cancelledOrders(req, res) {
      try {
        const orders = await Order.find(
          { status: { $eq: 'cancelled' }, customerId: req.user._id },
          null,
          { sort: { 'createdAt': -1} }
        );

        return res.render('customers/cancelledOrders', { orders, moment: moment });

        } catch (e) {
            return res.redirect('/customer/orders');
        }

    },

  };
}

module.exports = orderController;
