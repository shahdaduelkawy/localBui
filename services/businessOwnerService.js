const BusinessOwner = require("../models/businessOwnerModel");

const BusinessOwnerService = {
  async getUserBusiness(ownerID) {
    try {
      const businessData = await BusinessOwner.findOne({
        userId: ownerID,
      });

      return businessData;
    } catch (error) {
      console.error("Error retrieving user business:", error);
      return null;
    }
  },
  async uploadImage(ownerID, file) {
    try {
      const updateResult = await BusinessOwner.updateOne(
        {
          userId: ownerID,
        },
        {
          attachment: file.path,
        }
      );
      return updateResult;
    } catch (error) {
      return error.message;
    }
  },
  async uploadedmedia(ownerID, file) {
    try {
      const updateResultm = await BusinessOwner.updateOne(
        {
          userId: ownerID,
        },
        {
          media: file.path,
        }
      );
      return updateResultm;
    } catch (error) {
      return error.message;
    }
  },
  async updateUserBusiness(ownerID, updateCriteria) {
    try {
      const updatedOwner = await BusinessOwner.findOneAndUpdate(
        {
          userId: ownerID,
        },
        updateCriteria,
        { new: true, upsert: true } // Create a new document if not found
      );

      return updatedOwner;
    } catch (error) {
      console.error("Error updating user business:", error);
      return null;
    }
  },

  async profileSetup(ownerID, updateCriteria) {
    try {
      const profileSetup = await BusinessOwner.findOneAndUpdate(
        {
          userId: ownerID,
        },
        updateCriteria,
        { new: true, upsert: true } // Create a new document if not found
      );

      return profileSetup;
    } catch (error) {
      console.error("Error updating user business:", error);
      return null;
    }
  },


  // async profileSetup(req, res) {
  //   try {
  //     const {
      
  //       description,
  //       location,
  //       attachment,
  //       address,
  //     } = req.body;

  //     // Update the owner's profile in the database
  //     const updatedOwner = await BusinessOwnerService.updateUserBusiness(
  //       businessId,
  //       {
         
  //         description: description,
  //         location: location,
  //         attachment: attachment,
  //         address: address,
  //       }
  //     );

  //     // Check if the owner with the specified ID exists
  //     if (!updatedOwner) {
  //       return res.status(404).json({ message: "Owner not found" });
  //     }

  //     // Send a success response
  //     return res
  //       .status(200)
  //       .json({ message: "Profile updated successfully", owner: updatedOwner });
  //   } catch (err) {
  //     console.error(err);
  //     return res.status(500).json({ error: "Internal Server Error" });
  //   }
  // },
};

module.exports = BusinessOwnerService;
