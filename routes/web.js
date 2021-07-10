const homeController = require('../app/http/controllers/homeController');
const authController = require('../app/http/controllers/authController');
const cartController = require('../app/http/controllers/customers/cartController');
const orderController = require('../app/http/controllers/customers/orderController');
const adminOrderController = require('../app/http/controllers/admin/orderController');
const statusController = require('../app/http/controllers/admin/statusController');
const errorController = require('../app/http/controllers/errorController');
const guest = require('../app/http/middlewares/guest');
const auth = require('../app/http/middlewares/auth');
const adminAuth = require('../app/http/middlewares/adminAuth');

function initRoutes(app) {

  app.get('/', homeController().index);
  app.get('/about-us', homeController().about);

  app.get('/login', guest, authController().login);
  app.post('/login', authController().postLogin);
  app.post('/logout', auth, authController().logout);

  app.get('/register', guest, authController().register);
  app.post('/register', authController().postRegister);

  app.get('/cart', cartController().index);
  app.post('/update-cart', cartController().update);
  app.post('/remove-cart-item', cartController().removeFromCart);

  app.post('/orders', auth, orderController().store);
  app.post('/feedback', auth, orderController().feedback);
  app.get('/customer/orders', auth, orderController().index);
  app.get('/customer/orders/completed', auth, orderController().completedOrders);
  app.get('/customer/orders/cancelled', auth, orderController().cancelledOrders);
  app.get('/customer/orders/:id', auth, orderController().show);

  app.get('/admin/orders', adminAuth, adminOrderController().index);
  app.get('/admin/orders/completed', adminAuth, adminOrderController().completedOrders);
  app.get('/admin/orders/cancelled', adminAuth, adminOrderController().cancelledOrders);
  app.get('/admin/orders/:id', adminAuth, adminOrderController().orderDetails);
  app.post('/admin/order/status', adminAuth, statusController().update);

  app.get('*', errorController().index);

}

module.exports = initRoutes;
