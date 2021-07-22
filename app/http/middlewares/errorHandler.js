function errorHandler(err, req, res, next) {
  if (err) {
    res.send('<p>Website Could Not Be Reached, Please Try Again Later. You Can Contact Us @ <a href="mailto:maxcaterersbajpe@gmail.com">maxcaterersbajpe@gmail.com</a></p>');
    console.log(err);
  }
}

module.exports = errorHandler;
