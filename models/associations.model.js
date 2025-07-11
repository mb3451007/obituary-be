const { User } = require("./user.model");
const { RefreshToken } = require("./refreshToken.model");
const { Obituary } = require("./obituary.model");
const { Event } = require("./event.model");
const { Photo } = require("./photo.model");
const { Keeper } = require("./keeper.model");
const { SorrowBook } = require("./sorrow_book.model");
const { MemoryLog } = require("./memory_logs.model");
const { Dedication } = require("./dedication.model");
const { Condolence } = require("./condolence.model");
const { Candle } = require("./candle.model");

User.hasMany(RefreshToken, { foreignKey: "userId" });
RefreshToken.belongsTo(User, { foreignKey: "userId" });

Obituary.hasMany(Event, { foreignKey: "obituaryId" });
Event.belongsTo(Obituary, { foreignKey: "obituaryId" });

Obituary.hasMany(Candle, { foreignKey: "obituaryId", as: "candles" });
Candle.belongsTo(Obituary, { foreignKey: "obituaryId", as: "obituary" });

User.hasMany(SorrowBook, { foreignKey: "userId" });
SorrowBook.belongsTo(User, { foreignKey: "userId" });

Obituary.hasMany(Keeper, { foreignKey: "obituaryId" });
Keeper.belongsTo(Obituary, { foreignKey: "obituaryId" });

Obituary.hasMany(Photo, { foreignKey: "obituaryId" });
Photo.belongsTo(Obituary, { foreignKey: "obituaryId" });

Obituary.hasMany(Condolence, { foreignKey: "obituaryId" });
Condolence.belongsTo(Obituary, { foreignKey: "obituaryId" });

Obituary.hasMany(Dedication, { foreignKey: "obituaryId" });
Dedication.belongsTo(Obituary, { foreignKey: "obituaryId" });

Obituary.hasMany(SorrowBook, { foreignKey: "obituaryId" });
SorrowBook.belongsTo(Obituary, { foreignKey: "obituaryId" });

Obituary.hasMany(MemoryLog, { foreignKey: "obituaryId" });
MemoryLog.belongsTo(Obituary, { foreignKey: "obituaryId" });

User.hasMany(MemoryLog, { foreignKey: "userId" });
MemoryLog.belongsTo(User, { foreignKey: "userId" });

// Obituary.hasMany(Event, { foreignKey: "obituaryId" });  for future
// Event.belongsTo(Obituary, { foreignKey: "obituaryId" });

User.hasMany(Obituary, { foreignKey: "userId" });
Obituary.belongsTo(User, { foreignKey: "userId" });

module.exports = {
  User,
  RefreshToken,
  Obituary,
  Event,
  Photo,

  MemoryLog,
  Keeper,
  SorrowBook,
  Dedication,
  Condolence,
};
