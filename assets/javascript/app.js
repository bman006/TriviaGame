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
	timePerQuestion: 	10000, 		//Units in seconds, cannot exceed 99
	questionCounter: 	0,			//Counter for which question is current
	answerIndexCounter: 0,			//Counter for master answer index attribute
	correctAnswers: 	0,			//Tally for total questions answered correctly
	incorrectAnswers: 	0,			//Tally for total questions answered incorrectly
	timeOuts: 			0, 			//Tally for total questions not answered before time out
	timedOut: 			false,		//For use when timer runs out in resolveQuestion function

	initialize: function() {
		this.timedOut = false;
		this.nextQuestion(this.questions, this.questionCounter);
		this.runTimer();
	},

	nextQuestion: function(questions, questionCounter) {
		var numAnswers = questions[questionCounter].wrongAnswer.length + 1;
		this.createQuestionBox(numAnswers);
		//Insert answer options
		var correctAnswerSlot = Math.floor(Math.random() * numAnswers);

		$('ol[question-number='+questionCounter+']').children().children().eq(-1*correctAnswerSlot).text(questions[questionCounter].correctAnswer);

		var j = 0;
		for (var i=0; i < numAnswers; i++) {
			if($('ol[question-number='+questionCounter+']').children('li').children('button').eq(i).text() === "") {
				$('ol[question-number='+questionCounter+']').children('li').children('button').eq(i).text(questions[questionCounter].wrongAnswer[j]);
				j++;
			}
		}
	},

	createQuestionBox: function(numAnswers) {
		//Create element structure
		var newQuestionBox 			= $('<div>').addClass('question-box');
		var questionSlot 			= $('<div>').addClass('question-prompt').text(this.questions[this.questionCounter].question);
		var timeSlot 				= $('<div>').addClass('time-display').attr('question-number',this.questionCounter);
		var answerList 				= $('<ol>').attr('answer-selected', 'no');

		answerList.addClass('answer-list').attr('type', 'a').attr('question-number',this.questionCounter);

		//Create attributes to reference element based on which button is selected by user
		var AnswerListItems = '';
		for (i = 0; i < numAnswers; i++) {
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

	runTimer: function() {
		var obj = this;
		var timerDisplay = $('div.time-display[question-number='+this.questionCounter+']');
		var timeLeft = this.timePerQuestion;
		var intervalId = setInterval(function(){
			if (timeLeft >= 0) {
				timerDisplay.html('Seconds left: <br>' + timeLeft);
				timeLeft--;
			}
			else {
				clearInterval(intervalId);
				obj.timedOut = true;
				obj.resolveQuestion();
			}
		}, 1000);
	},

	//This function handles logic for checking answer correctness based on either user submission or timeout conditions
	resolveQuestion: function() {
		//stop timer


		//get answer

		//check if answer is correct

		//update tallys for correct/incorrect answers

		this.questionCounter++;
		this.initialize();
	},
	answerCorrectly: function(){
		correctAnswers++;
	},
	answerIncorrectly: function(){
		incorrectAnswers++;
	},
	answerTimeOut:  function(){
		this.questions[this.questionCounter].result = 'time out';
		this.timeOuts++;
	},
}

TriviaGame.initialize();