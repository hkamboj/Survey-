let mongoose = require('mongoose');
const surveyQuestion = require('./surveyQuestion');

let Survey = mongoose.Schema
(
    {
        creator:
        {
            type: String,
            default: '',
            trim: true
        },    
        title:
        {
            type: String,
            default: '',
            trim: true
        },
        created:
        {
            type: Date,
            default: Date.now,
        },
        expires:
        {
            type: Date,
            default: Date.now
        },
        head:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SurveyQuestion'
        },
        tail:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SurveyQuestion'
        },
        published:
        {
            type: Boolean,
            default: false
        }
    },

    {
        collection: "surveys"
    }
);

module.exports = mongoose.model('Survey', Survey);