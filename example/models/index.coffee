Sequelize = require 'sequelize'
models = null
sequelize = null

assertInit = () ->
  if !models
    throw new Error 'You must first use .init(db_config) before you can access models.'

module.exports = () ->
  assertInit()
  return models

module.exports.sequelize = () ->
  assertInit()
  return sequelize

module.exports.sync = (cb) ->
  assertInit()
  return sequelize.sync(cb)

module.exports.init = (config) ->

  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  )

  model_names = [
    'Student',
    'School'
  ]

  models = {}

  model_names.forEach (model_name) -> 
    models[model_name] = require('./' + model_name)(sequelize, Sequelize)

  # define associations
  require('./associations')(models, sequelize)

  #sequelize.sync() #not sure i need to do this

  return models
