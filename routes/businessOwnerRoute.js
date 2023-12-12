const express = require("express");
const router = express.Router();
const upload = require("../middleware/fileUpload.middleware")

const BusinessOwnerService = require("../services/businessOwnerService");

router.get("/getMyBusiness/:ownerID", async(req, res) => {
    const ownerID = req.params.ownerID;

    try {
        const businessData = await BusinessOwnerService.getUserBusiness(ownerID);

        if (businessData) {
            res.status(200).json({ success: true, data: businessData });
        } else {
            res.status(404).json({ success: false, message: "Business not found" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

router.put("/updateMyBusinessInfo/:ownerID", async(req, res) => {
    const ownerID = req.params.ownerID;
    const data = req.body

    try {
        const updatedData = await BusinessOwnerService.updateUserBusiness(ownerID, data);

        if (updatedData) {
            res.status(200).json({ success: true, data: updatedData });
        } else {
            res.status(404).json({ success: false, message: "Business not found" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

router.post("/profileSetup/:ownerID", async (req, res) => {
    try {
        const result = await BusinessOwnerService.profileSetup(req, res);
        res.status(result.success ? 200 : 500).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});


router.patch("/updateMyBusinessAttachment/:ownerID", upload.single("img"), async (req, res) => {
    const file = req.file;
    const ownerID = req.params.ownerID;

    try {
        const uploadedImage = await BusinessOwnerService.uploadImage(ownerID, file);

        if (uploadedImage) {
            res.status(200).json({ success: true, data: uploadedImage });
        } else {
            res.status(404).json({ success: false, message: "Image Can't Be Uploaded" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});


module.exports = router;