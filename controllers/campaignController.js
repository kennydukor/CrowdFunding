const cloudinary = require('../utils/cloudinary');
const { Campaign, Country, Category, Beneficiary, User } = require('../models');

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

      // 3) Create campaign record
      const campaign = await Campaign.create({
          title,
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
  

// exports.uploadVideo = async (req, res) => {
//   try {
//       const campaign = await Campaign.findByPk(req.params.campaignId);
//       if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });

//       if (campaign.owner !== req.userId) {
//           return res.status(401).json({ msg: 'User not authorized' });
//       }

//       if (!req.file) {
//           return res.status(400).json({ msg: 'No video file uploaded' });
//       }

//       // Get video URL from Multer upload
//       campaign.videoUrl = req.file.path; // Cloudinary already provides the URL

//       await campaign.save();

//       res.status(200).json({ msg: 'Video uploaded successfully', videoUrl: campaign.videoUrl });
//   } catch (err) {
//       console.error(err);
//       res.status(500).send('Server error: ' + err.message);
//   }
// };

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


  // exports.getCampaigns = async (req, res) => {
  //   try {
  //     const campaigns = await Campaign.findAll({
  //       include: [
  //         { 
  //           model: Country, 
  //           attributes: ['id', 'country', 'currency'], // Include both 'id' and 'name' fields for Country
  //         },
  //         { 
  //           model: Category, 
  //           attributes: ['id', 'name'], // Include both 'id' and 'name' fields for Category
  //         },
  //         { 
  //           model: Beneficiary, 
  //           attributes: ['id', 'name'], // Include both 'id' and 'name' fields for Beneficiary
  //         }
  //       ],
  //     });
  
  //     // Format the result, ensuring that we handle null values for relationships
  //     const campaignsWithDetails = campaigns.map(campaign => {
  //       const campaignJson = campaign.toJSON();
  
  //       return {
  //         ...campaignJson
  //       };
  //     });
  
  //     res.json(campaignsWithDetails);
  //   } catch (err) {
  //     console.error(err);
  //     res.status(500).send('Server error');
  //   }
  // };


  exports.getCampaigns = async (req, res) => {
    try {
      const campaigns = await Campaign.findAll({
        where: {
          isComplete: true,
          status: 'approved'
        },
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
  
      const campaignsWithDetails = campaigns.map(campaign => campaign.toJSON());
  
      res.json(campaignsWithDetails);
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

exports.getCampaignEnums = (req, res) => {
    res.json({
      africanCurrencies: CampaignEnums.africanCurrencies,
      internationalCurrencies: CampaignEnums.internationalCurrencies,
      categories: CampaignEnums.categories,
      beneficiaries: CampaignEnums.beneficiaries,
    });
  };  