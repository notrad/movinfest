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
      const { phone, address } = req.body;

      if (!phone || !address) {
        req.flash('error', 'All Fields Are Required');
        return res.redirect('/cart');
      }

      const order = new Order({
        customerId: req.user._id,
        items:req.session.cart.items,
        phone,
        address
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
            const order = await Order.findById(req.params.id);

            if(req.user._id.toString() === order.customerId.toString()) {
                return res.render('customers/singleOrder', { order });
            } else {
            return  res.redirect('/');
          }
        },

  };
}

module.exports = orderController;
