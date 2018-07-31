const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const express = require('express');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const passport = require('passport');
const path = require('path');
const keys = require('./config/keys');

require('./models/Artist');
require('./models/Release');
require('./models/Sale');
require('./models/User');
require('./services/passport');

mongoose.connect(keys.mongoURI);
const app = express();

app.use(bodyParser.json());
app.use(
  cookieSession({
    name: 'NEMp3 session',
    keys: [keys.cookieKey],
    maxAge: 7 * 24 * 60 * 60 * 1000
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

require('./routes/artworkRoutes')(app);
require('./routes/authRoutes')(app);
require('./routes/downloadRoutes')(app);
require('./routes/emailRoutes')(app);
require('./routes/musicRoutes')(app);
require('./routes/nemRoutes')(app);
require('./routes/releaseRoutes')(app);
require('./routes/trackRoutes')(app);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'client', 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 8083;
app.listen(PORT);
