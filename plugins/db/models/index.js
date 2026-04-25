const Sequelize = require('sequelize')
const { initEmailModel } = require('./email')
const fs = require('fs')

const initDatabase = (settings) => {
  const pool = {
    max: Number(settings.DB_POOL_MAX || 200),
    min: Number(settings.DB_POOL_MIN || 10),
    acquire: 30000,
    idle: 10000,
  }

  const dialectOptions = { decimalNumbers: true }
  if (settings.DB_SSL) dialectOptions.ssl = { ca: fs.readFileSync(settings.DB_SSL, 'utf8') }

  const config = {
    username: settings.DB_USERNAME || 'root',
    password: settings.DB_PASSWORD || '123456',
    database: settings.DB_NAME,
    host: settings.DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    operatorsAliases: 0,
    pool,
    port: settings.DB_PORT || '3306',
    benchmark: true,
    // logging: dbLogging,
    dialectOptions,
  }

  const sequelize = new Sequelize(config.database, config.username, config.password, config)
  const models = { ...initEmailModel(sequelize) }

  Object.values(models)
    .filter((model) => typeof model.associate === 'function')
    .forEach((model) => model.associate(models))

  models.sequelize = sequelize
  models.Sequelize = Sequelize

  return models
}

module.exports = { initDatabase }
