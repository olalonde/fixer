module.exports = (models, sequelize) ->
  # Define associations

  Student = models.Student
  School = models.School

  School.hasMany Student
  Student.belongsTo School, as: 'school'
