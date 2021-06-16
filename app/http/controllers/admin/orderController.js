const Order = require('../../../models/order');
const moment = require('moment');


function orderController() {
    return {
        index(req, res) {
           Order.find({ status: { $ne: 'completed' } }, null, { sort: { 'createdAt': -1 }}).populate('customerId', '-password').exec((err, orders) => {
             if(req.xhr) {
               res.header('Cache-Control', 'no-store');
               return res.json(orders);
             } else {
               res.header('Cache-Control', 'no-store');
               return res.render('admin/orders');
             }
           })
        },

        async orderDetails(req, res) {
          try {
            const order = await Order.findById(req.params.id);

            if (req.user.role === 'admin' && order) {
              let totalPrice = 0;
              for (var variable of Object.values(order.items)) {
              for (var item of Object.values(variable)) {
                totalPrice += item.price;
              }}

              return res.render('admin/singleOrder', { order, moment: moment, totalPrice });
            }

          } catch (e) {
              if (req.user.role === 'admin') {
                return res.redirect('/admin/orders');
              } else {
                return res.redirect('/');
              }
          }

          }
      }
}

module.exports = orderController;
