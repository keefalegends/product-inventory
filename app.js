require('dotenv').config();
const express        = require('express');
const bodyParser     = require('body-parser');
const methodOverride = require('method-override');
const path           = require('path');
const initDB         = require('./config/init');

const app  = express();
const PORT = process.env.PORT || 8080; // Elastic Beanstalk uses 8080

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

// Routes
app.get('/', (req, res) => res.redirect('/products'));
app.use('/products', require('./routes/products'));

// Health check endpoint (required by Elastic Beanstalk)
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', timestamp: new Date() }));

// 404
app.use((req, res) => res.status(404).render('error', { message: 'Page not found' }));

// Start server after DB init
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
