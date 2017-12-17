//https://opentdb.com/
//https://opentdb.com/api.php?amount=10&type=multiple

//Object array for all questions
//When user plays game, object will have additional keys added to track information
//		i)		result(correct, incorrect, timeout)
//		ii)		Time it took to answer question
//Object will be created with an API in final phase
//User can select difficulty and category on start screen
var questions = [
	{
		question: "first question",
		correctAnswer: 'correct', 
		wrongAnswer: [
			'wrong 1', 
			'wrong 2',
			'wrong 3',
			],
	},
	{
		question: "second question",
		correctAnswer: 'correct', 
		wrongAnswer: [
			'wrong 1', 
			'wrong 2',
			'wrong 3',
			],
	},
	{
		question: "third question",
		correctAnswer: 'correct', 
		wrongAnswer: [
			'wrong 1', 
			'wrong 2',
			'wrong 3',
			],
	}
];
var timePerQuestion = 3000; 	//milliseconds
var questionCounter = 0;		//global counter for which question is current

function nextQuestion() {
	var numAnswers = questions[questionCounter].wrongAnswer.length + 1;
	createQuestionBox(numAnswers);
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
	questionCounter++;
}

function createQuestionBox(numAnswers) {
	//Create element structure
	var newQuestionBox 			= $('<div>').addClass('question-box');
	var questionSlot 			= $('<div>').addClass('question-prompt').text(questions[questionCounter].question);
	var timeSlot 				= $('<div>').addClass('time-display');
	var submitAndResultSlot		= $('<div>').addClass('submission-result-box');
	var answerList 				= $('<ol>').addClass('answer-list').attr('type', 'a').attr('question-number',questionCounter);

	//Add the needed number of li elements
	for (var i=0; i < numAnswers; i++) {
		answerList.append($('<li>'));
	}

	newQuestionBox
		.append(questionSlot)
		.append(timeSlot)
		.append(answerList)
		.append(submitAndResultSlot);

	$('body').append(newQuestionBox);

}
