let express = require('express');
let router = express.Router();

let indexController = require('../controllers/index');

// authentication guard function
function requireAuth(req, res, next)
{
    // check if user is logged in
    if (!req.isAuthenticated())
    {
        return res.redirect('/login');
    }
    next();
}

/* GET  HOME page. */
router.get('/', indexController.displayHomePage);

/* GET  HOME page. */
router.get('/home', indexController.displayHomePage);

/* GET ABOUT US page. */
router.get('/about', indexController.displayAboutPage);

/* GET CONTACT US page. */
router.get('/contact', indexController.displayContactPage);

/* GET MY SURVEYS page. */
router.get('/mysurveys', requireAuth, indexController.displayMySurveysPage);

// short answer survey creation
router.get('/surveys/create', requireAuth, indexController.displaySurveyCreatePage);

router.get('/surveys/update/:id', requireAuth, indexController.displaySurveyUpdatePage);

router.post('/surveys/update/:id', requireAuth, indexController.processSurveyUpdate);

// GET publish survey
router.get('/surveys/publish/:id', requireAuth, indexController.processSurveyPublish);

// GET survey question CREATE page
router.get('/surveys/update/addquestion/:id', requireAuth, indexController.displayQuestionCreatePage);

router.post('/surveys/update/addquestion/:id', requireAuth, indexController.processQuestionCreatePage);

// GET Create new multiple choice question
router.get('/surveys/update/addmultiplechoice/:id', requireAuth, indexController.processCreateMultipleChoiceQuestion);

router.get('/surveys/update/question/addoption/:questionID', requireAuth, indexController.processAddMultipleChoiceOption);

router.get('/surveys/update/question/option/:optionID', requireAuth, indexController.displayMultipleChoiceOptionUpdate);

router.post('/surveys/update/question/option/:optionID', requireAuth, indexController.processMultipleChoiceOptionUpdate);

router.get('/surveys/update/question/option/delete/:optionID', requireAuth, indexController.processDeleteMultipleChoiceOption);

// update survey question
router.get('/surveys/update/question/:questionID', requireAuth, indexController.displayQuestionUpdatePage);

router.post('/surveys/update/question/:questionID', requireAuth, indexController.processQuestionUpdatePage);

// GET delete survey question
router.get('/surveys/update/question/delete/:questionID', requireAuth, indexController.processDeleteQuestion);

// short answer survey response
router.get('/surveys/respond/:id', indexController.displaySurveyRespondPage);

router.post('/surveys/respond/:id', indexController.processSurveyRespondPage);

// view survey responses
router.get('/surveys/:id', requireAuth, indexController.displaySurveyDataPage);

// view survey question responses
router.get('/surveys/question/:id', requireAuth, indexController.displayQuestionDataPage);

// POST delete survey (and all its answers)
router.get('/surveys/delete/:id', requireAuth, indexController.processDeleteSurvey);

/* GET Route for displaying the Login page */
router.get('/login', indexController.displayLoginPage);

/* POST Route for processing the Login page */
router.post('/login', indexController.processLoginPage);

/* GET Route for displaying the Register page */
router.get('/register', indexController.displayRegisterPage);

/* POST Route for processing the Register page */
router.post('/register', indexController.processRegisterPage);

/* GET to perform User Logout */
router.get('/logout', indexController.performLogout);

module.exports = router;
