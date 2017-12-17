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
			question: "first question",
			correctAnswer: 'correct', 
			wrongAnswer: ['wrong 1', 'wrong 2',	'wrong 3']
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
	timePerQuestion: 	12, 		//Units in seconds, cannot exceed 99
	questionCounter: 	0,			//Counter for which question is current
	correctAnswers: 	0,			//Talll for total questions answered correctly
	incorrectAnswers: 	0,			//Talll for total questions answered incorrectly
	timeOuts: 			0, 			//Talll for total questions not answered before time out

	initialize: function() {
		this.nextQuestion(this.questions, this.questionCounter);
		this.runTimer();
		this.questionCounter++;
	},

	nextQuestion: function(questions, questionCounter) {
		var numAnswers = questions[questionCounter].wrongAnswer.length + 1;
		this.createQuestionBox(numAnswers);
		//Insert answer options
		var correctAnswerSlot = Math.floor(Math.random() * numAnswers);

		$('ol[question-number='+questionCounter+']').children().eq(-1*correctAnswerSlot).text(questions[questionCounter].correctAnswer);

		var j = 0;
		for (var i=0; i < numAnswers; i++) {
			if($('ol[question-number='+questionCounter+']').children('li').eq(i).text() === "") {
				$('ol[question-number='+questionCounter+']').children('li').eq(i).text(questions[questionCounter].wrongAnswer[j]);
				j++;
			}
		}
	},

	createQuestionBox: function(numAnswers) {
		//Create element structure
		var newQuestionBox 			= $('<div>').addClass('question-box');
		var questionSlot 			= $('<div>').addClass('question-prompt').text(this.questions[this.questionCounter].question);
		var timeSlot 				= $('<div>').addClass('time-display');
		var submitButton			= $('<button>').addClass('btn submit-btn');
		var answerList 				= $('<ol>').addClass('answer-list').attr('type', 'a').attr('question-number',this.questionCounter);

		//Add the needed number of li elements
		for (var i=0; i < numAnswers; i++) {
			answerList.append($('<li>'));
		}

		newQuestionBox
			.append(questionSlot)
			.append(timeSlot)
			.append(answerList)
			.append(submitButton);

		$('main').append(newQuestionBox);

	},

	runTimer: function() {
		var timerDisplay = $('div.time-display').eq(this.questionCounter);
		var timeLeft = this.timePerQuestion;
		var intervalId = setInterval(function(){
			if (timeLeft >= 0) {
				timerDisplay.text(TriviaGame.timeConverter(timeLeft));
				timeLeft--;
			}
			else {
				clearInterval(intervalId);
				TriviaGame.answerTimeOut();
			}
		}, 1000);
	},

	timeConverter: function(t) {
	    if (t < 10) {
	      t = "0" + t;
	    }
	    return t;
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