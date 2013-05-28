module.exports = (sequelize, Sequelize) ->

  # @todo: Make sure email is unique

  Student = sequelize.define 'student',
    id: Sequelize.INTEGER
    first_name: 
      type: Sequelize.STRING
      validate:
        notEmpty: true
    last_name: 
      type: Sequelize.STRING
      validate:
        notEmpty: true
    email:
      type: Sequelize.STRING
      validate:
        isEmail: true

  return Student
