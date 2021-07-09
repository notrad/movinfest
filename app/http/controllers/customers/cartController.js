const moment = require('moment');

function cartController() {
  return {

    index(req, res) {
      res.render('customers/cart', {  moment: moment });
    },

    // add single item to cart
    update(req, res) {
      //if cart does not exist one is created
      if (!req.session.cart) {
        req.session.cart = {
          items: {},
          totalQty: 0,
          totalPrice: 0
        }
      }

      let cart = req.session.cart;
      //if items does not exit in cart, it is added
      if (!cart.items[req.body._id]) {
        cart.items[req.body._id] = {
          item: req.body
        }
        cart.totalQty = cart.totalQty + 1;
        cart.totalPrice = cart.totalPrice + req.body.price;
      }

      return res.json({ totalQty: req.session.cart.totalQty });
    },

    //remove single item from cart
    removeFromCart(req, res) {

      let cart = req.session.cart;
      //if item exists in the cart, it is removed
      if (cart.items[req.body._id]) {
        delete cart.items[req.body._id];
        cart.totalQty = cart.totalQty - 1;
        cart.totalPrice = cart.totalPrice - req.body.price;


        if (Object.keys(cart.items).length === 0 && cart.items.constructor === Object) {
          const cartStateData = { totalQty: req.session.cart.totalQty, totalPrice: req.session.cart.totalPrice , refreshPage: true};

          delete req.session.cart;
          return res.json(cartStateData);

        } else {

          return res.json({ totalQty: req.session.cart.totalQty, totalPrice: req.session.cart.totalPrice , refreshPage: false});

        }
      }

    }


  };
}

module.exports = cartController;
