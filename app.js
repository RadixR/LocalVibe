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
    formatTime: function(timeStr) {
      const [h, m] = timeStr.split(':').map(Number);
      const suffix = h >= 12 ? 'PM' : 'AM';
      const hour12 = ((h + 11) % 12) + 1;
      return hour12 + ':' + String(m).padStart(2, '0') + ' ' + suffix;
    },
    formatDateTime: function(date) {
      const d = new Date(date);
      if (isNaN(d)) return '';
      const dateStr = d.toLocaleDateString('en-US', {
        month: 'short',
        day:   'numeric',
        year:  'numeric'
      });
      const h = d.getHours(), m = d.getMinutes();
      const suffix = h >= 12 ? 'PM' : 'AM';
      const hour12 = ((h + 11) % 12) + 1;
      return `${dateStr} ${hour12}:${String(m).padStart(2,'0')} ${suffix}`;
    },
    formatForInput: function(date) {
      const d = new Date(date);
      return isNaN(d) ? '' : d.toISOString().slice(0,10);
    },
    eq: function(a, b) {
      if (a == null || b == null) {
        return false;
      }
      return a.toString() === b.toString();
    },
    includes: function(array, value) {
      if (!Array.isArray(array)) return false;
      return array.some(item => item.toString() === value.toString());
    },
    gte: function(a, b) {
      return Number(a) >= Number(b);
    },
    truncateText: function(text, length) {
      if (typeof text !== 'string') return '';
      if (text.length <= length) return text;
      return text.substring(0, length) + '...';
    },
    formatStatus: function(status) {
      const labels = {
        pending:            'Pending',
        approved:           'Approved',
        rejected:           'Rejected',
        requested_changes:  'Requested Changes'
      };
      return labels[status] || status;
    },
    getTodayString: function() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    join: function(array, separator) {
      if (!Array.isArray(array)) return '';
      return array.join(separator);
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

// --- 404 Wildcard ---
app.use('*', (req, res) => res.status(404).render('404'));

// --- Global error handler ---
app.use((err, req, res, next) => {
  console.error(err);
  if (req.get('Accept') === 'application/json') {
    return res.status(err.status || 500).json({ error: err.message });
  }
  res.status(err.status || 500).render('error', {
    message: err.message,
    error:   process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`LocalVibe listening on port ${PORT}`)); 