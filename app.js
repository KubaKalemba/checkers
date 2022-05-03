const board = document.querySelector(".board");
const resetButton = document.querySelector(".reset-button");
let playableSquares = [];
let allSquares = [];
let squareObjects = [];
let pieceSelected = false;
let selectedPieceNumber = 0;
let redTurn = true;
let redLeft = 12;
let whiteLeft = 12;
let multiLeap = false;
let kingSelected = false;

function drawBoard() {
    let counter = 0;
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let square = document.createElement("div");
            if(i%2 === 0) {
                if (j % 2 === 0) {
                    square.classList.add("black-square");
                    playableSquares.push(square);
                } else {
                    square.classList.add("white-square");
                }
                square.id = i.toString();
                board.appendChild(square);
            } else {
                if (j % 2 !== 0) {
                    square.classList.add("black-square");
                    playableSquares.push(square);
                } else {
                    square.classList.add("white-square");
                }
                square.id = i.toString();
                board.appendChild(square);
            }
            square.id = counter.toString();
            counter++;
            allSquares.push(square);
            let squareObject = {
                isPlayable: true,
                piece: "none",
                available: false,
            }
            squareObjects.push(squareObject);
        }
    }
}

function setupObjects() {
    for (let i = 0; i < allSquares.length; i++) {
        squareObjects[i].isPlayable = allSquares[i].classList.contains("black-square");
        if (squareObjects[i].isPlayable) {
            if(i<23) {
                squareObjects[i].piece = "white";
            }
            if(i>39) {
                squareObjects[i].piece = "red";
            }
        }
    }
}

function makePiece(color) {
    let piece = document.createElement("div");
    piece.classList.add("piece");
    piece.style.backgroundColor = color;
    piece.onmouseover = () => {
        if((redTurn && color === "red")
            || (!redTurn && color === "white")) {
            piece.style.transform = "scale(1.2)";
        }
    };
    piece.onmouseout = () => {
        piece.style.transform = "scale(1.0)";
    }
    return piece;
}

function addPieces() {
    for (let i = 0; i < allSquares.length; i++) {
        if(squareObjects[i].piece === "white" || squareObjects[i].piece === "red") {
            let newPiece = makePiece(squareObjects[i].piece, i);
            allSquares[i].appendChild(newPiece);
        }
    }
}

function startGame() {
    drawBoard();
    setupObjects();
    addPieces();
    addEventListenersToSquares();
}
startGame();

function choosePiece(index) {
    pieceSelected = true;
    selectedPieceNumber = index;
    removeHighlights();
    if(squareObjects[index].piece === "red" || squareObjects[index].piece === "white") {
        if(!multiLeap) {
            highlight();
            kingSelected = false;
        }
    } else if(squareObjects[index].piece === "redKing" || squareObjects[index].piece === "whiteKing"){
        if(!multiLeap) {
            highlightKingMoves();
        } else {
            highlightKingLeaps();
        }
        kingSelected = true;
    }
}

function addPieceToSquare(index) {
    let currColor = redTurn ? "red" : "white";
    let newPiece = makePiece(currColor);
    allSquares[index].appendChild(newPiece);
    squareObjects[index].piece = currColor;
}

function removePiece(index) {
    let child = document.getElementById(index.toString());
    child.innerHTML = "";
    squareObjects[index].piece = "none";
}

function makeMove(index) {
    addPieceToSquare(index);
    if(redTurn) {
        if(index < 7) {
            turnToKing(index);
        }
    } else {
        if(index > 56) {
            turnToKing(index);
        }
    }
    removePiece(selectedPieceNumber);
}

function checkBasicMove(index) {
    if(redTurn) {
        return (index - selectedPieceNumber === -9
            || index - selectedPieceNumber === -7)
            && squareObjects[index].piece === "none"
            && squareObjects[index].isPlayable;
    } else {
        return (index - selectedPieceNumber === 9
            || index - selectedPieceNumber === 7)
            && squareObjects[index].piece === "none"
            && squareObjects[index].isPlayable;
    }
}

function basicMove(index) {
        if (checkBasicMove(index)) {
            makeMove(index);
            switchTurn();
            removeHighlights();
    }
}

function checkLeap(index) {
    let currColor = redTurn ? "white" : "red";
    if(!squareObjects[index].isPlayable || squareObjects[index].piece !== "none") {
        return -1;
    } else {
        if (index - selectedPieceNumber === 14) {
            if (squareObjects[index - 7].piece === currColor
                || squareObjects[index - 7].piece === currColor + "King") {
                return -7;
            }
        } else if (index - selectedPieceNumber === 18) {
            if (squareObjects[index - 9].piece === currColor
                || squareObjects[index - 9].piece === currColor + "King") {
                return -9;
            }
        } else if (index - selectedPieceNumber === -14) {
            if (squareObjects[index + 7].piece === currColor
                || squareObjects[index + 7].piece === currColor + "King") {
                return 7;
            }
        } else if (index - selectedPieceNumber === -18) {
            if (squareObjects[index + 9].piece === currColor
                || squareObjects[index + 9].piece === currColor + "King") {
                return 9;
            }
        } else {
            return -1;
        }
    }
}

function canLeap(index) {
    let tmp = selectedPieceNumber;
    selectedPieceNumber = index;
    for (let i = 0; i < allSquares.length; i++) {
        if(checkLeap(i) === -7 || checkLeap(i) === -9
            || checkLeap(i) === 7 || checkLeap(i) === 9) {
            selectedPieceNumber = tmp;
            return true;
        }
    }
    selectedPieceNumber = tmp;
    return false;
}

function leapMove(index) {
    let checkLeapVal = checkLeap(index);
    if(checkLeapVal === -7 || checkLeapVal === -9
    || checkLeapVal === 7 || checkLeapVal === 9) {
        adjustRemainingPiecesCount();
        makeMove(index);
        removePiece(index + checkLeapVal);
        if(canLeap(index)) {
            multiLeap = true;
            removeHighlights()
            choosePiece(index);
        } else {
            switchTurn();
            multiLeap = false;
            removeHighlights();
        }
        if(checkWinner()) {
            showWinner();
        }
    }
}

function adjustRemainingPiecesCount() {
    if(redTurn) {
        whiteLeft--;
    } else {
        redLeft--;
    }
}

function switchTurn() {
    pieceSelected = false;
    redTurn = !redTurn;
}

function highlight() {
    for (let i = 0; i < allSquares.length; i++) {
        if(!multiLeap && checkBasicMove(i)) {
            allSquares[i].style.backgroundColor = "dimgrey";
        }
        if(checkLeap(i) === -7 || checkLeap(i) === -9
            || checkLeap(i) === 7 || checkLeap(i) === 9) {
            allSquares[i].style.backgroundColor = "dimgrey";
        }
        if(i === selectedPieceNumber) {
            if(redTurn) {
                allSquares[i].style.backgroundColor = "darkred";
            } else {
                allSquares[i].style.backgroundColor = "midnightblue";
            }
        }

    }
}

function removeHighlights() {
    for (let i = 0; i < allSquares.length; i++) {
        if(squareObjects[i].isPlayable) {
            allSquares[i].style.backgroundColor = "black";
            squareObjects[i].available = false;
        }
    }
}

function checkWinner() {
    if(redLeft === 0 || whiteLeft === 0) {
        return true;
    }
}

function showWinner() {
    if(redLeft === 0) {
        alert("White win!!!");
    } else {
        alert("Red win!!!");
    }
    resetGame();
}

function resetGame() {
    playableSquares.length = 0;
    allSquares.length = 0;
    squareObjects.length = 0;
    pieceSelected = false;
    selectedPieceNumber = 0;
    multiLeap = false;
    redTurn = true;
    redLeft = 12;
    whiteLeft = 12;
    board.innerHTML = "";
    startGame();

    /////TESTER
    removePiece(54);
    addPieceToSquare(27);
    squareObjects[18].piece = "whiteKing";
    redTurn = !redTurn;
    removePiece(18);
    turnToKing(18);
}
resetButton.addEventListener("click", resetGame);

function turnToKing(index) {
    let currColor = redTurn ? "red" : "white";
    let king = makeKing(currColor);
    removePiece(index);
    allSquares[index].appendChild(king);
    squareObjects[index].piece = currColor + "King";
}

function makeKing(color) {
    let piece = document.createElement("div");
    piece.innerHTML = "<i class='fas fa-crown fa-2x'>";
    piece.style.color = color;
    piece.onmouseover = () => {
        if((redTurn && color === "red")
            || (!redTurn && color === "white")) {
            piece.style.transform = "rotate(360deg) scale(1.2)";
        }
    };
    piece.onmouseout = () => {
        piece.style.transform = "scale(1.0)";
    }
    return piece;
}

function checkKingMove(index) {
    return squareObjects[index].available;
}

function removePiecesKing(index) {
    let currColor = redTurn ? "white" : "red";
    if(index > selectedPieceNumber) {
        if((index-selectedPieceNumber) % 7 === 0) {
            for (let i = selectedPieceNumber; i < index; i+=7) {
                removePiece(i);
                if(squareObjects[i].piece === currColor) {
                    adjustRemainingPiecesCount();
                }
            }
        } else if((index-selectedPieceNumber) % 9 === 0) {
            for (let i = selectedPieceNumber; i < index; i += 9) {
                removePiece(i);
                if(squareObjects[i].piece === currColor) {
                    adjustRemainingPiecesCount();
                }
            }
        }
    } else {
        if((selectedPieceNumber-index) % 7 === 0) {
            for (let i = selectedPieceNumber; i > index; i -= 7) {
                removePiece(i);
                if(squareObjects[i].piece === currColor) {
                    adjustRemainingPiecesCount();
                }
            }
        } else if ((selectedPieceNumber-index) % 9 === 0) {
            for (let i = selectedPieceNumber; i > index; i -= 9) {
                removePiece(i);
                if(squareObjects[i].piece === currColor) {
                    adjustRemainingPiecesCount();
                }
            }
        }
    }
}

function highlightDiagonal(index, num) {
    let currColor = redTurn ? "red" : "white";
    if(index + num > allSquares.length || index + num < 0) {
        return 0;
    }
    if(squareObjects[index+num].piece === currColor
        || squareObjects[index+num].piece === currColor + "King"
        || !squareObjects[index+num].isPlayable) {
        return 0;
    } else {
        if(squareObjects[index+num].piece === "none") {
            allSquares[index+num].style.backgroundColor = "dimgrey";
            squareObjects[index+num].available = true;
        }
        highlightDiagonal(index+num, num);
    }
}

function highlightUpRightKingMoves(index) {
    highlightDiagonal(index, -7);
}

function highlightUpLeftKingMoves(index) {
    highlightDiagonal(index, -9)
}

function highlightDownLeftKingMoves(index) {
    highlightDiagonal(index, 7);
}

function highlightDownRightKingMoves(index) {
    highlightDiagonal(index, 9);
}

function highlightKingMoves() {
    highlightUpRightKingMoves(selectedPieceNumber);
    highlightUpLeftKingMoves(selectedPieceNumber);
    highlightDownRightKingMoves(selectedPieceNumber);
    highlightDownLeftKingMoves(selectedPieceNumber);
    allSquares[selectedPieceNumber].style.backgroundColor = "#986515";
}

function canKingLeap(index) {
    return  highlightKingLeapsOneDiagonal(index, 7)
        || highlightKingLeapsOneDiagonal(index, 9)
        || highlightKingLeapsOneDiagonal(index, -7)
        || highlightKingLeapsOneDiagonal(index, -9);
}


function highlightKingLeaps(index) {
    highlightKingLeapsOneDiagonal(index, 7);
    highlightKingLeapsOneDiagonal(index, 9);
    highlightKingLeapsOneDiagonal(index, -7);
    highlightKingLeapsOneDiagonal(index, -9);
    allSquares[selectedPieceNumber].style.backgroundColor = "#986515";
}

function highlightKingLeapsOneDiagonal(index, num) {
    let leapInAction = false;
    let canLeap = false;
    if(num > 0) {
        for (let i = index; i < allSquares.length; i+=num) {
            leapInAction = highlightKingLeapCheckSquare(i, leapInAction);
            if(leapInAction === -1) {
                return canLeap;
            } else if(leapInAction === 1) {
                canLeap = true;
            }
        }
    } else {
        for (let i = index; i >= 0; i+=num) {
            leapInAction = highlightKingLeapCheckSquare(i, leapInAction);
            if(leapInAction === -1) {
                return canLeap;
            } else if(leapInAction === 1) {
                canLeap = true;
            }
        }
    }
    return canLeap;
}

function highlightKingLeapCheckSquare(index, leapInAction) {
    let currColor = redTurn ? "red" : "white";
    let secondColor = !redTurn ? "red" : "white";
    if(squareObjects[index].piece === currColor) {
        return -1;
    }
    if(leapInAction) {
        if(squareObjects[index].isPlayable
            && squareObjects[index].piece === "none") {
            allSquares[index].style.backgroundColor = "blue";
            squareObjects[index].available = true;
            return 1;
        }
    } else {
        if(squareObjects[index].piece === secondColor) {
            leapInAction = true;
        }
    }
    return leapInAction;
}

function kingMove(index) {
    if(checkKingMove(index)) {
        makeMove(index);
        turnToKing(index);
        removePiecesKing(index);
        if(canKingLeap(index)) {
            multiLeap = true;
            removeHighlights();
            choosePiece(index);
            highlightKingLeaps(index);
        } else {
            multiLeap = false;
            switchTurn();
            removeHighlights();
            kingSelected = false;
        }
    }
}

function addEventListenersToSquares() {
    for (let i = 0; i < allSquares.length; i++) {
        if (squareObjects[i].isPlayable) {
            allSquares[i].style.backgroundColor = "black";
            allSquares[i].addEventListener("click", function () {
                if (!pieceSelected) {
                    if (redTurn) {
                        if (squareObjects[i].piece === "red" || squareObjects[i].piece === "redKing") {
                            choosePiece(i);
                        }
                    } else {
                        if (squareObjects[i].piece === "white" || squareObjects[i].piece === "whiteKing") {
                            choosePiece(i);
                        }
                    }
                } else {
                    if (squareObjects[i].piece === "none") {
                        if(!kingSelected) {
                            if(!multiLeap) {
                                basicMove(i);
                            }
                            leapMove(i);
                        } else {
                            kingMove(i);
                        }
                    } else if (redTurn) {
                        if (!multiLeap && squareObjects[i].piece === "red" || squareObjects[i].piece === "redKing") {
                            choosePiece(i);
                        }
                    } else {
                        if (!multiLeap && squareObjects[i].piece === "white" || squareObjects[i].piece === "whiteKing") {
                            choosePiece(i);
                        }
                    }
                }
            });
        }
    }
}