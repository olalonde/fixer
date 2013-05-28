require('coffee-script');

var models = require('./models/'),
  config = require('./config'),
  fixtures = require('./fixtures/'),
  fixer = require('../');

models.init(config);

var fix = fixer();

models.sync({ force: true })
  .success(function () {
    fixer(fixtures, models()).load(function (err) {
      if (err) return end(err);
      console.log('Finished loading fixtures into database.');
      return end();
    });
  })
  .error(end);

function end (error) {
  if (error) {
    console.error(error);
    process.exit(-1);
  }
  process.exit();
}
