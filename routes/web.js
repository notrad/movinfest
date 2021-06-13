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

  app.get('/login', guest, authController().login);
  app.post('/login', authController().postLogin);
  app.post('/logout', auth, authController().logout);

  app.get('/register', guest, authController().register);
  app.post('/register', authController().postRegister);

  app.get('/cart', cartController().index);
  app.post('/update-cart', cartController().update);

  app.post('/orders', auth, orderController().store);
  app.get('/customer/orders', auth, orderController().index);
  app.get('/customer/orders/:id', auth, orderController().show);

  app.get('/admin/orders', adminAuth, adminOrderController().index);
  app.post('/admin/order/status', adminAuth, statusController().update);

  app.get('*', errorController().index);

}

module.exports = initRoutes;
