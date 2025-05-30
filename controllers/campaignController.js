const cloudinary = require('../utils/cloudinary');
const slugify = require('slugify');
const { Campaign, Country, Category, Beneficiary, User, Contribution } = require('../models');
const { fn, col, Op, literal } = require('sequelize');

exports.startCampaign = async (req, res) => {
  const { title, description, location, country, category, beneficiary } = req.body;

  try {
      // 1) Fetch user (Sequelize)
      const user = await User.findByPk(req.userId);
      if (!user) {
          return res.status(404).json({ msg: 'User not found' });
      }

      if (!user.isVerified || user.KYCStatus === 'pending') {
          return res.status(400).json({ msg: 'You cannot start a campaign. Verify your account and complete KYC.' });
      }

      // 2) Validate location, category, and beneficiary using the database
      const countryId = parseInt(country, 10);
      const categoryId = parseInt(category, 10);
      const beneficiaryId = parseInt(beneficiary, 10);

      // Check if location exists in the Country table
      const validCountry = await Country.findByPk(countryId);
      if (!validCountry) {
          return res.status(400).json({ msg: 'Invalid country id' });
      }

      // Check if category exists in the Category table
      const validCategory = await Category.findByPk(categoryId);
      if (!validCategory) {
          return res.status(400).json({ msg: 'Invalid category id' });
      }

      // Check if beneficiary exists in the Beneficiary table
      const validBeneficiary = await Beneficiary.findByPk(beneficiaryId);
      if (!validBeneficiary) {
          return res.status(400).json({ msg: 'Invalid beneficiary id' });
      }

      const slugBase = slugify(title, { lower: true, strict: true }); // e.g., "help-a-child-in-kenya"
      let slug = slugBase;
      let suffix = 1;

      // Ensure slug uniqueness
      while (await Campaign.findOne({ where: { slug } })) {
        slug = `${slugBase}-${suffix++}`;
      }

      // 3) Create campaign record
      const campaign = await Campaign.create({
          title,
          slug,
          description,
          location,
          countryId,
          categoryId,
          beneficiaryId,
          owner: req.userId,
      });

      const campaignWithDetails = {
        ...campaign.toJSON(),
        country: validCountry.dataValues.country,
        category: validCategory.dataValues.name,
        beneficiary: validBeneficiary.dataValues.name,
      };

      // Remove the countryId, categoryId, and beneficiaryId from the response
      delete campaignWithDetails.countryId;
      delete campaignWithDetails.categoryId;
      delete campaignWithDetails.beneficiaryId;

      res.status(201).json(campaignWithDetails);
  } catch (err) {
      console.error(err);
      res.status(500).send('Server error: ' + err.message);
  }
};
  

exports.setGoal = async (req, res) => {
    const { goalAmount, deadline, currency } = req.body;
    try {
      // Retrieve campaign
      const campaign = await Campaign.findByPk(req.params.campaignId);
      if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });
  
      // Check owner
      if (campaign.owner !== req.userId) {
        return res.status(401).json({ msg: 'User not authorized' });
      }
  
      // If campaign has a countryId, get the currency from the database
      let finalCurrency = currency;
      if (campaign.countryId) {
          const country = await Country.findByPk(campaign.countryId);
          if (country && country.currency) {
              finalCurrency = country.currency;
          }
      }
  
      // Update campaign fields
      campaign.currency = finalCurrency; 
      campaign.goalAmount = goalAmount;
      campaign.deadline = deadline;
  
      await campaign.save();
      res.status(200).json(campaign);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error: ' + err.message);
    }
};
  

exports.uploadVideo = async (req, res) => {
  const { videoUrl } = req.body;

  try {
    const campaign = await Campaign.findByPk(req.params.campaignId);
    if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });

    if (campaign.owner !== req.userId) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Validate video URL format (optional but recommended)
    const isValidUrl = typeof videoUrl === 'string' && videoUrl.match(/^(https:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com|.+\.m3u8)/i);
    if (!isValidUrl) {
      return res.status(400).json({ msg: 'Invalid video URL. Only YouTube, Vimeo, or HLS URLs are accepted.' });
    }

    campaign.videoUrl = videoUrl;
    await campaign.save();

    res.status(200).json({ msg: 'Video URL added successfully', videoUrl });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error: ' + err.message);
  }
};


exports.setStory = async (req, res) => {
    const { story } = req.body;
    try {
      const campaign = await Campaign.findByPk(req.params.campaignId);
      if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });
  
      if (campaign.owner !== req.userId) {
        return res.status(401).json({ msg: 'User not authorized' });
      }
  
      campaign.story = story;
      await campaign.save();
  
      res.status(200).json(campaign);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error: ' + err.message);
    }
};  

exports.completeFundraiser = async (req, res) => {
    try {
      const campaign = await Campaign.findByPk(req.params.campaignId);
      if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });
  
      if (campaign.owner !== req.userId) {
        return res.status(401).json({ msg: 'User not authorized' });
      }
  
      campaign.isComplete = true;
      await campaign.save();
      
      res.status(200).json(campaign);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error: ' + err.message);
    }
  };  

  exports.getCampaigns = async (req, res) => {
    const page = parseInt(req.query.page) || 1;       // default to page 1
    const limit = parseInt(req.query.limit) || 10;    // default to 10 campaigns per page
    const offset = (page - 1) * limit;
  
    try {
      const { rows: campaigns, count: total } = await Campaign.findAndCountAll({
        where: {
          isComplete: true,
          status: 'approved'
        },
        include: [
          { model: Country, attributes: ['id', 'country', 'currency'] },
          { model: Category, attributes: ['id', 'name'] },
          { model: Beneficiary, attributes: ['id', 'name'] },
        ],
        order: [['createdAt', 'DESC']],  // newest first
        limit,
        offset
      });
  
      res.json({
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCampaigns: total,
        campaigns: campaigns.map(c => c.toJSON())
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  };  
  
  
  exports.getCampaignById = async (req, res) => {
    try {
      const campaign = await Campaign.findByPk(req.params.campaignId, {
        include: [
          { 
            model: Country, 
            attributes: ['id', 'country', 'currency'], // Include both 'id' and 'name' fields for Country
          },
          { 
            model: Category, 
            attributes: ['id', 'name'], // Include both 'id' and 'name' fields for Category
          },
          { 
            model: Beneficiary, 
            attributes: ['id', 'name'], // Include both 'id' and 'name' fields for Beneficiary
          }
        ],
      });
  
      if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });
  
      // Format the result, ensuring that we handle null values for relationships
      const campaignJson = campaign.toJSON();
      res.json({
        ...campaignJson
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error: ' + err.message);
    }
  };

  exports.getCampaignBySlug = async (req, res) => {
    try {
      const { slug } = req.params;
  
      const campaign = await Campaign.findOne({
        where: { slug },
        include: [
          { model: Country, attributes: ['id', 'country', 'currency'] },
          { model: Category, attributes: ['id', 'name'] },
          { model: Beneficiary, attributes: ['id', 'name'] },
        ],
      });
  
      if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });
  
      res.json(campaign.toJSON());
    } catch (err) {
      console.error('Error fetching campaign by slug:', err);
      res.status(500).send('Server error: ' + err.message);
    }
  };  

  exports.getUserCampaigns = async (req, res) => {
    try {
      const campaigns = await Campaign.findAll({
        where: {
          owner: req.userId
        },
        include: [
          { model: Country, attributes: ['id', 'country', 'currency'] },
          { model: Category, attributes: ['id', 'name'] },
          { model: Beneficiary, attributes: ['id', 'name'] },
        ]
      });
  
      res.status(200).json(campaigns);
    } catch (err) {
      console.error('Error fetching user campaigns:', err);
      res.status(500).send('Server error');
    }
  };  

exports.updateCampaign = async (req, res) => {
    // const { title, description, goalAmount, deadline, category, location, country, beneficiary, story, coverPhoto, videoUrl } = req.body;
    const { title, description, deadline, category, story, coverPhoto} = req.body;
    try {
      let campaign = await Campaign.findByPk(req.params.campaignId);
      if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });
  
      if (campaign.owner !== req.userId) {
        return res.status(401).json({ msg: 'User not authorized' });
      }
  
      // Update fields if provided
      if (title) campaign.title = title;
      if (description) campaign.description = description;
      // if (goalAmount) campaign.goalAmount = goalAmount;
      if (deadline) campaign.deadline = deadline;
      if (story) campaign.story = story;
      if (coverPhoto) campaign.coverPhoto = coverPhoto;
      // if (videoUrl) campaign.videoUrl = videoUrl;
  
      //   // Validate and update country (location is now an address, country is an ID)
      //   if (country) {
      //     const countryId = parseInt(country, 10);
      //     const validCountry = await Country.findByPk(countryId);
      //     if (!validCountry) {
      //         return res.status(400).json({ msg: 'Invalid country id' });
      //     }
      //     campaign.countryId = countryId;
      // }

      // // Update location (plain text address)
      // if (location) {
      //     campaign.location = location; // Location is now a simple text field
      // }

      // Validate and update category
      if (category) {
          const categoryId = parseInt(category, 10);
          const validCategory = await Category.findByPk(categoryId);
          if (!validCategory) {
              return res.status(400).json({ msg: 'Invalid category id' });
          }
          campaign.categoryId = categoryId;
      }

      // // Validate and update beneficiary
      // if (beneficiary) {
      //     const beneficiaryId = parseInt(beneficiary, 10);
      //     const validBeneficiary = await Beneficiary.findByPk(beneficiaryId);
      //     if (!validBeneficiary) {
      //         return res.status(400).json({ msg: 'Invalid beneficiary id' });
      //     }
      //     campaign.beneficiaryId = beneficiaryId;
      // }
  
      await campaign.save();
      res.json(campaign);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error: ' + err.message);
    }
};  

exports.uploadImages = async (req, res) => {
    try {
      const campaign = await Campaign.findByPk(req.params.campaignId);
      if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });
  
      if (campaign.owner !== req.userId) {
        return res.status(401).json({ msg: 'User not authorized' });
      }
  
      if (campaign.media && campaign.media.length > 0) {
        return res.status(400).json({ msg: 'Media already uploaded. Cannot upload more.' });
      }
  
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ msg: 'No media files uploaded' });
      }
  
      // same Cloudinary upload logic
      const uploadPromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'media_uploads',
              overwrite: true,
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result.secure_url);
            }
          );
          uploadStream.end(file.buffer);
        });
      });
  
      const uploadedImageUrls = await Promise.all(uploadPromises);
  
      // 'media' is likely an ARRAY or JSON field in your Sequelize model
      campaign.media = [...campaign.media, ...uploadedImageUrls];
      await campaign.save();
  
      res.status(200).json({ msg: 'Media uploaded successfully', media: campaign.media });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error: ' + err.message);
    }
};  

exports.reviewCampaign = async (req, res) => {
    const { campaignId, action } = req.body; // action: 'approve' or 'reject'
    try {
      const campaign = await Campaign.findByPk(campaignId);
      if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });
  
      campaign.status = action === 'approve' ? 'approved' : 'rejected';
      await campaign.save();
  
      res.status(200).json({ msg: `Campaign ${action}d successfully` });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error: ' + err.message);
    }
};  

exports.getUserCampaignAnalytics = async (req, res) => {
  try {
    const campaigns = await Campaign.findAll({
      where: { owner: req.userId },
      attributes: ['id', 'title', 'goalAmount', 'raisedAmount'],
    });

    const campaignIds = campaigns.map(c => c.id);

    const totalRaised = campaigns.reduce((sum, c) => sum + parseFloat(c.raisedAmount || 0), 0);

    const totalContributors = await Contribution.count({
      where: { campaign: campaignIds }
    });

    res.json({
      campaignCount: campaigns.length,
      totalRaised,
      totalContributors
    });
  } catch (err) {
    console.error('Error getting campaign analytics:', err);
    res.status(500).send('Server error ' + err.message);
  }
};

exports.getCampaignStats = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const frequency = req.query.frequency || 'monthly'; // or 'daily'

    // 🔍 Fetch campaign
    const campaign = await Campaign.findOne({
      where: {
        id: campaignId,
        status: 'approved',
        isComplete: true
      },
      attributes: ['id', 'title', 'goalAmount', 'raisedAmount']
    });
    
    if (!campaign) {
      return res.status(404).json({ msg: 'Campaign not found or not eligible' });
    }

    // 👥 Contributor count
    const contributorCount = await Contribution.count({
      where: { campaign: campaignId }
    });

    // 💰 Contributions total
    const contributions = await Contribution.findAll({
      where: { campaign: campaignId },
      attributes: ['amount']
    });

    const totalRaised = contributions.reduce((sum, c) => sum + parseFloat(c.amount), 0);
    const goalProgress = campaign.goalAmount > 0
      ? ((totalRaised / campaign.goalAmount) * 100).toFixed(2)
      : null;

    // 📊 Time-series trend data
    const dateUnit = frequency === 'daily' ? 'day' : 'month';

    const trendData = await Contribution.findAll({
      where: { campaign: campaignId },
      attributes: [
        [fn('DATE_TRUNC', dateUnit, col('createdAt')), 'period'],
        [fn('SUM', col('amount')), 'amount']
      ],
      group: ['period'],
      order: [[literal('period'), 'ASC']],
      raw: true
    });

    res.json({
      campaignId: campaign.id,
      title: campaign.title,
      totalRaised,
      goalAmount: campaign.goalAmount,
      goalProgress: goalProgress ? `${goalProgress}%` : null,
      contributorCount,
      trend: trendData.map(entry => ({
        date: entry.period,
        amount: parseFloat(entry.amount)
      }))
    });
  } catch (err) {
    console.error('Error getting campaign stats:', err);
    res.status(500).send('Server error');
  }
};

exports.getCampaignEnums = (req, res) => {
    res.json({
      africanCurrencies: CampaignEnums.africanCurrencies,
      internationalCurrencies: CampaignEnums.internationalCurrencies,
      categories: CampaignEnums.categories,
      beneficiaries: CampaignEnums.beneficiaries,
    });
  };  