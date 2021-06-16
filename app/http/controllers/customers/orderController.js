const Order = require('../../../models/order');
const moment = require('moment');

function orderController() {
  return {

    async index(req, res) {
      const orders = await Order.find(
        { customerId: req.user._id },
        null,
        { sort: { 'createdAt': -1} }
      );
      res.header('Cache-Control', 'no-store');
      res.render('customers/orders', { orders: orders, moment: moment });
    },

    store(req, res) {
      const { phone, address, guests, eventtype, datetime, customization } = req.body;

      if (!phone || !address || !guests || !eventtype || !datetime ) {
        req.flash('error', 'All Fields Are Required');
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

  };
}

module.exports = orderController;
