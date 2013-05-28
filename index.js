var async = require('async'),
  util = require('util'),
  EventEmitter = require('events').EventEmitter,
  _ = require('underscore'),
  _s = require('underscore.string');

// @todo: disable constraint checks?

var Fixer = function (model_fixtures, models) {
  EventEmitter.call(this);
  this.models = models; // keep track of created objects
  this.instances = {}; // keep track of created objects
  this.model_fixtures = model_fixtures;
}

util.inherits(Fixer, EventEmitter);

/**
 * fixture is a simple associative object contained in a fixture file
 *
 * fixture_id is the key used to uniquely identify a fixture before it is
 * saved to the db and receives an instace id.
 *
 */
Fixer.prototype.load = function (cb) {
  var _this = this;
  this.eachFixture(function (model_name, fixture_id, fixture, cb) {
    _this.create(model_name, fixture_id, fixture, cb);
  },
  function (err) {
    if (err) return console.error(err);
    console.log('Created all fixtures!');
    _this.eachFixture(function (model_name, fixture_id, fixture, cb) {
      _this.saveAssociations(model_name, fixture_id, fixture, cb);
    },
    function (err) {
      if (err) return cb(err);
      console.log('Saved all fixture associations!');
      cb();
    });
  });
};

// iterate over fixtures asynchronously
Fixer.prototype.eachFixture = function (iterator, cb) {
  async.each(this.model_fixtures, function (fixtures, model_name, cb) {
    async.each(fixtures, function (fixture, fixture_id, cb) {
      iterator(model_name, fixture_id, fixture, cb);
    }, function (err) {
      cb(err);
    });
  }, function (err) {
    cb(err);
  });
}

// can edit to use with other frameworks/ORM
Fixer.prototype.getModel = function (model_name) {
  var Model = this.models[model_name] || null;
  if (!Model) throw new Error('Could not find model ' + model_name);
  return Model;
};

Fixer.prototype.getFixture = function (model_name, fixture_id) {
  var fixture = this.model_fixtures[model_name] && this.model_fixtures[model_name][fixture_id];
  if (!fixture) throw new Error('Fixture ' + model_name + '#' + fixture_id + ' does not exist.');
  return fixture;
}

Fixer.prototype.getInstance = function (model_name, fixture_id) {
  var instance = this.instances[model_name] && this.instances[model_name][fixture_id];
  if (!instance) throw new Error('Instance ' + model_name + '#' + fixture_id + ' does not exist.');
  return instance;
}

Fixer.prototype.getAssociations = function (Model, fixture) {
  var _this = this;
  var res = [];
  _.each(Model.associations, function (association) {
    if (fixture[association.associationAccessor]) {
      var local = {},
        foreign = {},
        type = association.type;
      // get setter from associations
      local.setter = _s.camelize('set_' + association.associationAccessor);

      foreign.model_name = _s.capitalize(association.target.name);
      foreign.fixture_id = fixture[association.associationAccessor];
      foreign.fixture = _this.getFixture(foreign.model_name, foreign.fixture_id);

      res.push({local: local, foreign: foreign, type: type});
    }
  });
  return res;
}

Fixer.prototype.create = function (model_name, fixture_id, fixture, cb) {
  this.instances[model_name] = this.instances[model_name] || {};

  var Model = this.getModel(model_name),
    _this = this;

  Model.create(fixture)
    .success(function (instance) {
      _this.instances[model_name][fixture_id] = instance;
      _this.emit('create', model_name, fixture_id, instance);
      cb();
    }).error(function (err) {
      console.error('Failed to create ' + model_name + '#' + fixture_id);
      console.error(err);
      cb(err);
    });

};

Fixer.prototype.saveAssociations = function (model_name, fixture_id, fixture, cb) {
  var Model = this.getModel(model_name),
    _this = this;

  var local_instance = this.getInstance(model_name, fixture_id);

  async.each(this.getAssociations(Model, fixture), function (assoc, cb) {
    var local = assoc.local;
    var foreign = assoc.foreign;

    console.log(local.setter);
    console.log(foreign.model_name);
    console.log(foreign.fixture_id);
    console.log(foreign.fixture);

    var foreign_instance = _this.getInstance(foreign.model_name, foreign.fixture_id);

    local_instance[local.setter](foreign_instance)
      .success(function () {
        cb();
      }).error(function (err) {
        cb(err);
      });
  }, function (err) {
    return cb(err);
  });
}

/**
 * @param {Object} fixtures associative object. keys represent model names and values contain an array of fixtures for that model. fixture are simple associative objects.
 * @param {Object} models associative object. key represents the model
 * name and value is the Sequelize model
 */
module.exports = function (model_fixtures, models) {
  return new Fixer(model_fixtures, models); 
  //fix.on('create', function (model_name, object_id, instance) {
    //console.log('created ' + object_id);
  //});
};
