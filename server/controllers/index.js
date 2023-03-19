let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let passport = require('passport');

let surveys = require('../models/survey');
let surveyQuestions = require('../models/surveyQuestion');
let shortAnswers = require('../models/shortAnswer');
let multipleChoice = require('../models/multipleChoice');
let userModel = require('../models/user');
let User = userModel.User; //alias

module.exports.displayHomePage = (req, res, next) => {
    // we should cull the number of surveys that show up on this page, but for now I'm listing all of them
    surveys.find({published: true}, (err, surveys) => {
        if (err)
        {
            return console.error(err);
        }
        else
        {
            res.render('index', {
                title: 'Home',
                displayName: req.user ? req.user.displayName : '',
                surveys: surveys
            });
        }
    });
}

module.exports.displayAboutPage = (req, res, next) => {
    res.render('about', { title: 'About', displayName: req.user ? req.user.displayName : ''}); 
}

module.exports.displayContactPage = (req, res, next) => {
    res.render('contact', { title: 'Contact', displayName: req.user ? req.user.displayName : ''}); 
}

module.exports.displayMySurveysPage = (req, res, next) => {
    surveys.find((err, surveys) => {
        if (err)
        {
            return console.error(err);
        }
        else
        {
            res.render('mysurveys', {
                title: 'My Surveys',
                displayName: req.user ? req.user.displayName : '',
                surveys: surveys
            });
        }
    });
}

/*
module.exports.displayMySurveysPage = (req, res, next) => {
    res.render('mysurveys', { title: 'My Surveys', displayName: req.user ? req.user.displayName : ''}); 
}
*/

// Get surveys/update to add a new survey
module.exports.displaySurveyCreatePage = (req, res, next) => {
    let newSurvey = surveys({
        'creator': req.user.displayName,
        'title': 'New Survey'
    });

    surveys.create(newSurvey, (err, newSurvey) => {
        if(err)
        {
            return console.log(err);
        }
        else
        {
            res.redirect('/surveys/update/'+newSurvey._id);
        }
    });
}

module.exports.displaySurveyUpdatePage = (req, res, next) => {
    let id = req.params.id;

    surveys.findById(id, (err, survey) => {
        if (err)
        {
            return console.log(err);
        }
        else
        {
            surveyQuestions.find({surveyID: survey._id}, (err, surveyQuestions) => {
                if (err)
                {
                    console.log(err);
                    res.end(err);
                }
                else
                {
                    res.render('surveys/updateSurvey', {
                        title: 'Create Survey',
                        displayName: req.user ? req.user.displayName : '',
                        survey: survey,
                        surveyQuestions: surveyQuestions
                    });
                }
            });
        }
    });
}

// POST process the surveys/update page to add a new  survey
module.exports.processSurveyUpdate = (req, res, next) => {
    let id = req.params.id;

    let newSurvey = surveys({
        '_id': id,
        'creator': req.user.displayName,
        'title': req.body.title,
        'expires': req.body.expiryDate
    });

    surveys.updateOne({_id: id}, newSurvey, (err, survey) => {
        if (err)
        {
            console.log(err);
            res.end(err);
        }
        else
        {
            res.redirect('/')
        }
    });
}

module.exports.processSurveyPublish = (req, res, next) => {
    let id = req.params.id;

    surveys.updateOne({_id: id}, {published: true}, (err) => {
        if (err)
        {
            return console.log(err);
        }
        else
        {
            res.redirect('/');
        }
    });
}

// GET survey question create page
module.exports.displayQuestionCreatePage = (req, res, next) => {
    let id = req.params.id;

    surveys.findById(id, (err, survey) => {
        if (err)
        {
            return console.log(err);
        }
        else
        {
            let newSurveyQuestion = surveyQuestions({
                surveyID: survey._id,
                question: 'Survey Question',
                prev: null,
                next: null
            });

            res.render('surveys/updateQuestion', {
                title: 'Ask a Question',
                displayName: req.user ? req.user.displayName: '',
                surveyQuestion: newSurveyQuestion
            });
        }
    });
}

module.exports.processQuestionCreatePage = (req, res, next) => {
    let id = req.params.id;

    surveys.findById(id, (err, survey) => {
        if (err)
        {
            console.log(err);
            res.end(err);
        }
        else
        {
            let prev = undefined;
            if (survey.tail != null)
            {
                prev = survey.tail;
            }
            let newSurveyQuestion = surveyQuestions({
                surveyID: survey._id,
                question: req.body.question,
                prev: prev
            });

            surveyQuestions.create(newSurveyQuestion, (err, surveyQuestion) => {
                if (err)
                {
                    console.log(err);
                    res.end(err);
                }
                else
                {
                    if (survey.tail != null)
                    {
                        surveyQuestions.updateOne({_id: survey.tail}, {'next': surveyQuestion._id}, (err, question) => {
                            if (err)
                            {
                                console.log(err);
                                res.end(err);
                            }
                        });
                        surveys.updateOne({_id: survey._id}, {'tail': surveyQuestion._id}, (err, survey) => {
                            if (err)
                            {
                                console.log(err);
                                res.end(err);
                            }
                        });
                    }
                    else
                    {
                        surveys.updateOne({_id: survey._id}, {'tail': surveyQuestion._id, 'head': surveyQuestion._id}, (err, survey) => {
                            if (err)
                            {
                                console.log(err);
                                res.end(err);
                            }
                        });
                    }
                    res.redirect('/surveys/update/'+id);
                }
            })
        }
    });
}

module.exports.processCreateMultipleChoiceQuestion = (req, res, next) => {
    let id = req.params.id;

    surveys.findById(id, (err, survey) => {
        if (err)
        {
            return console.log(err);
        }
        else
        {
            let prev = undefined;
            if (survey.tail != null)
            {
                prev = survey.tail;
            }
            let newSurveyQuestion = surveyQuestions({
                surveyID: survey._id,
                question: 'question',
                questionType: 'multipleChoice',
                prev: prev
            });
            surveyQuestions.create(newSurveyQuestion, (err, surveyQuestion) => {
                if (err)
                {
                    console.log(err);
                    res.end(err);
                }
                else
                {
                    if (survey.tail != null)
                    {
                        surveyQuestions.updateOne({_id: survey.tail}, {'next': surveyQuestion._id}, (err, question) => {
                            if (err)
                            {
                                console.log(err);
                                res.end(err);
                            }
                        });
                        surveys.updateOne({_id: survey._id}, {'tail': surveyQuestion._id}, (err, survey) => {
                            if (err)
                            {
                                console.log(err);
                                res.end(err);
                            }
                        });
                    }
                    else
                    {
                        surveys.updateOne({_id: survey._id}, {'tail': surveyQuestion._id, 'head': surveyQuestion._id}, (err, survey) => {
                            if (err)
                            {
                                console.log(err);
                                res.end(err);
                            }
                        });
                    }
                    res.redirect('/surveys/update/question/'+surveyQuestion._id);
                }
            });
        }
    });
}

module.exports.processAddMultipleChoiceOption = (req, res, next) => {
    let questionID = req.params.questionID;

    surveyQuestions.findById(questionID, (err, surveyQuestion) => {
        if (err)
        {
            console.log(err);
            res.end(err);
        }
        else
        {
            let newMultipleChoice = multipleChoice({
                'questionID': questionID,
                'option': 'option'
            });

            multipleChoice.create(newMultipleChoice, (err, newOption) => {
                if (err)
                {
                    console.log(err);
                    res.end(err);
                }
                else
                {
                    res.redirect('/surveys/update/question/option/' + newOption._id);
                }
            });
        }
    });
}

module.exports.displayMultipleChoiceOptionUpdate = (req, res, next) => {
    let optionID = req.params.optionID;

    multipleChoice.findById(optionID, (err, mCOption) => {
        if (err)
        {
            return console.log(err);
        }
        else
        {
            res.render('surveys/updateMCOption', {
                title: 'Edit Option',
                displayName: req.user ? req.user.displayName : '',
                option: mCOption
            });
        }
    });
}

module.exports.processMultipleChoiceOptionUpdate = (req, res, next) => {
    let optionID = req.params.optionID;

    multipleChoice.findOneAndUpdate({_id: optionID}, {'option': req.body.question}, (err, mCOption) => {
        if (err)
        {
            console.log(err);
            res.end(err);
        }
        else
        {
            res.redirect('/surveys/update/question/' + mCOption.questionID);
        }
    })
}

module.exports.processDeleteMultipleChoiceOption = (req, res, next) => {
    let optionID = req.params.optionID;

    multipleChoice.findById(optionID, (err, mCOption) => {
        if (err)
        {
            console.log(err);
            res.end(err);
        }
        else
        {
            let questionID = mCOption.questionID;
            multipleChoice.deleteOne({_id: optionID}, (err) => {
                if (err)
                {
                    console.log(err);
                    res.end(err);
                }
                else
                {
                    res.redirect('/surveys/update/question/' + questionID);
                }
            });
        }
    });
}

// GET survey question update page
module.exports.displayQuestionUpdatePage = (req, res, next) => {
    let questionID = req.params.questionID;

    surveyQuestions.findById(questionID, (err, surveyQuestion) => {
        if (err)
        {
            return console.log(err);
        }
        else
        {
            if (surveyQuestion.questionType == 'multipleChoice')
            {
                multipleChoice.find({questionID: surveyQuestion._id}, (err, mCOptions) => {
                    if (err)
                    {
                        return console.log(err);
                    }
                    else
                    {
                        res.render('surveys/updateQuestion', {
                            title: 'Update Question',
                            displayName: req.user ? req.user.displayName : '',
                            surveyQuestion: surveyQuestion,
                            options: mCOptions
                        });
                    }
                });
            }
            else
            {
                res.render('surveys/updateQuestion', {
                    title: 'Update Question',
                    displayName: req.user ? req.user.displayName : '',
                    surveyQuestion: surveyQuestion,
                    options: ''
                });
            }
        }
    });
}

module.exports.processQuestionUpdatePage = (req, res, next) => {
    let questionID = req.params.questionID;
    
    surveyQuestions.findOneAndUpdate({_id: questionID}, {'question': req.body.question}, (err, surveyQuestion) => {
        if (err)
        {
            console.log(err);
            res.end(err);
        }
        else
        {
            console.log(surveyQuestion.surveyID);
            res.redirect('/surveys/update/'+surveyQuestion.surveyID);
        }
    });
}

// GET survey response page and respond to a survey
module.exports.displaySurveyRespondPage = (req, res, next) => {
    let id = req.params.id;

    surveyQuestions.findById(id, (err, question) => {
        if (err)
        {
            return console.log(err);
        }
        else
        {
            if (question.questionType == 'multipleChoice')
            {
                // find all options for this question
                multipleChoice.find({questionID: question._id}, (err, mCOptions) => {
                    if (err)
                    {
                        return console.log(err);
                    }
                    else
                    {
                        res.render('surveys/respond', {
                            title: 'Respond to Survey',
                            displayName: req.user ? req.user.displayName : '',
                            question: question,
                            options: mCOptions
                        });
                    }
                });
            }
            else
            {
                res.render('surveys/respond', {
                title: 'Respond to Survey',
                displayName: req.user ? req.user.displayName : '',
                question: question
            });
            }
        }
    });
}

module.exports.processSurveyRespondPage = (req, res, next) => {
    let id = req.params.id;

    surveyQuestions.findById(id, (err, question) => {
        if (err)
        {
            console.log(err);
            res.end(err);
        }
        else
        {
            if (question.questionType == 'multipleChoice')
            {
                multipleChoice.findOne({option: req.body.response}, (err, mCOption) => {
                    if (err)
                    {
                        console.log(err);
                        res.end(err);
                    }
                    else
                    {
                        multipleChoice.findByIdAndUpdate(mCOption._id, {responses: mCOption.responses + 1}, (err, mCOption) => {
                            if (err)
                            {
                                console.log(err);
                                res.end(err);
                            }
                            else
                            {
                                if (question.next)
                                {
                                    res.redirect('/surveys/respond/'+question.next);
                                }
                                else
                                {
                                    res.redirect('/');
                                }
                            }
                        });
                    }
                });
            }
            else
            {
                let newResponse = shortAnswers({
                    'questionID': question._id,
                    'response': req.body.response
                });

                shortAnswers.create(newResponse, (err, shortAnswer) => {
                    if (err)
                    {
                        console.log(err);
                        res.end(err);
                    }
                    else
                    {
                        if (question.next)
                        {
                            res.redirect('/surveys/respond/'+question.next);
                        }
                        else
                        {
                            res.redirect('/');
                        }
                    }
                });
            }
        }
    });
}

module.exports.displaySurveyDataPage = (req, res, next) => {
    let id = req.params.id;

    // first check if the survey exists
    surveys.findById(id, (err, survey) => {
        if (err)
        {
            return console.log(err);
        }
        else
        {
            // then find all answers belonging to that survey
            surveyQuestions.find({surveyID: id}, (err, questions) => {
                if (err)
                {
                    return console.log(err);
                }
                else
                {
                    res.render('surveys/viewSurvey', {
                        title: 'Survey Responses',
                        displayName: req.user ? req.user.displayName : '',
                        survey: survey,
                        questions: questions
                    });
                }
            });
        }
    });
}

module.exports.displayQuestionDataPage = (req, res, next) => {
    let id = req.params.id;

    surveyQuestions.findById(id, (err, question) => {
        if (err)
        {
            return console.log(err);
        }
        else
        {
            if (question.questionType == 'multipleChoice')
            {
                multipleChoice.find({questionID: question._id}, (err, responses) => {
                    if (err)
                    {
                        return console.log(err);
                    }
                    else
                    {
                        res.render('surveys/viewResponses', {
                            title: 'Responses',
                            displayName: req.user ? req.user.displayName : '',
                            question: question,
                            responses: responses
                        });
                    }
                });
            }
            else
            {
                shortAnswers.find({questionID: question._id}, (err, responses) => {
                    if (err)
                    {
                        return console.log(err);
                    }
                    else
                    {
                        res.render('surveys/viewResponses', {
                            title: 'Responses',
                            displayName: req.user ? req.user.displayName : '',
                            question: question,
                            responses: responses
                        });
                    }
                });
            }
        }
    });
}

module.exports.processDeleteSurvey = (req, res, next) => {
    let id = req.params.id;

    surveyQuestions.find({surveyID: id}, (err, questions) => {
        if (err)
        {
            return console.log(err);
        }
        else if (questions.length > 0)
        {
            for (var i = 0; i < questions.length; i++)
            {
                // remove short answers belonging to the question
                shortAnswers.deleteMany({questionID: questions[i]._id}, (err) => {
                    if (err)
                    {
                        console.log(err);
                        res.end(err);
                    }
                });

                // remove all multiple choice responses belonging to the quesiton
                multipleChoice.deleteMany({questionID: questions[i]._id}, (err) => {
                    if (err)
                    {
                        console.log(err);
                        res.end(err);
                    }
                });
            }
        }
    });

    surveyQuestions.deleteMany({surveyID: id}, (err) => {
        if (err)
        {
            console.log(err);
            res.end(err);
        }
        else
        {
            surveys.deleteOne({_id: id}, (err) => {
                if (err)
                {
                    console.log(err);
                    res.end(err);
                }
                else
                {
                    res.redirect('/mysurveys');
                }
            });
        }
    });
}

module.exports.processDeleteQuestion = (req, res, next) => {
    let id = req.params.questionID;

    surveyQuestions.findById(id, (err, surveyQuestion) => {
        if (err)
        {
            return console.log(err);
        }
        else
        {
            let surveyID = surveyQuestion.surveyID;
            
            shortAnswers.deleteMany({questionID: surveyQuestion._id}, (err) => {
                if (err)
                {
                    return console.log(err);
                }
                else
                {
                    multipleChoice.deleteMany({questionID: surveyQuestion._id}, (err) => {
                        if (err)
                        {
                            return console.log(err);
                        }
                        else
                        {
                            // re-link the previous and next questions
                            if (!surveyQuestion.prev && !surveyQuestion.next)
                            {
                                // if we get in here, we are deleting the only question in the survey
                                surveys.updateOne({_id: surveyID}, { $unset: {head: "", tail: ""} }, (err) => {
                                    if (err)
                                    {
                                        console.log(err);
                                        res.end(err);
                                    }
                                });
                            }
                            else if (!surveyQuestion.prev)
                            {
                                // here we are deleting the survey's head
                                surveys.updateOne({_id: surveyID}, {'head': surveyQuestion.next}, (err) => {
                                    if (err)
                                    {
                                        console.log(err);
                                        res.end(err);
                                    }
                                });
                                surveyQuestions.updateOne({_id: surveyQuestion.next}, { $unset: {prev: ""}}, (err) => {
                                    if (err)
                                    {
                                        console.log(err);
                                        res.end(err);
                                    }
                                });
                            }
                            else if (!surveyQuestion.next)
                            {
                                // here, we would be deleting the survey's tail
                                surveys.updateOne({_id: surveyID}, {'tail': surveyQuestion.prev}, (err, survey) => {
                                    if (err)
                                    {
                                        console.log(err);
                                        res.end(err);
                                    }
                                });
                                surveyQuestions.updateOne({_id: surveyQuestion.prev}, { $unset: {next: ""}}, (err) => {
                                    if (err)
                                    {
                                        console.log(err);
                                        res.end(err);
                                    }
                                });
                            }
                            else
                            {
                                // here, we're somewhere in the middle so we need to link the prev and next questions to eachother
                                surveyQuestions.updateOne({_id: surveyQuestion.prev}, {'next': surveyQuestion.next}, (err, question) => {
                                    if (err)
                                    {
                                        console.log(err);
                                        res.end(err);
                                    }
                                });
                                surveyQuestions.updateOne({_id: surveyQuestion.next}, {'prev': surveyQuestion.prev}, (err, question) => {
                                    if (err)
                                    {
                                        console.log(err);
                                        res.end(err);
                                    }
                                });
                            }
                            // now we can delete the question
                            surveyQuestions.deleteOne({_id: surveyQuestion._id}, (err) => {
                                if (err)
                                {
                                    return console.log(err);
                                }
                                else
                                {
                                    res.redirect('/surveys/update/'+surveyID);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

module.exports.displayLoginPage = (req, res, next) => {
    // check if logged in already
    if(!req.user)
    {
        res.render('auth/login',
        {
            title: "Login",
            messages: req.flash('loginMessage'),
            displayName: req.user ? req.user.displayName : ''
        })
    }
    else
    {
        return res.redirect('/');
    }
}

module.exports.processLoginPage = (req, res, next) => {

        passport.authenticate('local',
    (err, user, info) => {
        // server err?
        if(err)
        {   
            return next(err);
        }
        // is there a user login error?
        if(!user)
        {
            req.flash('loginMessage', 'Authentication Error');
            return res.redirect('/login');
        }
        req.login(user, (err) => {
            // server error?
            if(err)
            {
                return next(err);
            }
            return res.redirect('/');
        });
    })(req, res, next);
}

module.exports.displayRegisterPage = (req, res, next) => {
    if(!req.user)
    {
        res.render('auth/register',
        {
            title: 'Register',
            messages: req.flash('registerMessage'),
            displayName: req.user ? req.user.displayName : ''
        });
    }
    else
    {
        return res.redirect('/');
    }
}

module.exports.processRegisterPage = (req, res, next) => {
    // instanciate a user object
    let newUser = new User({
        username: req.body.username,
        email: req.body.email,
        displayName: req.body.displayName
    });

    User.register(newUser, req.body.password, (err) => {
        if(err)
        {
            console.log("Error: Inserting New User");
            if(err.name == "UserExistsError")
            {
                req.flash(
                    'registerMessage',
                    'Registration Error: User Already Exists!'
                );
                console.log('Error: User Already Exists!')
            }
            return res.render('auth/register',
            {
                title: 'Register',
                messages: req.flash('registerMessage'),
                displayName: req.user ? req.user.displayName : ''
            });
        }
        else
        {
            // if no errors, then registration is succesfull

            // redirect and authenticate user

            return passport.authenticate('local')(req, res, () => {
                res.redirect('/')
            });
        }
    });
}

module.exports.performLogout = (req, res, next) => {
    req.logout();
    res.redirect('/');
}