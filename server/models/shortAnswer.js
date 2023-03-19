let mongoose = require('mongoose');

let ShortAnswer = mongoose.Schema
(
    {
        questionID:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SurveyQuestion'
        },
        response:
        {
            type: String,
            default: '',
            trim: true
        }
    },

    {
        collection: "shortAnswerResponses"
    }
);

module.exports = mongoose.model('ShortAnswer', ShortAnswer);