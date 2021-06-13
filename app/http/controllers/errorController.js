function errorController() {
  return {
    index(req, res) {

      if (req.accepts('html')) {

        return res.status(404).render('errors/404');

      } else if (req.accepts('json')) {

        return res.status(404).json({
          error: 'Page Not found'
        });

      } else {
        // default to plain-text. send()
        res.type('txt').send('Not found');
      }


    }
  };
}

module.exports = errorController;
