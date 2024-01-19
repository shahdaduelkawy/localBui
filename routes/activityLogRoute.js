const express = require('express');
const router= express.Router();
const{getActivities}= require('../services/activityLogService')

router.get('/activities/:userId', async(req, res) => {
const userId = req.params.userId;

try {

    const activities = await getActivities(userId);
    res.status(200).json({success:true,activities})
}
catch (err) {
    console.error(err);
    res.status(500).json({success:false,message: "Internal Server Error"})

}})
module.exports = router;
