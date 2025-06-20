function AddonFractions_create(){

    var presenter = function () {};

    presenter.currentSelected = function(){};
    var Counter = 0;
    presenter.isErrorCheckingMode = false;
    presenter.isShowAnswersActive = false;
    presenter.isGradualShowAnswersActive = false;
    presenter.currentSelected.item = [];
    presenter.isVisible = '';
    presenter.wasVisible = '';
    presenter.playerController = null;
    presenter.isDrawn = false;
    presenter.initialMarks = 0;
    presenter.validate = false;
    presenter.isDisable = false;
    presenter.wasDisable = false;
    presenter.imageBackgroundTable = ["0"];

    presenter.isWCAGOn = false;
    presenter.keyboardControllerObject = null;
    presenter.markedItemColor = '#00ff44';
    presenter.markedItemBorderData = '8,4';
    presenter.markedItemIndex = -1;
    presenter.orderItemIndex = -1;
    presenter.isWCAGOn = false;
    presenter.isFirstEnter = true;

    presenter.DEFAULT_TTS_PHRASES = {
        SELECTED: "selected",
        DESELECTED: "deselected",
        ITEM: "item",
        CORRECT: "correct",
        WRONG: "wrong",
        OF: "of",
    };

    presenter.ERROR_CODES = {
        "Z01": "None",
        "C01": "Incorrect selectionColor.",
        "C02": "Incorrect strokeColor.",
        "C03": "Incorrect emptyColor.",
        "C04": "Incorrect strokeWidth.",
        "P01": 'Incorrect horizontal rectangular parts.',
        "P02": 'Incorrect vertical rectangular parts.',
        "P03": 'Choose rectangular parts less than 30.',
        "P04": 'Incorrect circle parts.',
        "P05": 'Choose circle parts less than 100.',
        "P06": 'Enter valid square parts value.',
        "P07": 'Square parts value must be a power of 2.',
        "A01": 'Incorrect value for "Number of correct parts" property.',
        "A02": 'Fill the "Number of correct parts", or check isNotActivity.',
        "F01": 'Wrong figure name'
    };

    presenter.FIGURES = {
        CIRCLE: 1,
        RECTANGULAR: 2,
        SQUARE: 3
    };

    presenter.configuration = {
        modelIsValid: false,
        errorCode: "Z01"
    };

    function displayText() {
        var textToDisplay = presenter.model['Text to be displayed'],
            isTextColored = presenter.model['Color text'] === 'True',
            $textContainer = presenter.$view.find('.some-text-container');

        $textContainer.text(textToDisplay);
        if (isTextColored) {
            $textContainer.css('color', 'red');
        }
    }

    presenter.setVisibility = function(isVisible) {
        presenter.isShowAnswersActive && presenter.hideAnswers();
        presenter.isGradualShowAnswersActive && presenter.gradualHideAnswers();

        presenter.$view.css("visibility", isVisible ? "visible" : "hidden");
    };

    presenter.show = function() {
        presenter.isShowAnswersActive && presenter.hideAnswers();
        presenter.isGradualShowAnswersActive && presenter.gradualHideAnswers();

        presenter.setVisibility(true);
        presenter.isVisible = true;
    };

    presenter.hide = function() {
        presenter.isShowAnswersActive && presenter.hideAnswers();
        presenter.isGradualShowAnswersActive && presenter.gradualHideAnswers();

        presenter.setVisibility(false);
        presenter.isVisible = false;
    };

    presenter.disable = function(){
        presenter.isShowAnswersActive && presenter.hideAnswers();

        presenter.isDisable = true;
        var $myDiv =  presenter.$view.find('.FractionsWrapper')[0];
        $($myDiv).addClass('disable');
    };

    presenter.enable = function(){
        presenter.isShowAnswersActive && presenter.hideAnswers();

        presenter.isDisable = false;
        var $myDiv =  presenter.$view.find('.FractionsWrapper')[0];
        $($myDiv).removeClass('disable');
    };

    presenter.isAttempted = function(){
        if(!presenter.configuration.isAnswer) {
            return true;
        }
        return Counter === (presenter.initialMarks)/2 ? false : true;
    };

    function getDefaultImageURL(isPreview) {
        var urlPrefix = isPreview ? '/media/iceditor/' : presenter.playerController.getStaticFilesPath();

        return urlPrefix + "addons/resources/fractions-default-image.png"
    }

    function generateValidationError(code) {
        return {
            isValid: false,
            errorCode: code
        };
    }

    presenter.validateColors = function (model) {
        var selectionColor = '#7FFFD4';
        var strokeColor= '#838B8B';
        var emptyColor = '#eeeeee';
        var strokeWidth = undefined;

        if(model.selectionColor.length > 0) {
            selectionColor = model.selectionColor;
        }

        if(model.strokeColor.length > 0) {
            strokeColor = model.strokeColor;
        }

        if(model.emptyColor.length > 0) {
            emptyColor = model.emptyColor;
        }

        if(model.strokeWidth.length > 0 ) {
            strokeWidth = model.strokeWidth;
        }

        if(!(presenter.checkColor(selectionColor))) {
            return generateValidationError("C01");
        }
        else if(!(presenter.checkColor(strokeColor))) {
            return generateValidationError("C02");
        }
        else if(!(presenter.checkColor(emptyColor))) {
            return generateValidationError("C03");
        }
        else if (isNaN(parseInt(strokeWidth))) {
            if (strokeWidth === undefined) {
                strokeWidth = 1;
            } else {
                return generateValidationError("C04");
            }
        }

        return  {
            isValid: true,
            selectionColor: selectionColor,
            strokeColor: strokeColor,
            emptyColor: emptyColor,
            strokeWidth: strokeWidth
        };
    };

    presenter.validateRectangleParts = function (model) {
        if(parseFloat(model.RectHorizontal) == 0 || parseFloat(model.RectHorizontal) != parseInt(model.RectHorizontal)) {
            return generateValidationError("P01");
        }

        if (parseFloat(model.RectVertical) == 0 || parseFloat(model.RectVertical) != parseInt(model.RectVertical)) {
            return generateValidationError("P02");
        }

        if(parseFloat(model.RectHorizontal) > 30 || parseFloat(model.RectVertical) > 30){
            return generateValidationError("P03");
        }

        return {
            isValid: true,
            rectHorizontal: parseInt(model.RectHorizontal),
            rectVertical: parseInt(model.RectVertical)
        };
    };

    presenter.validateCircleParts = function (model) {
        if(parseInt(model.CircleParts) != parseFloat(model.CircleParts) || parseFloat(model.CircleParts) <= 0 || isNaN(model.CircleParts)) {
            return generateValidationError("P04");
        }
        if(parseFloat(model.CircleParts) > 100){
            return generateValidationError("P05");
        }

        return {
            isValid: true,
            circleParts: parseInt(model.CircleParts)
        };
    };

    function log2(number) {
        return Math.log(number) / Math.log(2);
    }

    presenter.validateSquareParts = function (model) {
        if (parseInt(model.SquareParts) <= 0 || isNaN(model.SquareParts)) {
            return generateValidationError("P06");
        }

        if (log2(parseInt(model.SquareParts)) % 1 != 0) {
            return generateValidationError("P07");
        }

        return {
            isValid: true,
            squareParts: parseInt(model.SquareParts)
        };
    };

    presenter.validateParts = function (model, figure) {
        var validatedRectangleParts = presenter.validateRectangleParts(model);
        if (figure == presenter.FIGURES.RECTANGULAR) {
            if (!validatedRectangleParts.isValid) {
                return validatedRectangleParts;
            }
        }

        var validatedCircleParts = presenter.validateCircleParts(model);
        if (figure == presenter.FIGURES.CIRCLE) {
            if (!validatedCircleParts.isValid) {
                return validatedCircleParts;
            }
        }

        var validatedSquareParts = presenter.validateSquareParts(model);
        if (figure == presenter.FIGURES.SQUARE) {
            if (!validatedSquareParts.isValid) {
                return validatedSquareParts;
            }
        }

        return {
            isValid: true,
            rectHorizontal: validatedRectangleParts.rectHorizontal || 0,
            rectVertical: validatedRectangleParts.rectVertical || 0,
            circleParts: validatedCircleParts.circleParts || 0,
            squareParts: validatedSquareParts.squareParts || 0
        };
    };

    presenter.validateCorrectAnswer = function (model) {
        var isNotActivity = ModelValidationUtils.validateBoolean(model.isNotActivity);

        if (isNotActivity) {
            return {
                isValid: true,
                isAnswer: false
            };
        }

        var correctAnswer = model.Correct;
        if (correctAnswer.length > 0) {
            if (
                isNaN(correctAnswer)
                || parseFloat(correctAnswer) != Math.round(correctAnswer)
                || parseFloat(correctAnswer) <= 0
                || parseFloat(correctAnswer) > parseInt(model.RectHorizontal, 10) * parseInt(model.RectVertical, 10)
                || parseFloat(correctAnswer) > parseInt(model.SquareParts, 10)
                || parseFloat(correctAnswer) > parseInt(model.CircleParts, 10)) {

                return generateValidationError("A01");
            }

            return {
                isValid: true,
                isAnswer: true,
                correctAnswer: parseInt(correctAnswer)
            };
        } else {
            if (!isNotActivity) {
                return generateValidationError("A02")
            }
        }
    };

    presenter.validateFigure = function (model) {
        var figure = model.Figure;
        var figureCode = presenter.FIGURES[figure.toUpperCase()];
        if (figureCode === undefined) {
            return generateValidationError("F01");
        }

        return {
            isValid: true,
            figure: figureCode
        }
    };

    presenter.validateModel = function (model, isPreview) {

        var imageSelectChecker = false;
        var imageDeselectChecker = false;
        var imageSelect = undefined;
        var imageDeselect = undefined;

        var selected = {
            selectedString: undefined,
            haveSelectedElements: false
        };

        if(model.selectedParts.length > 0) {
            selected.selectedString = model.selectedParts;
            selected.haveSelectedElements = true;
        }
        else {
            selected.selectedString = '';
        }

        if (model['imageSelect'] == undefined || model['imageSelect'].length == 0) {
            imageSelect = getDefaultImageURL(isPreview);
        } else {
            imageSelectChecker = true;
            imageSelect = model.imageSelect;
        }

        if (model['imageDeselect'] == undefined || model['imageDeselect'].length == 0) {
            imageDeselect = getDefaultImageURL(isPreview);
        } else{
            imageDeselectChecker = true;
            imageDeselect = model.imageDeselect;
        }

        var validatedColors = presenter.validateColors(model);
        if (!validatedColors.isValid) {
            return validatedColors;
        }

        var validatedFigure = presenter.validateFigure(model);
        if (!validatedFigure.isValid) {
            return validatedFigure;
        }

        var validatedParts = presenter.validateParts(model, validatedFigure.figure);
        if (!validatedParts.isValid) {
            return validatedParts;
        }

        var validatedAnswer = presenter.validateCorrectAnswer(model);
        if (!validatedAnswer.isValid) {
            return validatedAnswer;
        }

        return {
            isValid: true,
            imageSelect: imageSelect,
            imageDeselect: imageDeselect,
            imageSelectChecker: imageSelectChecker,
            imageDeselectChecker: imageDeselectChecker,
            selected: selected,
            selectionColor: validatedColors.selectionColor,
            strokeColor: validatedColors.strokeColor,
            emptyColor: validatedColors.emptyColor,
            strokeWidth: parseFloat(validatedColors.strokeWidth),
            rectHorizontal: validatedParts.rectHorizontal,
            rectVertical: validatedParts.rectVertical,
            circleParts: validatedParts.circleParts,
            squareParts: validatedParts.squareParts,
            isAnswer: validatedAnswer.isAnswer,
            correctAnswer: validatedAnswer.correctAnswer,
            figure: validatedFigure.figure,
            addonWidth: parseInt(model.Width, 10),
            addonHeight: parseInt(model.Height, 10),
            addonId: model.ID,
            isNotActivity: ModelValidationUtils.validateBoolean(model.isNotActivity)
        };
    };

    presenter.init = function(view, model, isPreview){
        presenter.$view = $(view);
        presenter.model = model;

        var radius = 0;
        var circOX = 0;
        var circOY = 0;

        var config = presenter.configuration;
        var myDiv =  $(view).find('.FractionsWrapper')[0];

        var i = 0;

        if(presenter.configuration.figure == presenter.FIGURES.RECTANGULAR) {
            for(i = 0; i < config.rectHorizontal * config.rectVertical + 1; i++){
                presenter.currentSelected.item[i] = false;
            }
            presenter.currentSelected.item[0] = model.ID;

            var figureRect = presenter.drawRect();
            $(myDiv).append(figureRect);
            $(myDiv).addClass('rect');
            presenter.isDrawn = true;
            presenter.validate = true;
        }

        if(presenter.configuration.figure == presenter.FIGURES.CIRCLE) {
            for(i = 0; i < config.circleParts + 1; i++){
                presenter.currentSelected.item[i] = false;
            }
            presenter.currentSelected.item[0] = model.ID;

            if(config.addonHeight >= config.addonWidth){
                radius = Math.round((config.addonWidth - 2 * config.strokeWidth) * 50) / 100;
                circOX = radius + config.strokeWidth;
                circOY = radius + config.strokeWidth;
            }
            else {
                radius = Math.round((config.addonHeight - 2 * config.strokeWidth) * 50) / 100;
                circOX = radius + config.strokeWidth;
                circOY = radius + config.strokeWidth;
            }

            var figureCirc = presenter.drawArcs(circOX,circOY, radius);
            $(myDiv).append(figureCirc);
            $(myDiv).addClass('circ');
            presenter.isDrawn = true;
            presenter.validate = true;

        }

        if (presenter.configuration.figure == presenter.FIGURES.SQUARE) {
            presenter.buildSquare(model, view);
        }

        if(model.isDisable == 'True') {
            presenter.isDisable = true;
            presenter.wasDisable = true;
            $(myDiv).addClass('disable');
        }

        presenter.clear();

        if (presenter.configuration.selected.haveSelectedElements) {
            presenter.selected(presenter.configuration.selected.selectedString);
        }

        displayText();
        presenter.buildKeyboardController();
    };

    presenter.buildSquare = function (model, view) {
        var config = presenter.configuration;
        var parts = config.squareParts;
        var addonWidth = config.addonWidth;
        var addonHeight = config.addonHeight;
        var squareSize = Math.min(addonWidth, addonHeight);
        var i;

        for(i = 0; i < parts + 1; i++){
            presenter.currentSelected.item[i] = false;
        }

        presenter.currentSelected.item[0] = model.ID;

        var d = '<svg xmlns="http://www.w3.org/2000/svg" ' +
            'version="1.1"  ' +
            'width="' + squareSize + '" ' +
            'height="' + squareSize + '">';

        var elements = [new SquareShapeElement(addonWidth, addonHeight, 0,0, 1, config.addonId)];

        //Cut elements to half Log2(n) times
        for (i = 1; i <= log2(parts); i++) {
            var elementsBuff = [];
            for (var elementIndex = 0; elementIndex < elements.length; elementIndex++) {
                elementsBuff = elementsBuff.concat(elements[elementIndex].cutToHalf(addonWidth, addonHeight));
            }
            elements = elementsBuff;
        }
        d += '<rect ' +
            'id="myBorder" ' +
            'height="'+(squareSize - (2 * config.strokeWidth)) + '" ' +
            'width="'+ (squareSize - (2 * config.strokeWidth)) + '" ' +
            'y="' + config.strokeWidth + '" ' +
            'x="' + config.strokeWidth + '" ' +
            'stroke-width="' + config.strokeWidth + '" ' +
            'stroke="' + config.strokeColor+'" ' +
            'style="fill: ' + config.strokeColor + '"/>';

        for (i = 0; i < elements.length; i++) {
            elements[i].calculateValues(addonWidth, addonHeight);
            d += elements[i].getSVGString(i + 1);
        }

        d += '</svg>';

        var myDiv =  $(view).find('.FractionsWrapper')[0];
        $(myDiv).append(d);
        $(myDiv).addClass('rect');
        presenter.isDrawn = true;
        presenter.validate = true;
    };

    presenter.checkColor = function(color) {

        var regExp = new RegExp("^#[0-9a-fA-F]{6}$");
        var colorMatch;
        colorMatch = color.match(regExp);

        if(colorMatch === null) {
            return false;
        }
        else {
            return true;
        }
    };

    presenter.executeCommand = function(name, params) {
        switch(name.toLowerCase()) {
            case 'enable'.toLowerCase():
                presenter.enable();
                break;
            case 'disable'.toLowerCase():
                presenter.disable();
                break;
            case 'setSelectionColor'.toLowerCase():
                presenter.setSelectionColorButton(params);
                break;
            case 'getCurrentNumber'.toLowerCase():
                presenter.getCurrentNumber();
                break;
            case 'show'.toLowerCase():
                presenter.show();
                break;
            case 'hide'.toLowerCase():
                presenter.hide();
                break;
            case 'markAsCorrect'.toLowerCase():
                presenter.markAsCorrect();
                break;
            case 'markAsWrong'.toLowerCase():
                presenter.markAsWrong();
                break;
            case 'markAsEmpty'.toLowerCase():
                presenter.markAsEmpty();
                break;
            case 'isAttempted'.toLowerCase():
                presenter.isAttempted();
                break;
            case 'showElementsSA'.toLowerCase():
                presenter.showElementsSA(params[0]);
                break;
            case 'hideElementsSA'.toLowerCase():
                presenter.hideElementsSA();
                break;
            case 'allElements'.toLowerCase():
                presenter.allElements();
                break;
            case 'isErrorCheckMode'.toLowerCase():
                presenter.isErrorCheckMode(params[0]);
                break;
            case 'addShowAnswersClass'.toLowerCase():
                presenter.addShowAnswersClass();
                break;
            case 'removeShowAnswersClass'.toLowerCase():
                presenter.removeShowAnswersClass();
                break;
            case 'getCurrentNumberSA'.toLowerCase():
                presenter.getCurrentNumberSA();
                break;
            case 'isAllOK'.toLowerCase():
                presenter.isAllOK();
                break;

        }
    };

    presenter.allElements = function(){
        return presenter.allElementsCount;
    };

    presenter.addShowAnswersClass = function(){
        var $myDiv =  presenter.$view.find('.FractionsWrapper')[0];
        $($myDiv).addClass('showAnswers');
    };

    presenter.removeShowAnswersClass = function(){
        var $myDiv =  presenter.$view.find('.FractionsWrapper')[0];
        $($myDiv).removeClass('showAnswers');
    };

    presenter.isErrorCheckMode = function(value){
        presenter.isErrorCheckingMode = value;
    };

    presenter.markAsCorrect = function(){
        presenter.isShowAnswersActive && presenter.hideAnswers();
        presenter.isGradualShowAnswersActive && presenter.gradualHideAnswers();

        var $myDiv =  presenter.$view.find('.FractionsWrapper')[0];
        presenter.isErrorCheckingMode = true;
        $($myDiv).removeClass('incorrect');
        $($myDiv).addClass('correct');
    };

    presenter.markAsWrong = function(){
        presenter.isShowAnswersActive && presenter.hideAnswers();
        presenter.isGradualShowAnswersActive && presenter.gradualHideAnswers();

        var $myDiv =  presenter.$view.find('.FractionsWrapper')[0];
        presenter.isErrorCheckingMode = true;
        $($myDiv).removeClass('correct');
        $($myDiv).addClass('incorrect');
    };

    presenter.markAsEmpty = function(){
        presenter.isShowAnswersActive && presenter.hideAnswers();
        presenter.isGradualShowAnswersActive && presenter.gradualHideAnswers();

        var $myDiv =  presenter.$view.find('.FractionsWrapper')[0];
        presenter.isErrorCheckingMode = false;
        $($myDiv).removeClass('incorrect');
        $($myDiv).removeClass('correct');
    };

    presenter.setSelectionColor = function(color){
        presenter.isShowAnswersActive && presenter.hideAnswers();
        presenter.isGradualShowAnswersActive && presenter.gradualHideAnswers();

        presenter.configuration.selectionColor = color;
    };

    presenter.setSelectionColorButton = function(color){
        presenter.isShowAnswersActive && presenter.hideAnswers();
        presenter.isGradualShowAnswersActive && presenter.gradualHideAnswers();

        presenter.configuration.selectionColor = color[0];
    };

    presenter.getCurrentNumber = function(){
        presenter.isShowAnswersActive && presenter.hideAnswers();
        presenter.isGradualShowAnswersActive && presenter.gradualHideAnswers();

        return Counter;
    };

    presenter.isAllOK = function(){
        presenter.isShowAnswersActive && presenter.hideAnswers();
        presenter.isGradualShowAnswersActive && presenter.gradualHideAnswers();

        if(!presenter.configuration.isAnswer) {
            return true;
        }
        return Counter == presenter.configuration.correctAnswer ? true : false;
    };

    presenter.getCurrentNumberSA = function(){
        return Counter;
    };

    presenter.run = function(view, model) {
        presenter.$view = $(view);
        presenter.model = model;
        var $counter = undefined;

        $.extend(presenter.configuration, presenter.validateModel(model, false));
        presenter.setSpeechTexts(model['speechTexts']);
        if (!presenter.configuration.isValid) {
            $counter = $(view).find('.FractionsCommandsViewer');
            $counter.text(presenter.ERROR_CODES[presenter.configuration.errorCode]);
        } else {
            $counter = $(view).find('.FractionsCommandsViewer');
            $counter.text('');

            presenter.init(view, model, false);
            if (model.Figure == 'Rectangular') {
                presenter.allElementsCount = model.RectHorizontal * model.RectVertical;
            }

            if (model.Figure == 'Circle') {
                presenter.allElementsCount = model.CircleParts;
            }

            presenter.isVisible = model["Is Visible"] == 'True';
            presenter.wasVisible = model["Is Visible"] == 'True';
            presenter.setVisibility(presenter.isVisible);

            const events = ["ShowAnswers", "HideAnswers", "GradualShowAnswers", "GradualHideAnswers"];
            for (let i = 0; i < events.length; i++) {
                presenter.eventBus.addEventListener(events[i], this);
            }

            $(view).find('path').click(function (e) {
                presenter.markElementAsClicked(this);
                e.stopPropagation();
            });

            jQuery(function ($) {
                $(view).find('path').on("mouseenter", function () {
                    var classString = $(this).attr('class');
                    var newClass = classString + " mouse-hover";
                    $(this).attr('class', newClass);
                });
            });

            jQuery(function ($) {
                $(view).find('path').on("mouseleave", function () {
                    var classString = $(this).attr('class');
                    var mouseLeaveClass = classString.replace(' mouse-hover', '');
                    $(this).attr("class", mouseLeaveClass);
                });

            });
        }

    };

    presenter.createPreview = function(view, model) {
        presenter.$view = $(view);
        presenter.model = model;
        var $myDiv =  presenter.$view.find('path');
        if(presenter.isDrawn) $($myDiv).remove();

        $.extend(presenter.configuration, presenter.validateModel(model, true));
        if (presenter.configuration.isValid === false) {
            var $counter = $(view).find('.FractionsCommandsViewer');
            $counter.text(presenter.ERROR_CODES[presenter.configuration.errorCode]);
        } else {
            var $counter = $(view).find('.FractionsCommandsViewer');
            $counter.text('');
            presenter.init(view, model, true);
        }
    };

    presenter.clear = function(){
        var $myDiv, i;
        if(presenter.imageBackgroundTable[0] == 0){

            for(i = 0; i < presenter.currentSelected.item.length - 1; i++){
                presenter.imageBackgroundTable[i] = presenter.$view.find('"#'+presenter.currentSelected.item[0]+'imageBackground' +  (i+1) + '"');
            }
        }
        if(presenter.configuration.imageSelectChecker || presenter.configuration.imageDeselectChecker){
            for(i = 0; i < presenter.currentSelected.item.length - 1; i++){
                $myDiv =  presenter.$view.find('"#' + presenter.currentSelected.item[0] + (i+1) + '"');
                jQuery($myDiv).css('fill', presenter.configuration.emptyColor);
                jQuery($myDiv).removeClass("selected");
                presenter.imageBackgroundTable[i].attr("xlink:href", presenter.configuration.imageDeselect);
            }
        }else {
            for(i = 0; i < presenter.currentSelected.item.length;i++){
                $myDiv = presenter.$view.find('path')[i];
                $($myDiv).removeClass("selected");
                $($myDiv).css('fill', presenter.configuration.emptyColor);
            }

        }
        return true;
    };

    presenter.selected = function(selectedString){

        if(presenter.validate){
            presenter.clear();
            if(selectedString.indexOf(',') !== -1){
                var selectedStringBufor = selectedString;
                while(selectedStringBufor.indexOf(',') !== -1) {
                    var position = selectedStringBufor.indexOf(',');
                    var toSelect = selectedStringBufor.slice(0, position);
                    selectedStringBufor = selectedStringBufor.slice(position + 1, selectedStringBufor.length);

                    if(!(toSelect.isNaN) && parseFloat(toSelect) === Math.round(toSelect)){
                        presenter.markElementAsSelected(toSelect);
                        presenter.currentSelected.item[toSelect] = true;
                        Counter++;
                        presenter.initialMarks++;
                    } else {
                        presenter.selectRange(toSelect);
                    }
                }
                var toSelect1 = selectedStringBufor;
                if(!(toSelect1.isNaN) && parseFloat(toSelect1) === Math.round(toSelect1)){
                    presenter.markElementAsSelected(toSelect1);
                    presenter.currentSelected.item[toSelect1] = true;
                    Counter++;
                    presenter.initialMarks++;
                } else {
                    presenter.selectRange(toSelect1);
                }
            } else {
                var toSelect2 = selectedString;
                if(!(toSelect2.isNaN) && parseFloat(toSelect2) === Math.round(toSelect2)){
                    presenter.markElementAsSelected(toSelect2);
                    presenter.currentSelected.item[toSelect2] = true;
                    Counter++;
                    presenter.initialMarks++;
                } else {
                    presenter.selectRange(toSelect2);
                }
            }
        }
    };

    presenter.selectRange = function(selectedString){

        var toSelect3 = 1;
        if(selectedString.indexOf('-') !== -1){
            var selectedStringBufor = selectedString;
            var position1 = selectedStringBufor.indexOf('-');
            var toSelect1 = selectedStringBufor.slice(0, position1);

            selectedStringBufor = selectedStringBufor.slice(position1 + 1, selectedStringBufor.length);

            if(selectedStringBufor.indexOf('-') !== -1){
                var position2 = selectedStringBufor.indexOf('-');
                var toSelect2 = selectedStringBufor.slice(0, position2);
                selectedStringBufor = selectedStringBufor.slice(position2 + 1, selectedStringBufor.length);
                toSelect3 = selectedStringBufor;
            } else {
                var toSelect2 = selectedStringBufor.slice(0, selectedStringBufor.length);
            }

            if(!(toSelect1.isNaN) && parseFloat(toSelect1) === Math.round(toSelect1) && !(toSelect2.isNaN) && parseFloat(toSelect2) === Math.round(toSelect2) && !(toSelect3.isNaN) && parseFloat(toSelect3) === Math.round(toSelect3))
            {
                if(parseFloat(toSelect1) > presenter.currentSelected.item.length) {
                    toSelect1 = presenter.currentSelected.item.length;
                }
                if(parseFloat(toSelect2) > presenter.currentSelected.item.length) {
                    toSelect2 = presenter.currentSelected.item.length;
                }
                if(parseFloat(toSelect3) > presenter.currentSelected.item.length) {
                    toSelect3 = presenter.currentSelected.item.length;
                }

                if(presenter.validate){
                    for(var i = parseFloat(toSelect1); i < parseFloat(toSelect2) + 1;i+=parseFloat(toSelect3)){
                        presenter.markElementAsSelected(i);
                        presenter.currentSelected.item[i] = true;
                        Counter++;
                        presenter.initialMarks++;
                    }
                }
            }
        }
    };


    presenter.markElementAsClicked = function(element){
        var correctAnswer = presenter.configuration.correctAnswer;
        var clickedElementID = element.id;
        if (!presenter.isErrorCheckingMode
            && !presenter.isShowAnswersActive
            && !presenter.isGradualShowAnswersActive
            && !presenter.isDisable)
        {
            if(presenter.currentSelected.item[clickedElementID.slice(presenter.currentSelected.item[0].length,clickedElementID.length)] === false)
            {
                element.style.fill = presenter.configuration.selectionColor;
                $(element).addClass("selected");
                Counter++;
                if(presenter.configuration.imageDeselectChecker || presenter.configuration.imageSelectChecker){
                    presenter.imageBackgroundTable[clickedElementID.slice(presenter.currentSelected.item[0].length,clickedElementID.length) - 1].attr("xlink:href", presenter.configuration.imageSelect);
                }
                presenter.currentSelected.item[clickedElementID.slice(presenter.currentSelected.item[0].length,clickedElementID.length)] = true;
                presenter.triggerFrameChangeEvent(clickedElementID.slice(presenter.currentSelected.item[0].length,clickedElementID.length),1,Counter == correctAnswer ? 1 : 0);
            } else   {
                element.style.fill = presenter.configuration.emptyColor;
                $(element).removeClass("selected");
                presenter.currentSelected.item[clickedElementID.slice(presenter.currentSelected.item[0].length,clickedElementID.length)] = false;
                Counter--;
                presenter.triggerFrameChangeEvent(clickedElementID.slice(presenter.currentSelected.item[0].length,clickedElementID.length),0,Counter == correctAnswer ? 1 : 0);

                if(presenter.configuration.imageDeselectChecker || presenter.configuration.imageSelectChecker){
                    presenter.imageBackgroundTable[clickedElementID.slice(presenter.currentSelected.item[0].length,clickedElementID.length) - 1].attr("xlink:href", presenter.configuration.imageDeselect);
                }

            }
        }
    };

    presenter.markElementAsSelected = function(element){
        var $myDiv =  presenter.$view.find('"#' +  presenter.currentSelected.item[0] + element + '"');
        jQuery($myDiv).css('fill', presenter.configuration.selectionColor);
        presenter.initialMarks++;
        jQuery($myDiv).addClass("selected");
        if(presenter.configuration.imageSelectChecker || presenter.configuration.imageDeselectChecker){
            presenter.imageBackgroundTable[element - 1].attr("xlink:href", presenter.configuration.imageSelect);
        }
    };


    presenter.drawRect = function() {
        var config = presenter.configuration;

        var id = config.addonId;
        var addonWidth = config.addonWidth;
        var addonHeight = config.addonHeight;
        var partsHorizontally = config.rectHorizontal;
        var partsVertically = config.rectVertical;

        var elementHeight = parseFloat(addonHeight) - (2 * config.strokeWidth);
        var elementWidth = parseFloat(addonWidth) - (2 * config.strokeWidth);

        var stepX = (addonWidth - (2 * config.strokeWidth)) /partsHorizontally;
        var stepY = (addonHeight - (2 * config.strokeWidth)) /partsVertically;

        var fig = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1"  width="' + addonWidth+'" height="' + addonHeight+'">';
        fig += '<rect ' +
            'id="myBorder" ' +
            'height="'+ elementHeight + '" ' +
            'width="' + elementWidth + '" ' +
            'y="' + config.strokeWidth + '" ' +
            'x="' + config.strokeWidth + '" ' +
            'stroke-width="' + config.strokeWidth + '" ' +
            'stroke="' + config.strokeColor+'" ' +
            'style="fill: none"/>';

        var k =1;

        for(var j=0;j<partsVertically ;j++) {
            for(var i=0;i<partsHorizontally ;i++) {
                fig += '<path ' +
                        'id="'+ id + k +'" ' +
                        'class="' + id + '" ' +
                        'd="M' + (config.strokeWidth + i * stepX) + ',' + (config.strokeWidth + j * stepY) + 'h' + stepX + ' v' +stepY + ' h' + (-stepX) +' v' + (-stepY) +'" ' +
                        'stroke-width="' + config.strokeWidth + '" ' +
                        'style="stroke: '+ config.strokeColor + '; fill: ' + config.emptyColor + ';" />';

                if(config.imageDeselectChecker || config.imageSelectChecker){
                    fig += '<defs>';

                    fig += '<mask ' +
                        'id="' + id + 'mask' + k + '" ' +
                        'x="0" ' +
                        'y="0" ' +
                        'patternUnits="userSpaceOnUse" ' +
                        'height="100" ' +
                        'width="100">';

                    fig += '<path ' +
                        'id="' + id + 'maskPath' + k + '" ' +
                        'class="image-path" ' +
                        'd="M' + (config.strokeWidth + i * stepX)+',' + (config.strokeWidth + j * stepY) + 'h' + stepX +'  v' + stepY + ' h' + (-stepX) +' v' + (-stepY) + '" ' +
                        'stroke-width="' + config.strokeWidth + '" ' +
                        'style="pointer-events:none;fill:#ffffff;" />';
                    fig += '</mask>';
                    fig += '</defs>';
                    fig += '<image ' +
                        'y="' + j * stepY + '" ' +
                        'x="' + i * stepX + '" ' +
                        'id="' + id + 'imageBackground' + k + '" ' +
                        'class="image-background" ' +
                        'xlink:href="' + config.imageDeselect + '" ' +
                        'height="'+stepY+'" width="'+stepX+'" ' +
                        'style="pointer-events:none;"  mask="url(#' + id + 'mask' + k + ')"/>';

                }
                k++;
            }
        }
        fig += '</svg>';

        return fig;
    };


    presenter.drawArcs = function(centerX,centerY,radius){
        var parts = presenter.configuration.circleParts;
        var id = presenter.configuration.addonId;
        var addonWidth = presenter.configuration.addonWidth;
        var addonHeight = presenter.configuration.addonHeight;

        var step = parseInt(parts, 10) + 1;
        var sectorAngle = Math.round(360 / parts * 100) / 100;
        var angle = 360 - sectorAngle;

        if(parts == 1) {
            var d = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1"  width="' + addonWidth + '" height="' + addonHeight + '">';
            d += '<path ' +
                'id="' + id + '1" ' +
                'd=" M ' + centerX + ', ' +centerY + 'm '+ (-radius) + ', 0 a ' + radius + ',' + radius + ' 0 1,0 ' + (2*radius)+ ',0 a ' + radius+ ',' + radius + ' 0 1,0 '+ (-2 * radius) + ',0" ' +
                'fill="' + presenter.configuration.emptyColor + '" ' +
                'stroke="' + presenter.configuration.strokeColor + '" ' +
                'stroke-width="' + presenter.configuration.strokeWidth + '" ' +
                'stroke-linejoin="round" />';
            d += '</svg>';

            return d;
        } else{
            var d = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1"  width="' + addonWidth + '" height="' + addonHeight+'">';
            var x1 = Math.round((centerX + radius * Math.cos(Math.PI * angle / 180)) * 100) / 100;
            var y1 = Math.round((centerY + radius * Math.sin(Math.PI * angle / 180)) * 100) / 100;
            var x2 = Math.round((centerX + radius * Math.cos(Math.PI * angle / 180)) * 100) / 100;
            var y2 = Math.round((centerY + radius * Math.sin(Math.PI * angle / 180)) * 100) / 100;
            angle -= sectorAngle;
            d += '<path ' +
                'id="' + id + '1" ' +
                'class="' + id + '" ' +
                'd="M' + centerX + ',' + centerY + 'l ' + radius + ', 0 A' + radius + ',' + radius + ' 0 0, 0 ' + (x1) + ',' + (y1) + ' z" ' +
                'fill="' + presenter.configuration.emptyColor + '" ' +
                'stroke="' + presenter.configuration.strokeColor + '" ' +
                'stroke-width="' + presenter.configuration.strokeWidth + '" ' +
                'stroke-linejoin="round" />';

            for(var j=2; j < step ; j++){
                x1 = x2;
                y1 = y2;
                x2 = Math.round((centerX + radius*Math.cos(Math.PI * angle / 180)) * 100) / 100;
                y2 = Math.round((centerY + radius*Math.sin(Math.PI * angle / 180)) * 100) / 100;

                var stepX = x1 - centerX;
                var stepY = y1 - centerY;

                d += '<path ' +
                    'id="' + id + j +'" ' +
                    'class="' + id + '" ' +
                    'd="M' + centerX + ',' + centerY + 'l ' + stepX + ',' + stepY +' A' + radius + ',' + radius + ' 0 0, 0 ' + (x2) + ',' + (y2) + ' z" ' +
                    'fill="' + presenter.configuration.emptyColor + '" ' +
                    'stroke="' + presenter.configuration.strokeColor + '" ' +
                    'stroke-width="' + presenter.configuration.strokeWidth + '" ' +
                    'stroke-linejoin="round" />';

                angle -= sectorAngle;
            }
            d += '</svg>';
            return d;
        }
    };

    presenter.getState = function () {
        var currentItems = presenter.currentSelected.item;
        var visible = presenter.isVisible;
        var initialMarks = presenter.initialMarks;
        var wasDisable = presenter.wasDisable;
        var isDisable = presenter.isDisable;
        return JSON.stringify({
            Counter: Counter,
            currentItems: currentItems,
            visible: visible,
            initialMarks: initialMarks,
            wasDisable: wasDisable,
            isDisable: isDisable
        });
    };

    presenter.setState = function (state) {
        var parsedState = JSON.parse(state),
            $myDiv =  presenter.$view.find('.FractionsWrapper')[0];
        presenter.isVisible = parsedState.visible;
        Counter = parsedState.Counter;
        presenter.wasDisable = parsedState.wasDisable;
        presenter.isDisable = parsedState.isDisable;
        presenter.setVisibility(presenter.isVisible);
        presenter.currentSelected.item = JSON.parse(state).currentItems;
        presenter.clear();

        for(var j = 1; j < presenter.currentSelected.item.length; j++) {
            if(presenter.currentSelected.item[j] === true) {
                presenter.markElementAsSelected(j);
            }
        }
        presenter.initialMarks = parsedState.initialMarks;
        presenter.isDisable === true ?  $($myDiv).addClass('disable') : $($myDiv).removeClass('disable');
    };

    presenter.getMaxScore = function () {
        if(parseInt(presenter.initialMarks, 10) / 2 === presenter.configuration.correctAnswer) {
            return 0;
        }

        if(presenter.configuration.isAnswer) {
            return 1;
        } else {
            return 0;
        }
    };

    presenter.neutralOption = function(){
        return (Counter === (presenter.initialMarks) / 2) ? 1 : 0;
    };

    presenter.getScore = function () {
        if(parseInt(presenter.initialMarks, 10) / 2 === presenter.configuration.correctAnswer) {
            return 0;
        }

        if(presenter.configuration.isAnswer) {
            return (Counter == presenter.configuration.correctAnswer) ? 1 : 0;
        } else {
            return 0;
        }
    };

    presenter.getErrorCount = function () {
        if(presenter.configuration.isAnswer) {
            if(parseInt(presenter.initialMarks,10)/2 === presenter.configuration.correctAnswer && presenter.configuration.correctAnswer != Counter) {
                return 1;
            }

            if(presenter.neutralOption() == 1) {
                return 0;
            }
            else {
                return presenter.getMaxScore() - presenter.getScore();
            }
        } else {
            return 0;
        }
    };

    presenter.setShowErrorsMode = function () {
        presenter.isShowAnswersActive && presenter.hideAnswers();
        presenter.isGradualShowAnswersActive && presenter.gradualHideAnswers();

        presenter.isErrorCheckingMode = true;

        if(presenter.configuration.isAnswer) {
            var $myDiv =  presenter.$view.find('.FractionsWrapper')[0];

            if(presenter.neutralOption() === 0) {
                if (presenter.getScore() === presenter.getMaxScore() && presenter.getErrorCount() === 0) {
                    $($myDiv).addClass('correct');
                } else {
                    $($myDiv).addClass('incorrect');
                }
            }
        }
    };

    presenter.setWorkMode = function () {
        var $myDiv =  presenter.$view.find('.FractionsWrapper')[0];
        presenter.isErrorCheckingMode = false;
        $($myDiv).removeClass('correct');
        $($myDiv).removeClass('incorrect');
    };

    presenter.reset = function () {
        presenter.isErrorCheckingMode && presenter.setWorkMode();
        presenter.isShowAnswersActive && presenter.hideAnswers();
        presenter.isGradualShowAnswersActive && presenter.gradualHideAnswers();

        var $myDiv =  presenter.$view.find('.FractionsWrapper')[0];
        for(var i = 1; i< presenter.currentSelected.item.length; i++) {
            presenter.currentSelected.item[i] = false;
        }
        Counter = 0;
        presenter.initialMarks = 0;
        presenter.selected(presenter.configuration.selected.selectedString);
        presenter.setVisibility(presenter.wasVisible);
        presenter.isDisable = presenter.wasDisable;
        presenter.isDisable === true ?  $($myDiv).addClass('disable') : $($myDiv).removeClass('disable');
    };

    presenter.setPlayerController = function(controller) {
        presenter.playerController = controller;
    };

    presenter.setEventBus = function(eventBus) {
        presenter.eventBus = eventBus;
    };

    presenter.createEventData = function(partNumber,clickValue,checkScore) {
        return {
            source : presenter.currentSelected.item[0],
            item : "" + partNumber,
            value : '' + clickValue,
            score : '' + checkScore
        };
    };

    presenter.triggerFrameChangeEvent = function(partNumber,clickValue,checkScore,element) {
        var eventData = presenter.createEventData(partNumber,clickValue,checkScore);
        presenter.eventBus.sendEvent('ValueChanged', eventData);
    };

    presenter.onEventReceived = function (eventName, eventData) {
        switch (eventName) {
            case "ShowAnswers":
                presenter.showAnswers();
                break;
            case "HideAnswers":
                presenter.hideAnswers();
                break;
            case "GradualShowAnswers":
                presenter.gradualShowAnswers(eventData);
                break;
            case "GradualHideAnswers":
                presenter.gradualHideAnswers();
                break;
        }
    };

    presenter.getActivitiesCount = function () {
        if (!presenter.configuration.isValid || presenter.configuration.isNotActivity) {
            return 0;
        }
        return 1;
    };

    presenter.markCorrectAnswerAsSelected = function(element){
        var $myDiv =  presenter.$view.find('"#' +  presenter.currentSelected.item[0] + element + '"');
        jQuery($myDiv).css('fill', presenter.configuration.selectionColor);
        jQuery($myDiv).addClass("selected");

        if(presenter.configuration.imageSelectChecker || presenter.configuration.imageDeselectChecker){
            presenter.imageBackgroundTable[element - 1].attr("xlink:href", presenter.configuration.imageSelect);
        }
    };

    presenter.isEnabledInGSAMode = function () {
        // Workaround. Prevents execution of presenter.enable and thus unlocking the addon when GradualHideAnswers is executed
        return presenter.isDisable;
    };

    presenter.showAnswers = function () {
        if (!presenter.configuration.isAnswer
            || presenter.configuration.isNotActivity) {
            return;
        }
        presenter.isErrorCheckingMode && presenter.setWorkMode();
        presenter.isGradualShowAnswersActive && presenter.hideAnswers();
        presenter.isShowAnswersActive = true;

        showAnswersTo(presenter.configuration.correctAnswer);
    };

    presenter.showElementsSA = function(element){
        presenter.isErrorCheckingMode && presenter.setWorkMode();
        presenter.isGradualShowAnswersActive && presenter.gradualHideAnswers();
        presenter.isShowAnswersActive = true;

        showAnswersTo(element);
    };

    presenter.gradualShowAnswers = function (eventData) {
        if ((eventData.moduleID !== presenter.configuration.addonId)
            || !presenter.configuration.isAnswer
            || presenter.configuration.isNotActivity) {
            return;
        }

        presenter.isErrorCheckingMode && presenter.setWorkMode();
        presenter.isShowAnswersActive && presenter.hideAnswers();
        presenter.isGradualShowAnswersActive = true;

        showAnswersTo(presenter.configuration.correctAnswer);
    };

    function showAnswersTo(number) {
        if (number != Counter){
            presenter.clear()
            let k = 0;
            if (Counter < number){
                for (let j = 1; j < presenter.currentSelected.item.length; j++){
                    if (presenter.currentSelected.item[j] === true) {
                        presenter.markCorrectAnswerAsSelected(j);
                    }

                    if (presenter.currentSelected.item[j] === false && k != number - Counter){
                        presenter.markCorrectAnswerAsSelected(j);
                        k++;
                    }
                }
            } else {
                for (let j = 1; j < presenter.currentSelected.item.length; j++){
                    if (presenter.currentSelected.item[j] === true) {
                        if (k != number){
                            presenter.markCorrectAnswerAsSelected(j);
                            k++;
                        }
                    }
                }
            }
        }
        presenter.addShowAnswersClass();
    }

    presenter.hideAnswers = function () {
        if (!presenter.isShowAnswersActive
            && !presenter.isGradualShowAnswersActive) {
            return;
        }
        presenter.isErrorCheckingMode && presenter.setWorkMode();

        presenter.isShowAnswersActive = false;
        presenter.isGradualShowAnswersActive = false;
        presenter.removeShowAnswersClass();
        presenter.clear();

        for (let j = 1; j < presenter.currentSelected.item.length; j++){
            if (presenter.currentSelected.item[j] === true) {
                presenter.markCorrectAnswerAsSelected(j);
            }
        }
        return true;
    };

    presenter.hideElementsSA = function(item){
        presenter.hideAnswers();
    };

    presenter.gradualHideAnswers = function() {
        presenter.hideAnswers();
    };

    presenter.keyboardController = function(keycode, isShiftDown, event) {
        event.preventDefault();

        const keys = {
            ENTER: 13,
            ESCAPE: 27,
            SPACE: 32,
            ARROW_LEFT: 37,
            ARROW_UP: 38,
            ARROW_RIGHT: 39,
            ARROW_DOWN: 40,
            TAB: 9
        };

        switch (keycode) {
            case keys.ENTER:
                presenter.enter(event);
                break;
            case keys.ESCAPE:
                presenter.escape();
                break;
            case keys.SPACE:
                presenter.select();
                break;
            case keys.ARROW_LEFT:
                presenter.leftArrowHandler();
                break;
            case keys.ARROW_UP:
                presenter.previousRow();
                break;
            case keys.ARROW_RIGHT:
                presenter.rightArrowHandler();
                break;
            case keys.ARROW_DOWN:
                presenter.nextRow();
                break;
            case keys.TAB:
                presenter.tabHandler(isShiftDown);
                break;
        }
    };

    presenter.tabHandler = function (isShiftDown) {
        if (isShiftDown) {
            presenter.previousElement();
        } else {
            presenter.nextElement();
        }
    }

    presenter.leftArrowHandler = function () {
        if (presenter.isSquareSelected() || presenter.isCircleSelected()) {
            presenter.nextElement();
        } else {
            presenter.previousElement();
        }
    }

    presenter.rightArrowHandler = function () {
        if (presenter.isSquareSelected() || presenter.isCircleSelected()) {
            presenter.previousElement();
        } else {
            presenter.nextElement();
        }
    }

    presenter.buildKeyboardController = function () {
        presenter.keyboardControllerObject
            = new FractionsKeyboardController(
                presenter.$view,
                presenter.getNumberOfElements()
        );
    };

    presenter.getNumberOfElements = function () {
        switch (presenter.configuration.figure) {
            case presenter.FIGURES.CIRCLE:
                return presenter.configuration.circleParts;

            case presenter.FIGURES.RECTANGULAR:
                return presenter.configuration.rectHorizontal * presenter.configuration.rectVertical;

            case presenter.FIGURES.SQUARE:
                return presenter.configuration.squareParts;
        }
    };

    presenter.setWCAGStatus = function(isWCAGOn) {
        presenter.isWCAGOn = isWCAGOn;
    };

    function FractionsKeyboardController (elements, elementsCount) {
        KeyboardController.call(this, elements, elementsCount);
    }

    FractionsKeyboardController.prototype = Object.create(window.KeyboardController.prototype);
    FractionsKeyboardController.prototype.constructor = FractionsKeyboardController;

    presenter.exitWCAGMode = function () {
        presenter.setWCAGStatus(false);
        presenter.removeMarkedElement();
        presenter.isFirstEnter = true;
    }

    presenter.select = function () {
        const element = $(`#${presenter.configuration.addonId}${presenter.markedItemIndex}`);

        presenter.markElementAsClicked(element.get(0));

        presenter.readOnSelect();
    }

    presenter.enter = function (event) {
        if (event.ctrlKey || event.shiftKey) {
            presenter.exitWCAGMode();
            return;
        }

        if (presenter.isFirstEnter) {
            presenter.markedItemIndex = 1;
            presenter.orderItemIndex = 1;
            presenter.markItem(1);
        }

        presenter.readOnEnter();
        presenter.isFirstEnter = false;
    }

    presenter.nextElement = function () {
        presenter.increaseIndex();
        presenter.markItem(presenter.markedItemIndex);

        presenter.readMarkedElement();
    };

    presenter.previousElement = function () {
        presenter.decreaseIndex();
        presenter.markItem(presenter.markedItemIndex);

        presenter.readMarkedElement();
    };

    presenter.previousRow = function () {
        if (presenter.isSquareSelected() || presenter.isCircleSelected()) {
            presenter.increaseIndex();
            presenter.markItem(presenter.markedItemIndex);
        } else {
            const offset = presenter.markedItemIndex - presenter.configuration.rectHorizontal < 1 ? presenter.markedItemIndex : presenter.markedItemIndex - presenter.configuration.rectHorizontal;
            presenter.markedItemIndex = offset;
            presenter.orderItemIndex = offset;
            presenter.markItem(presenter.markedItemIndex);
        }

        presenter.readMarkedElement();
    };

    presenter.nextRow = function () {
        if (presenter.isSquareSelected() || presenter.isCircleSelected()) {
            presenter.decreaseIndex();
            presenter.markItem(presenter.markedItemIndex);
        } else {
            const totalElements = presenter.configuration.rectHorizontal * presenter.configuration.rectVertical
            const offset = presenter.markedItemIndex + presenter.configuration.rectHorizontal > totalElements ? presenter.markedItemIndex : presenter.markedItemIndex + presenter.configuration.rectHorizontal;
            presenter.markedItemIndex = offset;
            presenter.orderItemIndex = offset;
            presenter.markItem(presenter.markedItemIndex);
        }

        presenter.readMarkedElement();
    };

    presenter.escape = function () {
        presenter.removeMarkedElement();
        presenter.isFirstEnter = true;
    }

    presenter.isSquareSelected = function () {
        return presenter.configuration.figure === presenter.FIGURES.SQUARE;
    }

    presenter.isCircleSelected = function () {
        return presenter.configuration.figure === presenter.FIGURES.CIRCLE;
    }

    presenter.increaseIndex = function () {
        presenter.orderItemIndex += 1;
        presenter.updateMarkedItemIndex();
        if (presenter.isSquareSelected()) {
            presenter.markedItemIndex = getIndexesInOrder(presenter.configuration.squareParts)[presenter.orderItemIndex - 1];
        } else {
            presenter.markedItemIndex = presenter.orderItemIndex;
        }
    }

    presenter.decreaseIndex = function () {
        presenter.orderItemIndex -= 1;
        presenter.updateMarkedItemIndex();
        if (presenter.isSquareSelected()) {
            presenter.markedItemIndex = getIndexesInOrder(presenter.configuration.squareParts)[presenter.orderItemIndex - 1];
        } else {
            presenter.markedItemIndex = presenter.orderItemIndex;
        }
    }

    presenter.markItem = function (itemIndex) {
        const dItemValue = $(`#${presenter.configuration.addonId}${itemIndex}`).attr('d')
        presenter.removeMarkedElement();

        const newElement = document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create a path in SVG's namespace
        newElement.setAttribute("d",dItemValue);
        newElement.setAttribute('id', 'Fractions-keyboard-nav')
        newElement.style.stroke = presenter.markedItemColor;
        newElement.style.strokeWidth = presenter.configuration.strokeWidth;
        newElement.style.strokeDasharray = presenter.markedItemBorderData;
        newElement.style.fill = 'transparent';
        newElement.style.strokeLinejoin = 'round';
        newElement.classList.add(presenter.configuration.addonId);

        const $addonElement = $(`#${presenter.configuration.addonId}`);
        const svg = $addonElement.find('.FractionsWrapper').get(0).children[0];
        svg.appendChild(newElement);
    }

    presenter.removeMarkedElement = function () {
        const element = document.getElementById('Fractions-keyboard-nav');
        if (element?.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    presenter.updateMarkedItemIndex = function () {
        const elementsCount = presenter.getNumberOfElements();
        if (presenter.orderItemIndex > elementsCount) {
            presenter.orderItemIndex = 1;
        } else if (presenter.orderItemIndex < 1) {
            presenter.orderItemIndex = elementsCount;
        }
    }

    presenter.isMarkedElementSelected = function () {
        const element$ = $(`#${presenter.configuration.addonId}${presenter.markedItemIndex}`);

        return element$.hasClass('selected');
    }

    presenter.getTextToSpeechOrNull = function () {
        if (presenter.playerController) {
            return presenter.playerController.getModule('Text_To_Speech1');
        }

        return null;
    };

    presenter.speak = function (data) {
        const tts = presenter.getTextToSpeechOrNull();

        if (tts && presenter.isWCAGOn) {
            tts.speak(data);
        }
    };

    presenter.setWCAGStatus = function(isWCAGOn) {
        presenter.isWCAGOn = isWCAGOn;
    };

    presenter.setSpeechTexts = function(speechTexts) {
        presenter.speechTexts = {
            Selected: presenter.DEFAULT_TTS_PHRASES.SELECTED,
            Deselected: presenter.DEFAULT_TTS_PHRASES.DESELECTED,
            Item: presenter.DEFAULT_TTS_PHRASES.ITEM,
            Correct: presenter.DEFAULT_TTS_PHRASES.CORRECT,
            Wrong: presenter.DEFAULT_TTS_PHRASES.WRONG,
            of: presenter.DEFAULT_TTS_PHRASES.OF,
        };

        if (!speechTexts || $.isEmptyObject(speechTexts)) {
            return;
        }

        presenter.speechTexts = {
            Selected: TTSUtils.getSpeechTextProperty(
                speechTexts.Selected.Selected,
                presenter.speechTexts.Selected),
            Deselected: TTSUtils.getSpeechTextProperty(
                speechTexts.Deselected.Deselected,
                presenter.speechTexts.Deselected),
            Item: TTSUtils.getSpeechTextProperty(
                speechTexts.Item.Item,
                presenter.speechTexts.Item),
            Correct: TTSUtils.getSpeechTextProperty(
                speechTexts.Correct.Correct,
                presenter.speechTexts.Correct),
            Wrong: TTSUtils.getSpeechTextProperty(
                speechTexts.Wrong.Wrong,
                presenter.speechTexts.Wrong),
            of: TTSUtils.getSpeechTextProperty(
                speechTexts.of.of,
                presenter.speechTexts.of),
        };
    };
    
    presenter.readOnEnter = function () {
        const textVoiceObject = [];
        const numberOfSelectedItems = presenter.getNumberOfSelectedItems().toString();
        const numberOfAllItems = (presenter.currentSelected.item.length - 1).toString();
        let text = [presenter.speechTexts.Selected, numberOfSelectedItems, presenter.speechTexts.of, numberOfAllItems].join(' ');

        if (presenter.isErrorCheckingMode) {
            text += ` ${presenter.getSelectionMark(+numberOfSelectedItems)}`;
        }
        pushMessageToTextVoiceObject(textVoiceObject, text);

        if (presenter.isFirstEnter && !presenter.isErrorCheckingMode && !presenter.isShowAnswersActive) {
            const option = presenter.isMarkedElementSelected() ? presenter.speechTexts.Selected : presenter.speechTexts.Deselected;
            const selectionText = [presenter.speechTexts.Item, "1", option].join(' ');
            pushMessageToTextVoiceObject(textVoiceObject, selectionText);
        }

        presenter.speak(textVoiceObject);
    }

    presenter.getNumberOfSelectedItems = function () {
        if (presenter.isShowAnswersActive) {
            return presenter.configuration.correctAnswer;
        }
        return presenter.currentSelected.item.filter(_item => _item === true).length;
    }

    presenter.getSelectionMark = function (userSelectedItems) {
        if (userSelectedItems === presenter.configuration.correctAnswer) {
            return presenter.speechTexts.Correct;
        }
        return presenter.speechTexts.Wrong;
    }

    presenter.readMarkedElement = function () {
        const textVoiceObject = [];
        const option = presenter.isMarkedElementSelected() ? presenter.speechTexts.Selected : presenter.speechTexts.Deselected;
        const text = [presenter.speechTexts.Item, presenter.orderItemIndex, option].join(' ');
        pushMessageToTextVoiceObject(textVoiceObject, text);

        presenter.speak(textVoiceObject);
    }

    presenter.readOnSelect = function () {
        const textVoiceObject = [];
        const option = presenter.isMarkedElementSelected() ? presenter.speechTexts.Selected : presenter.speechTexts.Deselected;
        pushMessageToTextVoiceObject(textVoiceObject, option);

        presenter.speak(textVoiceObject);
    }

    function pushMessageToTextVoiceObject(textVoiceObject, message) {
        textVoiceObject.push(window.TTSUtils.getTextVoiceObject(message));
    }

    var SquareShapeElement = function (width, height, x, y, currentCutIndex, id) {
        this.width = Math.min(width, height);
        this.height = Math.min(width, height);
        this.x = x;
        this.y = y;
        this.currentCutIndex = currentCutIndex;
        this.id = id;
    };

    SquareShapeElement.prototype = {
        calculateValues: function (maxWidth, maxHeight) {
            var stroke = presenter.configuration.strokeWidth;
            var originY = this.y + this.height;
            if (this.x == 0) {
                this.x += stroke;
                this.width -= stroke;
            } else {
                this.width -= stroke;
            }

            if (this.y == 0) {
                this.y += stroke;
                this.height -= stroke;
            }
            if (originY == maxWidth) {
                this.height -= stroke;
            }
        },

        cutToHalf: function (maxWidth, maxHeight) {
            if (this.currentCutIndex == 1) {
                return this.cutToVerticallyHalf();
            } else if (this.currentCutIndex == 2) {
                return this.cutToHorizontallyHalf();
            } else {
                return this.cutToTriangleHalf(maxWidth, maxHeight);
            }
        },

        cutToVerticallyHalf: function () {
            var elements = [];
            var newWidth = this.width / 2;
            var newHeight = this.height;
            elements.push(new RectangleShapeElement(newWidth, newHeight, this.x, this.y, this.currentCutIndex + 1, this.id));
            elements.push(new RectangleShapeElement(newWidth, newHeight, this.x + newWidth, this.y, this.currentCutIndex + 1, this.id));

            return elements;
        },

        cutToHorizontallyHalf: function () {
            var elements = [];
            var newWidth = this.width;
            var newHeight = this.height / 2;
            elements.push(new RectangleShapeElement(newWidth, newHeight, this.x, this.y, this.currentCutIndex + 1, this.id));
            elements.push(new RectangleShapeElement(newWidth, newHeight, this.x, this.y + newHeight, this.currentCutIndex + 1, this.id));

            return elements;
        },

        cutToTriangleHalf: function (maxWidth, maxHeight) {
            var size = Math.min(maxWidth, maxHeight);
            var xCenter = size / 2;
            var yCenter = size / 2;

            var x1 = this.x;
            var y1 = this.y;

            if (x1 != 0) {
                x1 = size;
            }

            if (y1 != 0) {
                y1 = size;
            }


            var elements = [];
            elements.push(new TriangleShapeElement(this.width, this.height, x1,y1, xCenter, y1, xCenter, yCenter, this.currentCutIndex + 1, this.id));
            elements.push(new TriangleShapeElement(this.width, this.height, x1,y1, x1, yCenter, xCenter, yCenter, this.currentCutIndex + 1, this.id));
            return elements;
        },

        getSVGString: function (id) {
            var width = this.width;
            var height = this.height;
            return '<path ' +
                'id="' + this.id + id + '" ' +
                'class="' + this.id + '" ' +
                'd="M' + (this.x) + ',' + (this.y) + 'h' + (width) + ' v' + (height) + ' h' + (-width) + ' v' + (-height) + '" ' +
                'stroke-width="' + presenter.configuration.strokeWidth + '" ' +
                'style="stroke: ' + presenter.configuration.strokeColor + '; ' +
                'fill: ' + presenter.configuration.emptyColor + ';" />';
        }

    };

    var RectangleShapeElement = function (width, height, x, y, currentCutIndex, id) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.currentCutIndex = currentCutIndex;
        this.id = id;
    };
    RectangleShapeElement.prototype = Object.create(SquareShapeElement.prototype);

    var TriangleShapeElement = function (width, height, x1, y1, x2, y2, x3, y3, currentCutIndex, id) {
        this.width = width;
        this.height = height;
        this.x1 = x1;
        this.y1 = y1;

        this.x2 = x2;
        this.y2 = y2;

        this.x3 = x3;
        this.y3 = y3;
        this.currentCutIndex = currentCutIndex;
        this.id = id;
    };
    TriangleShapeElement.prototype = Object.create(SquareShapeElement.prototype);

    TriangleShapeElement.prototype.getSVGString = function (id) {
        return '<path ' +
            'id="' + this.id + id + '" ' +
            'class="' + this.id + '" ' +
            'd="M' + this.x1 + ',' + this.y1 + ',' + this.x2 + ',' + this.y2 + ',' + this.x3 + ',' + this.y3 + 'Z" ' +
            'stroke-width="' + presenter.configuration.strokeWidth + '" ' +
            'style="stroke: ' + presenter.configuration.strokeColor + '; ' +
            'fill: ' + presenter.configuration.emptyColor + ';" />';
    };

    TriangleShapeElement.prototype.calculateValues = function(maxWidth, maxHeight) {
        var stroke = presenter.configuration.strokeWidth;
        if (this.x1 == 0) {
            this.x1 += stroke / 2;
        }

        if (this.x1 == maxWidth) {
            this.x1 -= stroke / 2;
        }

        if (this.x2 == 0) {
            this.x2 += stroke / 2;
        }

        if (this.x2 == maxWidth) {
            this.x2 -= stroke / 2;
        }

        if (this.y1 == 0) {
            this.y1 += stroke / 2;
        }

        if (this.y2 == 0) {
            this.y2 += stroke / 2;
        }

        if (this.y1 == maxWidth) {
            this.y1 -= stroke / 2;
        }

        if (this.y2 == maxWidth) {
            this.y2 -= stroke / 2;
        }
    };

    TriangleShapeElement.prototype.cutToHalf = function (maxWidth, maxHeight) {
        var elements = [];
        var maxSize = Math.min(maxWidth, maxHeight);
        if ((this.x1 == 0 && this.x2 == 0) || (this.x1 == maxSize && this.x2 == maxSize)) {
            elements.push(new TriangleShapeElement(this.width, this.height / 2, this.x1, this.y1, this.x2, (this.y1 + this.y2) / 2, this.x3, this.y3, this.currentCutIndex + 1, this.id));
            elements.push(new TriangleShapeElement(this.width, this.height / 2, this.x1, (this.y1 + this.y2) / 2, this.x2, this.y2, this.x3, this.y3, this.currentCutIndex + 1, this.id));
        } else {
            elements.push(new TriangleShapeElement(this.width / 2, this.height, this.x1, this.y1, (this.x2 + this.x1) / 2, this.y2, this.x3, this.y3, this.currentCutIndex + 1, this.id));
            elements.push(new TriangleShapeElement(this.width / 2, this.height, (this.x2 + this.x1) / 2, this.y2, this.x2, this.y2, this.x3, this.y3, this.currentCutIndex + 1, this.id));
        }
        return elements;
    };

    function getIndexesInOrder(numberOfElements) {
        switch (numberOfElements) {
            case 1:
                return [1];
            case 4:
                return [1, 2, 4, 3];
            case 8:
                return [1, 2, 4, 3, 7, 8, 6, 5];
            default:
                return calculateIndexesInOrder(numberOfElements);
        }
    }

    function calculateIndexesInOrder(numberOfElements) {
        const offset = (numberOfElements / 8) // 8 come from 4 side each divided on 2

        return [1,
            ...getIncrementIndexes(1+offset, offset),
            ...getDecrementIndexes(4*offset, offset),
            ...getIncrementIndexes(1+2*offset, offset),
            ...getDecrementIndexes(7*offset, offset),
            ...getIncrementIndexes(1+7*offset, offset),
            ...getDecrementIndexes(6*offset, offset),
            ...getIncrementIndexes(1+4*offset, offset),
            ...getDecrementIndexes(offset, offset-1),
        ]
    }

    function getIncrementIndexes(startIndex, offset) {
        return Array.from({length: offset}, (_, i) => startIndex + i);
    }

    function getDecrementIndexes(endIndex, offset) {
        return Array.from({length: offset}, (_, i) => endIndex - i);
    }

    return presenter;
}
