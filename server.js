const express = require('express');
const dotenv = require('dotenv');
const ejs = require('ejs');
const expressLayout = require('express-ejs-layouts');
const path = require('path');
const routes = require('./routes/web');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('express-flash');
const MongoDbStore = require('connect-mongo');
const passport = require('passport');
const passportInit = require('./app/config/passport');
const Emitter = require('events');


//configuration
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const eventEmitter = new Emitter();

//database connection
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: true });
const connection = mongoose.connection;
connection.once('open', () => {
  console.log(`Database connection successful to: ${process.env.DATABASE_URL}`);
}).catch(err => {
  console.log('Connection to Database failed: '+ err);
});


//session config
app.use(session({
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoDbStore.create ({
    mongoUrl: process.env.DATABASE_URL,
    autoRemove: 'native',
    touchAfter: 24 * 3600
    // client: connection.getClient(), // works only after db.once is returned
  }),
  cookie: { maxAge: 1000*60*60*24 } // session is save for 24 hours on the db
}));


//middlewares
app.use(flash());
app.set('eventEmitter', eventEmitter);
app.use(passport.initialize());
app.use(passport.session());
passportInit(passport);
app.use(expressLayout);
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.user;
  next();
});
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/resources/views'));

//routes
routes(app);

//server listen
const server = app.listen(PORT, () => {
  console.log(`listening on http://127.0.0.1:${PORT}`);
});

const io = require('socket.io')(server);
io.on('connection', (socket) => {
      // Join
      socket.on('join', (roomName) => {
      socket.join(roomName);
      });
});

eventEmitter.on('orderUpdated', (data) => {
    io.to(`order_${data.id}`).emit('orderUpdated', data);
});

eventEmitter.on('orderPlaced', (data) => {
    io.to('adminRoom').emit('orderPlaced', data);
});
