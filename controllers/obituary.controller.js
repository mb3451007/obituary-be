const httpStatus = require('http-status-codes').StatusCodes;
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const { Obituary, validateObituary } = require('../models/obituary.model');
const { User } = require('../models/user.model');

const OBITUARY_UPLOADS_PATH = path.join(__dirname, '../obituaryUploads');

const obituaryController = {
  createObituary: async (req, res) => {
    const {
      name,
      sirName,
      location,
      region,
      city,
      gender,
      birthDate,
      deathDate,
      funeralLocation,
      funeralCemetery,
      funeralTimestamp,
      events,
      deathReportExists,
      obituary,
      symbol,
    } = req.body;

    const { error } = validateObituary(req.body);

    if (error) {
      console.warn(`Invalid data format: ${error}`);

      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ error: `Invalid data format: ${error}` });
    }

    const existingObituary = await Obituary.findOne({
      where: {
        userId: req.user.id,
        name,
        sirName,
        deathDate,
      },
    });

    if (existingObituary) {
      console.warn(
        'An obituary with the same name, and death date already exists for this user.'
      );

      return res.status(httpStatus.CONFLICT).json({
        error:
          'An obituary with the same name, and death date already exists for this user.',
      });
    }

    const newObituary = await Obituary.create({
      userId: req.user.id,
      name,
      sirName,
      location,
      region,
      city,
      gender,
      birthDate,
      deathDate,
      funeralLocation,
      funeralCemetery,
      funeralTimestamp: funeralTimestamp || null,
      events: JSON.parse(events || '[]'),
      deathReportExists,
      obituary,
      symbol,
    });

    const obituaryId = newObituary.id;

    const obituaryFolder = path.join(OBITUARY_UPLOADS_PATH, String(obituaryId));

    if (!fs.existsSync(obituaryFolder)) {
      fs.mkdirSync(obituaryFolder, { recursive: true });
    }

    let picturePath = null;
    let deathReportPath = null;

    if (req.files?.picture) {
      const pictureFile = req.files.picture[0];

      const optimizedPicturePath = path.join(
        'obituaryUploads',
        String(obituaryId),
        `${path.parse(pictureFile.originalname).name}.avif`
      );

      await sharp(pictureFile.buffer)
        .resize(195, 267, { fit: 'cover' })
        .toFormat('avif', { quality: 50 })
        .toFile(path.join(__dirname, '../', optimizedPicturePath));

      picturePath = optimizedPicturePath;
    }

    if (req.files?.deathReport) {
      deathReportPath = path.join(
        'obituaryUploads',
        String(obituaryId),
        req.files.deathReport[0].originalname
      );
      fs.writeFileSync(
        path.join(__dirname, '../', deathReportPath),
        req.files.deathReport[0].buffer
      );
    }

    newObituary.image = picturePath;
    newObituary.deathReport = deathReportPath;
    await newObituary.save();

    res.status(httpStatus.CREATED).json(newObituary);
  },

  getObituary: async (req, res) => {
    const { id, userId, page = 1, limit = 10 } = req.query;

    const whereClause = {};

    if (id) whereClause.id = id;
    if (userId) whereClause.userId = userId;

    const offset = (page - 1) * limit;

    const obituaries = await Obituary.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: [['createdTimestamp', 'DESC']],
      include: [
        {
          model: User,
        },
      ],
    });

    res.status(httpStatus.OK).json({
      total: obituaries.count,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      obituaries: obituaries.rows,
    });
  },

  updateObituary: async (req, res) => {
    const obituaryId = req.params.id;

    const existingObituary = await Obituary.findByPk(obituaryId);

    if (!existingObituary) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ error: 'Obituary not found' });
    }

    const obituaryFolder = path.join(OBITUARY_UPLOADS_PATH, String(obituaryId));

    if (!fs.existsSync(obituaryFolder)) {
      fs.mkdirSync(obituaryFolder, { recursive: true });
    }

    let picturePath = existingObituary.image;
    let deathReportPath = existingObituary.deathReport;

    if (req.files?.picture) {
      picturePath = path.join(
        'obituaryUploads',
        String(obituaryId),
        req.files.picture[0].originalname
      );

      if (
        existingObituary.image &&
        fs.existsSync(path.join(__dirname, '../', existingObituary.image))
      ) {
        fs.unlinkSync(path.join(__dirname, '../', existingObituary.image));
      }

      fs.writeFileSync(
        path.join(__dirname, '../', picturePath),
        req.files.picture[0].buffer
      );
    }

    if (req.files?.deathReport) {
      deathReportPath = path.join(
        'obituaryUploads',
        String(obituaryId),
        req.files.deathReport[0].originalname
      );

      if (
        existingObituary.deathReport &&
        fs.existsSync(path.join(__dirname, '../', existingObituary.deathReport))
      ) {
        fs.unlinkSync(
          path.join(__dirname, '../', existingObituary.deathReport)
        );
      }

      fs.writeFileSync(
        path.join(__dirname, '../', deathReportPath),
        req.files.deathReport[0].buffer
      );
    }

    const fieldsToUpdate = {};

    if (req.body.name !== undefined) fieldsToUpdate.name = req.body.name;
    if (req.body.sirName !== undefined)
      fieldsToUpdate.sirName = req.body.sirName;
    if (req.body.location !== undefined)
      fieldsToUpdate.location = req.body.location;
    if (req.body.region !== undefined) fieldsToUpdate.region = req.body.region;
    if (req.body.city !== undefined) fieldsToUpdate.city = req.body.city;
    if (req.body.gender !== undefined) fieldsToUpdate.gender = req.body.gender;
    if (req.body.birthDate !== undefined)
      fieldsToUpdate.birthDate = req.body.birthDate;
    if (req.body.deathDate !== undefined)
      fieldsToUpdate.deathDate = req.body.deathDate;
    if (req.body.funeralLocation !== undefined)
      fieldsToUpdate.funeralLocation = req.body.funeralLocation;
    if (req.body.funeralCemetery !== undefined)
      fieldsToUpdate.funeralCemetery = req.body.funeralCemetery;
    if (req.body.funeralTimestamp !== undefined)
      fieldsToUpdate.funeralTimestamp = req.body.funeralTimestamp;
    if (req.body.events !== undefined)
      fieldsToUpdate.events = JSON.parse(req.body.events);
    if (req.body.deathReportExists !== undefined)
      fieldsToUpdate.deathReportExists = req.body.deathReportExists;
    if (req.body.obituary !== undefined)
      fieldsToUpdate.obituary = req.body.obituary;
    if (req.body.symbol !== undefined) fieldsToUpdate.symbol = req.body.symbol;

    if (picturePath !== existingObituary.image) {
      fieldsToUpdate.image = picturePath;
    }
    if (deathReportPath !== existingObituary.deathReport) {
      fieldsToUpdate.deathReport = deathReportPath;
    }

    await existingObituary.update(fieldsToUpdate);

    res.status(httpStatus.OK).json(existingObituary);
  },

  updateVisitCounts: async (req, res) => {
    const obituaryId = req.params.id;

    const obituary = await Obituary.findByPk(obituaryId);

    if (!obituary) {
      console.warn('Obituary not found');

      return res
        .status(httpStatus.NOT_FOUND)
        .json({ error: 'Obituary not found' });
    }

    const currentTimestamp = new Date();

    const startOfWeek = new Date();
    const day = startOfWeek.getDay();
    const diff = day === 0 ? 6 : day - 1;
    startOfWeek.setDate(startOfWeek.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    let updatedCurrentWeekVisits = obituary.currentWeekVisits;

    if (
      !obituary.lastWeeklyReset ||
      new Date(obituary.lastWeeklyReset) < startOfWeek
    ) {
      await Obituary.update(
        {
          currentWeekVisits: 0,
          lastWeeklyReset: currentTimestamp,
        },
        { where: { id: obituaryId } }
      );

      updatedCurrentWeekVisits = 0;
    }

    await Obituary.update(
      {
        totalVisits: obituary.totalVisits + 1,
        currentWeekVisits: updatedCurrentWeekVisits + 1,
      },
      { where: { id: obituaryId } }
    );

    const updatedObituary = await Obituary.findByPk(obituaryId, {
      include: [
        {
          model: User,
        },
      ],
    });

    res.status(httpStatus.OK).json(updatedObituary);
  },
};

module.exports = obituaryController;
