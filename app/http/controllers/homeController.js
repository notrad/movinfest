const Menu = require('../../models/menu');

function homeController() {
  return {
    async index(req, res) {
      try {
        const items = await Menu.find();
        return res.render('home', {
          items: items
        });
      } catch (e) {
        return res.render('error/404');
      }


    },

    about(req, res) {

      return res.render('about-us');

    }
  };
}

module.exports = homeController;
