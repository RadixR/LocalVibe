require('dotenv').config();
const express       = require('express');
const path          = require('path');
const morgan        = require('morgan');
const session       = require('express-session');
const MongoStore    = require('connect-mongo');
const mongoose      = require('mongoose');

const app = express();

// --- Database ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// --- Middleware ---
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --- Sessions ---
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { httpOnly: true, secure: false }
}));

// Make session data available to all views
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// --- View Engine ---
const { engine } = require('express-handlebars');
app.engine('handlebars', engine({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: {
    formatDate: function(date) {
      if (!date) return '';
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    formatForInput: function(date) {
      const d = new Date(date);
      return isNaN(d) ? '' : d.toISOString().slice(0,10);
    },
    eq: function(a, b) {
      if (typeof a === 'undefined' || typeof b === 'undefined') {
        return false; 
      }
      return a.toString() === b.toString();
    },
    formatStatus: function(status) {
      if (!status) return '';
      switch (status) {
        case 'pending': return 'Pending Approval';
        case 'approved': return 'Approved';
        case 'rejected': return 'Rejected';
        case 'requested_changes': return 'Changes Requested';
        default: return status.charAt(0).toUpperCase() + status.slice(1);
      }
    },
    truncateText: function(text, length) {
      if (typeof text !== 'string') return '';
      if (text.length <= length) return text;
      return text.substring(0, length) + '...';
    }
  }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// --- Routes ---
app.use('/',       require('./routes/index'));
app.use('/auth',   require('./routes/auth'));
app.use('/events', require('./routes/events'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/admin',     require('./routes/admin'));
app.use('/notifications', require('./routes/notifications'));
app.use('/reports', require('./routes/reports'));

// --- 404 Wildcard ---
app.use('*', (req, res) => res.status(404).render('404'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`LocalVibe listening on port ${PORT}`)); 