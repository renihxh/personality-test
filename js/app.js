/**
 * Theme Name: Renato
 * @description: jQuery global Functions.
 * @version: 1.0.0
 */
 (function($){
    const $_start = $('#btn_start'),
          $_previews = $('#btn_previews'),
          $_next = $('#btn_next'),
          $_finish = $('#btn_finish');
          $_show_results = $('#btn_show_results'),
          $_retake = $('#btn_retake');

    var currentQuestion = 0,
        allQuestions = [],
        totalQuestions = '',
        totalScores = [],
        results = [],
        isvalid = false;
    
    
    // Create Quiz
    function createQuiz(){
        totalQuestions = allQuestions.length;
        $('.page-number .total').text(totalQuestions);
        // ITERATING THROUGH OBJECTS
        $.each(allQuestions, function (key, value) {
            var class_name = '';
            if(key == 0){
                class_name = 'show';
            }
            var required = value['requreid'];
               

            var questionSlide = $('<div class="question-slide '+class_name+'" data-slide="'+ key +'"></div>');
            var questionTitle = $('<h3 class="question">'+value['question']+'</h3>');
            var questionOptions = $('<div class="options"></div>');
            var question_key = key;

            questionSlide.appendTo($('#question_handler'));
            questionSlide.append(questionTitle);
            questionSlide.append(questionOptions);

            $.each( value['answers'], function( key, value ) {
                var requiredInput = '';
                // add required attribute
                if(required == true){
                    requiredInput = 'required'
                }

                var option = '<div class="option-wrapper">';
                option += '<input type="radio" name="question_'+question_key+'" id="question_'+question_key+'_option_'+key+'" value="'+value['score']+'" '+requiredInput+'>';
                option += '<label for="question_'+question_key+'_option_'+key+'">'+value['option']+'</label></div>';
                questionOptions.append(option);

            });
        });

        $_next.attr('data-index', currentQuestion + 1); 
        $_previews.attr('data-index', currentQuestion); 
    }
    
    // Starting quiz
    function startQuiz(){
        $_start.attr('disabled', true);
        $_next.attr('disabled', false);
        $('.step-start').fadeOut('400', function(){
            $(this).removeClass('active');
            $('.step-questions').addClass('active');
            var questionHeight = $('.questions-box .question-slide.show').height();
            // Set question container height
            $('.question-box--body').height(questionHeight);
        });
        $.getJSON("../mock_data.json", 
        function (data) {
    
            $.each(data, function (key, value) {
                if(value['questions']){
                    allQuestions = value['questions'];
                    createQuiz(value['questions']);
                }
                if(value['results']){
                    results = value['results'];
                }
            });
        });
    }

    // Slide screen
    function slideQuestion(question_num){
        currentQuestion = question_num;
        $('.page-number .current').text(question_num + 1);
        if(question_num == 0){
            $_previews.attr({
                'disabled': true,
                'data-index': 0
            });
            $_next.attr({
                'disabled': false,
                'data-index': 1
            });
            $_finish.attr('disabled', true);  
        }else if(question_num == totalQuestions - 1){
            $_next.attr({
                'disabled': true,
                'data-index': totalQuestions
            });
            $_previews.attr({
                'disabled': false,
                'data-index': question_num - 1
            }); 
            $_finish.attr('disabled', false);
        }else{
            $_previews.attr({
                'disabled': false,
                'data-index': question_num - 1
            }); 
            $_next.attr({
                'disabled': false,
                'data-index': question_num + 1
            });
            $_finish.attr('disabled', true);

        }
        $('.question-slide.show').removeClass('show');
        $('.question-slide[data-slide="'+question_num+'"]').addClass('show');

        
        var questionHeight = $('.questions-box .question-slide.show').height();
        // Set question container height
        // console.log(questionHeight);
        $('.question-box--body').height(questionHeight);
        
        
    }

    // Showing next question
    function nextQuestion(){
        if(checkAnswer(currentQuestion)){
            scoresStore(currentQuestion);
            slideQuestion(currentQuestion + 1);
        }
    }

    // Showing previews question
    function prevQuestion(){
        slideQuestion(currentQuestion - 1);
    }

    // Calculate total of scores when click finish
    function scoresTotal(){
        var sum = 0;
        for(var i = 0; i<totalScores.length; i++){
            sum += parseInt(totalScores[i].answer)
        }
        return sum;
        // console.log(sum);
    }

    // Finsh quiz
    function finishQuiz(){
        if(checkAnswer(currentQuestion)){
            scoresStore(currentQuestion);
            var scores = scoresTotal();

            $('#total_scores').text(scoresTotal);
     
            $('.step-questions').fadeOut('400', function(){
                $(this).removeClass('active');
                $('.step-finish').fadeIn();
                $('.step-finish').addClass('active');
            });
            
            finishScores(scores);

        };
    }

    function finishScores(scores){
        $.each(results, function (key, value) {
            var min = value['min_points'],
                max = value['max_points'];

            if(scores >= min && scores <= max ){
                $('#quiz_result_answer').text(value['text']);
            }

        });
    }

    // Do validation for required question
    function checkAnswer(currentQuestion){
        var isrequried = $('input[name="question_'+currentQuestion+'"]').prop('required');
        var answer = $('input[name="question_'+currentQuestion+'"]:checked').val();
        // console.log('currentQuestion', answer);
        
        if(answer === undefined && isrequried == true){
            isvalid = false;
            $('.question-slide.show').addClass('invalid-answer');
        }else{
            isvalid = true;
            $('.question-slide.show').removeClass('invalid-answer');
        }

        $('input[type=radio][name=question_'+currentQuestion+']').change(function() {
           $('.question-slide.show').removeClass('invalid-answer');
   
        })
        return isvalid;
    }

     // Update score if it exist function
     function scoresUpdate(currentQuestion, scoreVal){

        $.map( totalScores, function( val, i ) {
            if(val['question'] == currentQuestion){
                val['answer'] = scoreVal;
            }
        });
    }

    // Store score function
    function scoresStore(currentQuestion){
        var scoreVal = $('input[name="question_'+currentQuestion+'"]:checked').val();
        
        const answerElement = {
            "question":currentQuestion,
            "answer": scoreVal
        };
        const answerExists = totalScores.findIndex(element => element.question === answerElement.question) > -1;

        if(answerExists){
            scoresUpdate(currentQuestion, scoreVal);
        }else{
            totalScores.push(answerElement);
        } 
    }
    function showResults(){
        $_show_results.hide();
        $.each(totalScores, function (key, value) {
            var question = allQuestions[key]['question'],
                answer = value['answer'];
            
            var incrementKey = key + 1;
            
            var questionAnswer = $('<div class="result_question_'+ key +'"></div>');
            var questionTitle = $('<h4 class="result_question">'+ incrementKey +'. '+question+'</h4>');
            var questionOptions = $('<div class="result_answer"></div>');
            
            questionAnswer.appendTo($('#show_result'));
            questionAnswer.append(questionTitle);
            questionAnswer.append(questionOptions);
            

            $.each( allQuestions[key]['answers'], function( key, value ) {
                var selected;
                if(answer == value['score']){
                    selected = value['option'];
                    questionOptions.append(selected);
                }
            });
        });
        $('#show_result').fadeIn();
    }
    function resetQuiz(){
        currentQuestion = 0;
        totalScores = [];
        scoresTotal();
        scores = undefined;
        $_show_results.show();
        $('#show_result').fadeOut().empty();
        $('.step-questions input:radio').prop('checked', false);
        
        $('.step-finish').fadeOut('400', function(){
            $(this).removeClass('active');
            $('.step-questions').fadeIn();
            $('.step-questions').addClass('active');
            slideQuestion(0);
        });
        
    }

    // DOCUMENT READY //
    $(document).ready(function() {
        "use strict";

        $_start.on('click', function(){startQuiz(); });
        $_next.on('click', function(){nextQuestion();});
        $_previews.on('click', function(){prevQuestion();});
        $_finish.on('click', function(){finishQuiz();});
        $_show_results.on('click', function(){showResults();});
        $_retake.on('click', function(){resetQuiz();});

        document.getElementById("current_year").innerHTML = new Date().getFullYear();

        
    });
})(jQuery);