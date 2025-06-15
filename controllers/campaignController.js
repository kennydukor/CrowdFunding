const cloudinary = require('../utils/cloudinary');
const slugify = require('slugify');
const { Campaign, Country, Category, Beneficiary, User, Contribution } = require('../models');
const { fn, col, Op, literal } = require('sequelize');
const { sendSuccess, sendError} = require('../utils/general');

exports.startCampaign = async (req, res) => {
  const { title, description, location, country, category, beneficiary } = req.body;

  try {
      // 1) Fetch user (Sequelize)
      const user = await User.findByPk(req.userId);
      if (!user) {
        return sendError(res, 'User not found', {
          errorCode: 'USER_NOT_FOUND',
          status: 404
        });
      }

      if (!user.isVerified || user.KYCStatus === 'pending') {
        return sendError(res, 'You cannot start a campaign. Verify your account and complete KYC.', {
          errorCode: 'KYC_INCOMPLETE',
          status: 400
        });
      }

      // 2) Validate location, category, and beneficiary using the database
      const countryId = parseInt(country, 10);
      const categoryId = parseInt(category, 10);
      const beneficiaryId = parseInt(beneficiary, 10);

      // Check if location exists in the Country table
      const validCountry = await Country.findByPk(countryId);
      if (!validCountry) {
        return sendError(res, 'Invalid country ID', {
          errorCode: 'INVALID_COUNTRY_ID',
          status: 400
        });
      }

      // Check if category exists in the Category table
      const validCategory = await Category.findByPk(categoryId);
      if (!validCategory) {
        return sendError(res, 'Invalid category ID', {
          errorCode: 'INVALID_CATEGORY_ID',
          status: 400
        });
      }

      // Check if beneficiary exists in the Beneficiary table
      const validBeneficiary = await Beneficiary.findByPk(beneficiaryId);
      if (!validBeneficiary) {
        return sendError(res, 'Invalid beneficiary ID', {
          errorCode: 'INVALID_BENEFICIARY_ID',
          status: 400
        });
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

      return sendSuccess(res, 'Campaign started successfully', campaignWithDetails, 201);
  } catch (err) {
    console.error('Start campaign error:', err);
    return sendError(res, 'Failed to start campaign');
  }
};
  

exports.setGoal = async (req, res) => {
    const { goalAmount, deadline, currency } = req.body;

    try {
        const campaign = await Campaign.findByPk(req.params.campaignId);

        if (!campaign) {
            return sendError(res, 'Campaign not found', {
                errorCode: 'CAMPAIGN_NOT_FOUND',
                status: 404
            });
        }

        if (campaign.owner !== req.userId) {
            return sendError(res, 'User not authorized', {
                errorCode: 'UNAUTHORIZED_USER',
                status: 401
            });
        }

        // Determine the final currency
        let finalCurrency = currency;
        if (campaign.countryId) {
            const country = await Country.findByPk(campaign.countryId);
            if (country && country.currency) {
                finalCurrency = country.currency;
            }
        }

        // Update goal details
        campaign.currency = finalCurrency;
        campaign.goalAmount = goalAmount;
        campaign.deadline = deadline;

        await campaign.save();

        return sendSuccess(res, 'Campaign goal set successfully', campaign);

    } catch (err) {
        console.error('Set goal error:', err);
        return sendError(res, 'Failed to set campaign goal');
    }
};
  

exports.uploadVideo = async (req, res) => {
  const { videoUrl } = req.body;

  try {
    const campaign = await Campaign.findByPk(req.params.campaignId);

    if (!campaign) {
      return sendError(res, 'Campaign not found', {
        errorCode: 'CAMPAIGN_NOT_FOUND',
        status: 404
      });
    }

    if (campaign.owner !== req.userId) {
      return sendError(res, 'User not authorized', {
        errorCode: 'UNAUTHORIZED_USER',
        status: 401
      });
    }

    const isValidUrl =
      typeof videoUrl === 'string' &&
      videoUrl.match(/^(https:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com|.+\.m3u8)/i);

    if (!isValidUrl) {
      return sendError(res, 'Invalid video URL. Only YouTube, Vimeo, or HLS URLs are accepted.', {
        errorCode: 'INVALID_VIDEO_URL',
        status: 400
      });
    }

    campaign.videoUrl = videoUrl;
    await campaign.save();

    return sendSuccess(res, 'Video URL added successfully', { videoUrl });

  } catch (err) {
    console.error('Upload video error:', err);
    return sendError(res, 'Failed to upload video');
  }
};


exports.setStory = async (req, res) => {
  const { story } = req.body;

  try {
    const campaign = await Campaign.findByPk(req.params.campaignId);

    if (!campaign) {
      return sendError(res, 'Campaign not found', {
        errorCode: 'CAMPAIGN_NOT_FOUND',
        status: 404
      });
    }

    if (campaign.owner !== req.userId) {
      return sendError(res, 'User not authorized', {
        errorCode: 'UNAUTHORIZED_USER',
        status: 401
      });
    }

    campaign.story = story;
    await campaign.save();

    return sendSuccess(res, 'Campaign story updated successfully', {
      story: campaign.story
    });

  } catch (err) {
    console.error('Set story error:', err);
    return sendError(res, 'Failed to update campaign story');
  }
};

exports.completeFundraiser = async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.campaignId);

    if (!campaign) {
      return sendError(res, 'Campaign not found', {
        errorCode: 'CAMPAIGN_NOT_FOUND',
        status: 404
      });
    }

    if (campaign.owner !== req.userId) {
      return sendError(res, 'User not authorized', {
        errorCode: 'UNAUTHORIZED_USER',
        status: 401
      });
    }

    campaign.isComplete = true;
    await campaign.save();

    return sendSuccess(res, 'Campaign marked as complete', {
      campaignId: campaign.id,
      isComplete: campaign.isComplete
    });

  } catch (err) {
    console.error('Complete fundraiser error:', err);
    return sendError(res, 'Failed to complete fundraiser');
  }
};

exports.getCampaigns = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
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
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    const responseData = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalCampaigns: total,
      campaigns: campaigns.map(c => c.toJSON())
    };

    return sendSuccess(res, 'Campaigns fetched successfully', responseData);

  } catch (err) {
    console.error('Get campaigns error:', err);
    return sendError(res, 'Failed to fetch campaigns');
  }
};
  
  
exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.campaignId, {
      include: [
        {
          model: Country,
          attributes: ['id', 'country', 'currency'],
        },
        {
          model: Category,
          attributes: ['id', 'name'],
        },
        {
          model: Beneficiary,
          attributes: ['id', 'name'],
        }
      ],
    });

    if (!campaign) {
      return sendError(res, 'Campaign not found', {
        errorCode: 'CAMPAIGN_NOT_FOUND',
        status: 404
      });
    }

    return sendSuccess(res, 'Campaign retrieved successfully', campaign.toJSON());

  } catch (err) {
    console.error('Get campaign by ID error:', err);
    return sendError(res, 'Failed to retrieve campaign');
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

    if (!campaign) {
      return sendError(res, 'Campaign not found', {
        errorCode: 'CAMPAIGN_NOT_FOUND',
        status: 404
      });
    }

    return sendSuccess(res, 'Campaign retrieved successfully', campaign.toJSON());

  } catch (err) {
    console.error('Error fetching campaign by slug:', err);
    return sendError(res, 'Failed to retrieve campaign by slug');
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

    return sendSuccess(res, 'User campaigns retrieved successfully', campaigns.map(c => c.toJSON()));

  } catch (err) {
    console.error('Error fetching user campaigns:', err);
    return sendError(res, 'Failed to fetch user campaigns');
  }
};

exports.updateCampaign = async (req, res) => {
  const { title, description, deadline, category, story, coverPhoto } = req.body;

  try {
    let campaign = await Campaign.findByPk(req.params.campaignId);

    if (!campaign) {
      return sendError(res, 'Campaign not found', {
        errorCode: 'CAMPAIGN_NOT_FOUND',
        status: 404
      });
    }

    if (campaign.owner !== req.userId) {
      return sendError(res, 'User not authorized', {
        errorCode: 'UNAUTHORIZED_USER',
        status: 401
      });
    }

    // Update fields conditionally
    if (title) campaign.title = title;
    if (description) campaign.description = description;
    if (deadline) campaign.deadline = deadline;
    if (story) campaign.story = story;
    if (coverPhoto) campaign.coverPhoto = coverPhoto;

    // Validate and update category
    if (category) {
      const categoryId = parseInt(category, 10);
      const validCategory = await Category.findByPk(categoryId);
      if (!validCategory) {
        return sendError(res, 'Invalid category ID', {
          errorCode: 'INVALID_CATEGORY_ID',
          status: 400
        });
      }
      campaign.categoryId = categoryId;
    }

    await campaign.save();

    return sendSuccess(res, 'Campaign updated successfully', campaign.toJSON());

  } catch (err) {
    console.error('Update campaign error:', err);
    return sendError(res, 'Failed to update campaign');
  }
};

exports.uploadImages = async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.campaignId);

    if (!campaign) {
      return sendError(res, 'Campaign not found', {
        errorCode: 'CAMPAIGN_NOT_FOUND',
        status: 404
      });
    }

    if (campaign.owner !== req.userId) {
      return sendError(res, 'User not authorized', {
        errorCode: 'UNAUTHORIZED_USER',
        status: 401
      });
    }

    if (campaign.media && campaign.media.length > 0) {
      return sendError(res, 'Media already uploaded. Cannot upload more.', {
        errorCode: 'MEDIA_ALREADY_EXISTS',
        status: 400
      });
    }

    if (!req.files || req.files.length === 0) {
      return sendError(res, 'No media files uploaded', {
        errorCode: 'NO_MEDIA_FILES',
        status: 400
      });
    }

    // Cloudinary upload
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

    campaign.media = [...(campaign.media || []), ...uploadedImageUrls];
    await campaign.save();

    return sendSuccess(res, 'Media uploaded successfully', {
      media: campaign.media
    });

  } catch (err) {
    console.error('Upload images error:', err);
    return sendError(res, 'Failed to upload media');
  }
}; 

exports.reviewCampaign = async (req, res) => {
  const { campaignId, action } = req.body; // action: 'approve' or 'reject'

  try {
    const campaign = await Campaign.findByPk(campaignId);

    if (!campaign) {
      return sendError(res, 'Campaign not found', {
        errorCode: 'CAMPAIGN_NOT_FOUND',
        status: 404
      });
    }

    if (!['approve', 'reject'].includes(action)) {
      return sendError(res, 'Invalid action. Must be either "approve" or "reject".', {
        errorCode: 'INVALID_REVIEW_ACTION',
        status: 400
      });
    }

    campaign.status = action === 'approve' ? 'approved' : 'rejected';
    await campaign.save();

    return sendSuccess(res, `Campaign ${action}d successfully`, {
      campaignId: campaign.id,
      newStatus: campaign.status
    });

  } catch (err) {
    console.error('Review campaign error:', err);
    return sendError(res, 'Failed to review campaign');
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

    const analytics = {
      campaignCount: campaigns.length,
      totalRaised,
      totalContributors
    };

    return sendSuccess(res, 'User campaign analytics retrieved successfully', analytics);

  } catch (err) {
    console.error('Error getting campaign analytics:', err);
    return sendError(res, 'Failed to fetch campaign analytics');
  }
};

exports.getCampaignStats = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const frequency = req.query.frequency || 'monthly'; // 'daily' or 'monthly'

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
      return sendError(res, 'Campaign not found or not eligible', {
        errorCode: 'CAMPAIGN_NOT_FOUND',
        status: 404
      });
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

    const responseData = {
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
    };

    return sendSuccess(res, 'Campaign statistics retrieved successfully', responseData);

  } catch (err) {
    console.error('Error getting campaign stats:', err);
    return sendError(res, 'Failed to retrieve campaign statistics');
  }
};

exports.getCampaignEnums = (req, res) => {
  return sendSuccess(res, 'Campaign enums retrieved successfully', {
    africanCurrencies: CampaignEnums.africanCurrencies,
    internationalCurrencies: CampaignEnums.internationalCurrencies,
    categories: CampaignEnums.categories,
    beneficiaries: CampaignEnums.beneficiaries,
  });
};