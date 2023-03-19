let mongoose = require('mongoose');

let MultipleChoice = mongoose.Schema
(
    {
        questionID:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SurveyQuestion'
        },
        option:
        {
            type: String,
            default: '',
            trim: true
        },
        responses:
        {
            type: Number,
            default: 0
        }
    },

    {
        collection: "multipleChoiceResponses"
    }
);

module.exports = mongoose.model('MultipleChoice', MultipleChoice);