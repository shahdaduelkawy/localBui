const mongoose = require('mongoose')

const activitySchema = new mongoose.Schema(
    {
        userID:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref: "User"
        },
        activityType:{
            type: String,
            required:true
        },
        details:{
            type: String,
            required:true
        },
        timeStamp:{
            type: Date,
            default: Date.now()
        },

    }
)
const Activity= mongoose.model('activities', activitySchema);
module.exports = Activity;
//hello