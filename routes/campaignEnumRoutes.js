const express = require('express');
const { getCountries, getCategories, getBeneficiaries } = require('../controllers/campaignEnumController');

const router = express.Router();

router.get('/countries', getCountries);
router.get('/categories', getCategories);
router.get('/beneficiaries', getBeneficiaries);

module.exports = router;
