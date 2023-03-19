let mongoose = require('mongoose');

let SurveyQuestion = mongoose.Schema
(
    {
        surveyID:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Survey'
        },  
        question:
        {
            type: String,
            default: '',
            trim: true
        },
        questionType:
        {
            type: String,
            enum: ['shortAnswer', 'multipleChoice'],
            default: 'shortAnswer'
        },
        prev:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SurveyQuestion'
        },
        next:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SurveyQuestion'
        }
    },

    {
        collection: "surveyQuestions"
    }
);

module.exports = mongoose.model('SurveyQuestion', SurveyQuestion);