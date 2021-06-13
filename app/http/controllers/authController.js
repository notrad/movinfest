const User = require('../../models/user');
const bcrypt = require('bcrypt');
const passport = require('passport');

function authController() {

  const _getRedirectUrl = (req) => {
        return req.user.role === 'admin' ? '/admin/orders' : '/customer/orders'
    }

  return {

    login(req, res) {
      res.render('auth/login');
    },

    postLogin(req, res, next) {
            const { email, password } = req.body;

            if(!email || !password) {
                req.flash('error', 'All fields are required');
                return res.redirect('/login');
            }
            passport.authenticate('local', (err, user, info) => {

                if(err) {
                    req.flash('error', info.message );
                    return next(err);
                }
                if(!user) {
                    req.flash('error', info.message );
                    return res.redirect('/login');
                }

                req.logIn(user, (err) => {
                    if(err) {
                        req.flash('error', info.message );
                        return next(err);
                    }

                    res.header('Cache-Control', 'no-store');
                    return res.redirect(_getRedirectUrl(req));
                    // return res.redirect('/');
                    // use render function instead if nav bar is not getting updated, solved with cache-control
                });

            })(req, res, next)
        },

    register(req, res) {
      res.render('auth/register');
    },

    async postRegister(req, res) {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        req.flash('error', 'All Fields Are Required');
        req.flash('name', name);
        req.flash('email', email);
        return res.redirect('/register');
      }

      User.exists({ email: email }, (err, result) =>{
        if (result) {
          req.flash('error', 'Email Already Exists, Please Choose a Different One.');
          req.flash('name', name);
          return res.redirect('/register');
        }
      });

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new User({
        // name: name,
        name,
        email,
        password: hashedPassword
      });

      user.save()
      .then((user) => {
        return res.redirect('/');
      })
      .catch(err => {
        req.flash('error', 'Whoops! Something Went Wrong.');
        return res.redirect('/register');
      });

    },

    logout(req, res) {
      delete req.session.cart;
      req.logout();
      return res.redirect('login');
    }
  };
}

module.exports = authController;
