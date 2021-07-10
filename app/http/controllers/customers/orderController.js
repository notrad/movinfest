const Order = require('../../../models/order');
const moment = require('moment');
const { ObjectId } = require('mongodb');

function orderController() {
  return {

    async index(req, res) {
      try {
        const orders = await Order.find(
          { customerId: req.user._id , status: { $ne: 'completed' }},
          null,
          { sort: { 'createdAt': -1} }
        );
        return res.render('customers/orders', { orders: orders, moment: moment });
      } catch (e) {
        return res.render('error/404');
      }

    },

    store(req, res) {
      const { phone, address, guests, eventtype, datetime, customization } = req.body;

    // TODO: input sanitization

      if (!phone || !address || !guests || !eventtype || !datetime ) {
        req.flash('error', 'All Fields Are Required');

        return res.redirect('/cart');
      }

      if ( datetime <= (moment().format('YYYY-MM-DDTHH:MM')) ) {
        req.flash('error', 'Invalid Date');
        return res.redirect('/cart');
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

        Order.populate(result, { path: 'customerId' }, (err, replacedOrdersult) =>{
          req.flash('success','Order Placed Successfully.');
          delete req.session.cart;

          const eventEmitter = req.app.get('eventEmitter');
          eventEmitter.emit('orderPlaced', result);

          return res.redirect('/customer/orders');
        });

        })
      .catch(err => {
        req.flash('error', 'Something Went Wrong');
        return res.redirect('/cart');
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
