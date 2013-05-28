# Fixer

Node.js module to setup your test database using fixtures in a breeze. 
Inspired by Rails fixtures. Only supports `sequelize` ORM at the moment.

## Install

    npm install fixer

## Usage 

See [example/load_fixtures.js](./example/load_fixtures.js).

```javascript

var fixer = require('fixer');
/**
 * @param {Object} fixtures associative object. keys represent model names and values contain an array of fixtures for that model. fixture are simple associative objects.
 * @param {Object} models associative object. key represents the model
 * name and value is the Sequelize model
 */
fixer(fixtures, models).load(function (err) {
  if (err) return console.error(err);
  console.log('Finished loading fixtures into database.');
});

```

Example fixtures (in coffeescript):

`students.coffee`

```coffeescript
module.exports =
  oli:
    first_name: 'Olivier'
    last_name: 'Lalonde'
    email: 'olalonde@gmail.com'
    school: 'NYU'
  mark:
    first_name: 'Mark'
    last_name: 'Zuckerberg'
    email: 'mark@facebook.com'
    #password
    school: 'Harvard'
```

`schools.coffee`

```coffeescript
module.exports =
  'NYU':
    name: 'New York University'
    email: 'info@nyu.com'
  'Harvard':
    name: 'University of Harvard'
    email: 'info@harvard.edu'
```

You can reference other fixtures by their key. For example, `students.oli.school`
reference fixture `schools.NYU`.
