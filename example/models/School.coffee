module.exports = (sequelize, Sequelize) ->

  # @todo: Make sure email is unique

  School = sequelize.define 'school',
    id:    Sequelize.INTEGER
    name:  Sequelize.STRING
    email: Sequelize.STRING

  return School
