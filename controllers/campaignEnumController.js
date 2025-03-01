const { Country, Category, Beneficiary } = require('../models');

// Get all Countries
exports.getCountries = async (req, res) => {
  try {
    const countries = await Country.findAll();
    res.status(200).json(countries);
  } catch (err) {
    console.error('Error fetching countries:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get all Categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get all Beneficiaries
exports.getBeneficiaries = async (req, res) => {
  try {
    const beneficiaries = await Beneficiary.findAll();
    res.status(200).json(beneficiaries);
  } catch (err) {
    console.error('Error fetching beneficiaries:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
