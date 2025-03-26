const httpStatus = require("http-status-codes").StatusCodes;

const { Op } = require("sequelize");

const { User } = require("../models/user.model");
const { MemoryLog } = require("../models/memory_logs.model");

const memoryLogsController = {
  createLog: async (type, obituaryId, userId, interactionId = null, status) => {
    try {
      if (!type || !obituaryId || !userId || !status) {
        console.warn("Invalid data format: Missing required fields");
        return null;
      }

      const log = await MemoryLog.create({
        type,
        status,
        userId,
        obituaryId,
        interactionId: interactionId || null,
      });

      return log;
    } catch (error) {
      console.error("Error creating memory log:", error);
      throw new Error("Failed to create memory log");
    }
  },
};

module.exports = memoryLogsController;
