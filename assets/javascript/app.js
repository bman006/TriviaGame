//https://opentdb.com/
//https://opentdb.com/api.php?amount=10&type=multiple

//Object array for all questions
//When user plays game, object will have additional keys added to track information
//		i)		result(correct, incorrect, timeout)
//		ii)		Time it took to answer question
//Object will be created with an API in final phase
//User can select difficulty and category on start screen
var TriviaGame = {
	//Store question and answer information
	questions: [
		{
			question: 'Who was given the title "Full Metal" in the anime series "Full Metal Alchemist"?',
			correctAnswer: "Edward Elric", 
			wrongAnswer: ["Alphonse Elric", "Van Hohenheim", "Izumi Curtis"]
		},
		{
			question: "second question",
			correctAnswer: 'correct', 
			wrongAnswer: ['wrong 1', 'wrong 2',	'wrong 3']
		},
		{
			question: "third question",
			correctAnswer: 'correct', 
			wrongAnswer: ['wrong 1', 'wrong 2',	'wrong 3']
		}
	],
	timePerQuestion: 	10000, 		//How long to give user to answer question. Units in seconds
	timeToReview: 		5,			//How long to wait after answering question before loading next one. Units in seconds
	numAnswers: 		4,			//How many possible answers are there for every question
	questionCounter: 	0,			//Counter for which question is current
	answerIndexCounter: 0,			//Counter for master answer index attribute
	correctAnswers: 	0,			//Tally for total questions answered correctly
	incorrectAnswers: 	0,			//Tally for total questions answered incorrectly
	intervalId: 		0,			//Placeholder key so updateTimerDisplay() interval can be cleared globally
	timeOuts: 			0, 			//Tally for total questions not answered before time out
	timedOut: 			false,		//For use when timer runs out in resolveQuestion function

	initialize: function() {
		var obj = this;
		obj.timedOut = false;
		obj.createQuestionBox(obj);
		// this.scrollToTop();
		window.scrollTo(0,0);
		var timerType = 'question';
		obj.runTimer(obj, timerType);
	},

	//Clear whatever interval is currently running
	stopAnyInterval: function() {
		clearInterval(this.intervalId);
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
			TriviaGame.resolveQuestion(obj);
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
		$('ol[question-number='+questionCounter+']').children().children().eq(-1*correctAnswerSlot).text(questions[questionCounter].correctAnswer);

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

	//
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
	resolveQuestion: function(obj) {
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

		//Update timer to show how long until the next questions
		var timerType = 'review';
		obj.runTimer(obj, timerType);
		//Check if there are any questions left to ask
			//Reinitialize the game
			//or finish the game
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

	},

//I haven't been able to get to the bottom of why this doesn't work when I call it in the initialize function
	//Scroll to top of screen for next question
	// scrollToTop: function() {
	// 	var obj = this;
	// 	obj.stopAnyInterval();
	// 	obj.intervalId = setInterval(function(){
	// 		if (window.scrollY > 5) {
	// 			window.scrollBy(0,-5);
	// 		}
	// 		else {
	// 			window.scrollTo(0,0);
	// 			obj.stopAnyInterval();
	// 		}
	// 	}, 10);
	// },
}

TriviaGame.initialize();