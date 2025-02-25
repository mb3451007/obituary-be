const { User } = require('./user.model');
const { RefreshToken } = require('./refreshToken.model');
const { Obituary } = require('./obituary.model');

User.hasMany(RefreshToken, { foreignKey: 'userId' });
RefreshToken.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Obituary, { foreignKey: 'userId' });
Obituary.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  RefreshToken,
  Obituary,
};
