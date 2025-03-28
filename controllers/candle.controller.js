const { Candle } = require("../models/candle.model");
const { Op } = require("sequelize");
const moment = require("moment");
const candleController = {
  burnCandle: async (req, res) => {
    try {
      const { userId } = req.body;
      const obituaryId = req.params.id;

      const ipAddress =
        req.ip ||
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress;

      const lastBurned = await Candle.findOne({
        where: {
          [Op.or]: [{ ipAddress: ipAddress }],
          obituaryId: obituaryId,
          createdTimestamp: {
            [Op.gte]: moment().subtract(24, "hours").toDate(),
          },
        },
      });

      if (lastBurned) {
        return res
          .status(409)
          .json({ message: "You can only burn one candle per 24 hours." });
      }

      const newCandle = await Candle.create({
        ipAddress,
        userId: userId || null,
        obituaryId,
        expiry: moment().add(24, "hours").toDate(),
      });

      return res
        .status(201)
        .json({ message: "Candle burned successfully.", candle: newCandle });
    } catch (error) {
      console.error("Error burning candle:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  },
};
module.exports = candleController;
