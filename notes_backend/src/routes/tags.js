const express = require('express');
const noteController = require('../controllers/note');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tags
 *   description: Tags management
 */

/**
 * @swagger
 * /tags:
 *   get:
 *     summary: Get all tags for user
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tags
 */
router.get('/', authenticate, noteController.getTags);

module.exports = router;
