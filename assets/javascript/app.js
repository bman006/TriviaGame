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
	screenFreeze: 		false,		//When true, applicable setTimeout functions will halt progress

	stopAnyInterval: function() {
		clearInterval(this.intervalId);
	},

	initialize: function() {
		this.timedOut = false;
		this.nextQuestion(this.questions, this.questionCounter);
		// this.scrollToTop();
		window.scrollTo(0,0);
		var timerType = 'question';
		this.runTimer(timerType);
	},

	//Generate HTML for container with question, answers, and timer
	createQuestionBox: function() {
		//Create element structure
		var newQuestionBox 			= $('<div>').addClass('question-box');
		var questionSlot 			= $('<div>').addClass('question-prompt').text(this.questions[this.questionCounter].question);
		var timeSlot 				= $('<div>').addClass('time-display').attr('question-number',this.questionCounter);
		var answerList 				= $('<ol>').attr('answer-selected', 'no');

		answerList.addClass('answer-list').attr('type', 'a').attr('question-number',this.questionCounter);

		//Create attributes to reference element based on which button is selected by user
		var AnswerListItems = '';
		for (i = 0; i < this.numAnswers; i++) {
			AnswerListItems += '<li><button class="btn btn-answer" answer-index='+this.answerIndexCounter+' active-answer="yes" current-selection="no"></button></li>';
			this.answerIndexCounter++;
		}

		answerList.append(AnswerListItems);

		newQuestionBox
			.append(questionSlot)
			.append(timeSlot)
			.append(answerList)

		$('main').prepend(newQuestionBox);

		//Add event handlers for when selecting answers
		$('.btn-answer').focus(function() {
			// $('ol[question-number='+TriviaGame.questionCounter+']').attr('answer-selected', 'yes');
			$(this).attr('current-selection', 'yes');
			TriviaGame.resolveQuestion();
		});
		// $('.btn-answer').focusout(function() {
		// 	// $('ol[question-number='+TriviaGame.questionCounter+']').attr('answer-selected', 'no');
		// 	$(this).attr('current-selection', 'no');
		// });
	},

	//Insert answer text into buttons after generating question container
	nextQuestion: function(questions, questionCounter) {
		this.createQuestionBox(this.numAnswers);
		//Insert answer options
		var correctAnswerSlot = Math.floor(Math.random() * this.numAnswers);

		$('ol[question-number='+questionCounter+']').children().children().eq(-1*correctAnswerSlot).text(questions[questionCounter].correctAnswer);

		var j = 0;
		for (var i=0; i < this.numAnswers; i++) {
			if($('ol[question-number='+questionCounter+']').children('li').children('button').eq(i).text() === "") {
				$('ol[question-number='+questionCounter+']').children('li').children('button').eq(i).text(questions[questionCounter].wrongAnswer[j]);
				j++;
			}
		}
	},

	//Set up the timer based on if user is in the question or review stage, and which question is current
	runTimer: function(timerType) {
		var obj = this;
		var timerDisplay = $('div.time-display[question-number='+this.questionCounter+']');
		var timerText;
		if (timerType === 'question') {
			var timeLeft = this.timePerQuestion;
			timerText = 'Seconds left: <br>';
		}
		else if (timerType === 'review') {
			var timeLeft = this.timeToReview;
			timerText = 'Next question in: <br>';
		}
		this.updateTimerDisplay(timerType, timeLeft, timerDisplay, timerText);
	},

	//
	updateTimerDisplay: function(timerType, timeLeft, timerDisplay, timerText) {
		var obj = this;

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

	//Scroll to top of screen for next question
	scrollToTop: function() {
		var obj = this;
		obj.stopAnyInterval();
		obj.intervalId = setInterval(function(){
			if (window.scrollY > 5) {
				window.scrollBy(0,-5);
			}
			else {
				window.scrollTo(0,0);
				obj.stopAnyInterval();
			}
		}, 10);
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

		//Update timer to show how long until the next questions
		var timerType = 'review';
		obj.screenFreeze = true;
		obj.runTimer(timerType);
		//Check if there are any questions left to ask
			//Reinitialize the game
			//or finish the game
	},
}

TriviaGame.initialize();