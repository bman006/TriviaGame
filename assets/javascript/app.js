

//Object array for all questions
//When user plays game, object will have additional keys added to track information
//		i)		result(correct, incorrect, timeout)
//		ii)		Time it took to answer question
//Object will be created with an API in final phase
//User can select difficulty and category on start screen
var TriviaGame = {
	//Store question and answer information
	questions: 						[],			//Array for storing question prompt and answers
	timePerQuestion: 				20, 		//How long to give user to answer question. Units in seconds
	timeToReview: 					5,			//How long to wait after answering question before loading next one. Units in seconds
	numAnswers: 					4,			//How many possible answers are there for every question
	questionCounter: 				0,			//Counter for which question is current
	answerIndexCounter: 			0,			//Counter for master answer index attribute
	correctAnswers: 				0,			//Tally for total questions answered correctly
	incorrectAnswers: 				0,			//Tally for total questions answered incorrectly
	intervalId: 					0,			//Placeholder key so updateTimerDisplay() interval can be cleared globally
	timeOuts: 						0, 			//Tally for total questions not answered before time out
	timedOut: 						false,		//For use when timer runs out in resolveQuestion function
	cumulativeCorrectAnswers: 		0,			//Correct answers across all games
	cumulativeIncorrectAnswers: 	0,			//Incorrect answers across all games
	cumulativeTimeouts: 			0,			//Timeouts across all games
	newGame: 						true,

	initialize: function() {
		var obj = this;
		obj.timedOut = false;
		if (obj.newGame === true) {
			obj.newGame = false;
			obj.getQuestions(obj);
		}
		else {
			obj.createQuestionBox(obj);
			window.scrollTo(0,0);
			var timerType = 'question';
			obj.runTimer(obj, timerType);
		}
	},

	//Use AJAX to get the questions and answers from an API
	getQuestions: function(obj) {
		//Clear current questions
		obj.questions = [];

		//create API url
		var numberOfQuestions = '5';
		var queryurl = 'https://opentdb.com/api.php?amount=' + numberOfQuestions + '&type=multiple';

		//Get info
		$.ajax({url: queryurl, method: 'get'})
			//Store question information
			.done(function(response){
				console.log(response);
				var results = response.results;
				var wrongAnswerTemp = [];

				for (var i = 0; i < results.length; i++) {
					for (var j = 0; j < results[i].incorrect_answers.length; j++) {
						wrongAnswerTemp[j] = obj.textDecoder(results[i].incorrect_answers[j]);
					}
					obj.questions[i] = {
						question: 		obj.textDecoder(results[i].question),
						correctAnswer: 	obj.textDecoder(results[i].correct_answer),
						wrongAnswer: 	wrongAnswerTemp,
					};
				}
				obj.createQuestionBox(obj);
				window.scrollTo(0,0);
				var timerType = 'question';
				obj.runTimer(obj, timerType);
			});
	},

	//Generate HTML for container with question, answers, and timer
	createQuestionBox: function(obj) {
		//Create element structure
		var newQuestionBox 			= $('<div>').addClass('question-box');
		var questionSlot 			= $('<div>').addClass('question-prompt').text(obj.questions[obj.questionCounter].question);
		var timeSlot 				= $('<div>').addClass('time-display').attr('question-number',obj.questionCounter);
		var answerList 				= $('<ol>').attr('answer-selected', 'no');

		answerList.addClass('answer-list').attr('type', 'a').attr('question-number',obj.questionCounter);

		//Create attributes to reference element based on which button is selected by user
		var AnswerListItems = '';
		for (i = 0; i < obj.numAnswers; i++) {
			AnswerListItems += '<li><button class="btn btn-answer" answer-index='+obj.answerIndexCounter+' active-answer="yes" current-selection="no"></button></li>';
			obj.answerIndexCounter++;
		}

		answerList.append(AnswerListItems);

		newQuestionBox
			.append(questionSlot)
			.append(timeSlot)
			.append(answerList)

		$('main').prepend(newQuestionBox);

		//Add event handlers for when selecting answers
		$('.btn-answer').click(function() {
			$(this).attr('current-selection', 'yes');
			TriviaGame.resolveQuestion();
		});
		obj.nextQuestion(obj);
	},

	//Insert answer text into buttons after generating question container
	nextQuestion: function(obj) {
		var questions = obj.questions;
		var questionCounter = obj.questionCounter;

		//Generate number to randomly select which button has the correct answer
		var correctAnswerSlot = Math.floor(Math.random() * obj.numAnswers);
		//Insert the correct answer text into the HTML
		$('ol[question-number='+questionCounter+']').children().children().eq(correctAnswerSlot).text(questions[questionCounter].correctAnswer);

		//Load the incorrect answers into the remaining buttons
		var j = 0;
		for (var i=0; i < obj.numAnswers; i++) {
			if($('ol[question-number='+questionCounter+']').children('li').children('button').eq(i).text() === "") {
				$('ol[question-number='+questionCounter+']').children('li').children('button').eq(i).text(questions[questionCounter].wrongAnswer[j]);
				j++;
			}
		}
	},

	//Set up the timer based on if user is in the question or review stage, and which question is current
	runTimer: function(obj, timerType) {
		var timerDisplay = $('div.time-display[question-number='+obj.questionCounter+']');
		var timerText;
		if (timerType === 'question') {
			var timeLeft = obj.timePerQuestion;
			timerText = 'Seconds left: <br>';
		}
		else if (timerType === 'review') {
			var timeLeft = obj.timeToReview;
			timerText = 'Next question in: <br>';
		}
		obj.updateTimerDisplay(obj, timerType, timeLeft, timerDisplay, timerText);
	},

	//Update the user display per the interval timer now running
	updateTimerDisplay: function(obj, timerType, timeLeft, timerDisplay, timerText) {
		//Interval for answering a question
		obj.stopAnyInterval();
		obj.intervalId = setInterval(function(){
			if (timeLeft >= 0) {
				timerDisplay.html(timerText + timeLeft);
				timeLeft--;
			}
			else {
				if (timerType === 'question') {
					obj.timedOut = true;
					obj.resolveQuestion();
				}
				else if (timerType === 'review') {
					obj.stopAnyInterval();
					obj.questionCounter++;
					obj.initialize();
				}
			}
		}, 1000);
	},

	//This function handles logic for checking answer correctness based on either user submission or timeout conditions
	resolveQuestion: function() {
		var obj = this;
		//stop timer
		obj.stopAnyInterval();
		
		//Store container for this set of answers
		var currentAnswers = $('ol[question-number='+ obj.questionCounter +']');
		var currentQuestion = obj.questions[obj.questionCounter];
		
		//disable buttons
		$('.btn-answer').prop('disabled', true);

		//Check answer condition
		if(obj.timedOut === false) {
			//get answer
			var answer = currentAnswers.find('button[current-selection=yes]').text();

			//If answer is correct
			if(answer === currentQuestion.correctAnswer) {
				currentQuestion.result = 'Correct';
				obj.correctAnswers++;
			}
			//If answer is incorrect
			else {
				currentQuestion.result = 'Incorrect';
				obj.incorrectAnswers++;
			}
		}
		//If no answer before time out
		else {
			currentQuestion.result = 'Time out...';
			obj.timeOuts++;	
		}
		
		//Reformat answer buttons based on answer result
		obj.reformatButtons(obj, currentQuestion, currentAnswers, answer);

		//Check if there are any questions left to ask
		if ((obj.questionCounter + 1) < obj.questions.length) {
			//Reinitialize the game
			//Update timer to show how long until the next questions
			var timerType = 'review';
			obj.runTimer(obj, timerType);
		}
			//or finish the game
		else {
			obj.noMoreQuestions(obj);
		}
	},

	//Reformat buttons styles depending on correct, incorrect, time out conditions
	reformatButtons: function(obj, currentQuestion, currentAnswers, answer) {
		//get the number of which attribute number to start with	
		var startingAnswer = obj.questionCounter * obj.numAnswers;			
		for (i = 0; i < obj.numAnswers; i++) {
			//call the answer to be formatted in this loop
			var buttonToFormat = currentAnswers.find('button[answer-index='+ startingAnswer +']')
			//Was this button selected and incorrect?
			if (buttonToFormat.text() === answer && currentQuestion.result === 'Incorrect') {
				buttonToFormat.addClass('btn-incorrect');
			}
			//Is this button the correct answer?
			else if (buttonToFormat.text() === currentQuestion.correctAnswer) {
				buttonToFormat.addClass('btn-correct');
			}
			else {	
				buttonToFormat.addClass('btn-not-selected');
			}
			startingAnswer++;
		}
	},

	//When there are no more questions.....
	noMoreQuestions: function(obj) {
		//Create elements for game summary box
		var summaryBuildBox	 				= $('<div>').addClass('summary-box');
		var summaryBuildCorrect 			= $('<div>').addClass('summary-correct');
		var summaryBuildIncorrect 			= $('<div>').addClass('summary-incorrect');
		var summaryBuildTimeout 			= $('<div>').addClass('summary-timeout');
		var summaryBuildScore				= $('<div>').addClass('summary-score');
		var summaryBuildCumulativeScore		= $('<div>').addClass('summary-score');
		var summaryBuildRestart				= $('<button>').addClass('btn btn-restart');

		//Update cumulative tallys
		obj.cumulativeCorrectAnswers 		+= obj.correctAnswers;
		obj.cumulativeIncorrectAnswers		+= obj.incorrectAnswers;
		obj.cumulativeTimeouts				+= obj.timeOuts;

		//Calculate score %'s
		var score 		= ((obj.correctAnswers / (obj.correctAnswers + obj.incorrectAnswers + obj.timeOuts)) * 100).toFixed(0);
		var totalScore 	= ((obj.cumulativeCorrectAnswers / (obj.cumulativeCorrectAnswers + obj.cumulativeIncorrectAnswers + obj.cumulativeTimeouts)) * 100).toFixed(0);

		//Fill in text
		summaryBuildCorrect 				.html('Correct:<br>' + obj.correctAnswers);
		summaryBuildIncorrect 				.html('Incorrect:<br>' + obj.incorrectAnswers);
		summaryBuildTimeout 				.html('Timeouts:<br>' + obj.timeOuts);
		summaryBuildScore 					.html('Score:<br>' + score + '%');
		summaryBuildCumulativeScore			.html('Total Score:<br>' + totalScore + '%');
		summaryBuildRestart 				.html('Play Again?');

		//Put everything together
		summaryBuildBox
			.append(summaryBuildCorrect)
			.append(summaryBuildIncorrect)
			.append(summaryBuildTimeout)
			.append(summaryBuildScore)
			.append(summaryBuildCumulativeScore)
			.append(summaryBuildRestart)

		$('main').prepend(summaryBuildBox);

		//Add event handlers for when selecting answers
		$('.btn-restart').click(function() {
			obj.restart(obj);
		});
	},

	//How to restart the game if the user selects to
	restart: function(obj) {

		//Reset variables for new game 
		obj.questionCounter 		= 0;
		obj.correctAnswers 			= 0;
		obj.incorrectAnswers 		= 0;
		obj.timeOuts 				= 0;
		obj.answerIndexCounter		= 0;
		obj.newGame 				= true;

		//Remove all html elements that were created in this game
		$('main').html('');

		obj.initialize();
	},

	//Clear whatever interval is currently running
	stopAnyInterval: function() {
		clearInterval(this.intervalId);
	},

	//Decode HTML text into normal text that is received from the API
	textDecoder: function(text) {
		var tempBin = $('<div>');
		tempBin.html(text);
		return tempBin.text();
	},
}

TriviaGame.initialize();