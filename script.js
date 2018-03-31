// Global Constants --------------------------------------------------------------
const EMPTY = 0;
const PLAYER_1 = 1;
const PLAYER_2 = 2;

const TIE = -1;
const ONGOING = 0;

const EMPTY_COLOR = "#111111";
const PLAYER_1_COLOR = "#FF5555";
const PLAYER_2_COLOR = "#5555FF";

const LINES = [
	0, 1, 2,  3, 4, 5,  6, 7, 8,
	0, 3, 6,  1, 4, 7,  2, 5, 8,
	0, 4, 8,  2, 4, 6	
];
// -------------------------------------------------------------------------------

// Global Variables --------------------------------------------------------------
let htmlTiles = null;
let htmlButton = null;

let reset = null;
let currentState = null;
// -------------------------------------------------------------------------------


// Board And Search Classes ------------------------------------------------------
class Board{
	constructor(){
		// Create a new board
		this.values = [];
		for(let i = 0; i < 9; i++){
			this.values.push(EMPTY);
		}

		this.player = PLAYER_1;
	}

	getCopy(){
		// Return a copy of this object
		let result = new Board();

		result.player = this.player;
		for(let i = 0; i < 9; i++){
			result.values[i] = this.values[i];
		}

		return result;
	}

	isLegalMove(play){
		// Return true if play is a legal move
		if(this.getWinner() != ONGOING){
			return false;
		}

		if(play < 0 || play >= 9){
			return false;
		}

		return this.values[play] == EMPTY;
	}

	getNextState(play){
		// Return new Board in state after play
		let result = this.getCopy();
		
		if(!this.isLegalMove(play)){
			return result;
		}

		result.values[play] = this.player;

		if(result.player == PLAYER_1){
			result.player = PLAYER_2;
		}
		else{
			result.player = PLAYER_1;
		}
		
		return result;
	}

	isBoardFull(){
		// Return true all tiles are occupied
		for(let i = 0; i < 9; i++){
			if(this.values[i] == EMPTY){
				return false;
			}
		}

		return true;
	}

	isWinner(player){
		// Return true is player has three in a row
		for(let i = 0; i < 8; i++){
			let win = true;

			for(let j = 0; j < 3; j++){
				if(this.values[LINES[j + 3 * i]] != player){
					win = false;
					break;
				}
			}

			if(win == true){
				return true;
			}
		}

		return false;
	}

	getWinner(){
		// If game has been won, return player that won
		if(this.isWinner(PLAYER_1)){
			return PLAYER_1;
		}
		if(this.isWinner(PLAYER_2)){
			return PLAYER_2;
		}

		// If game is a tie, return TIE
		if(this.isBoardFull()){
			return TIE;
		}

		// If game is ongoing, return ONGOING
		return ONGOING;
	}
}

class Search{
	constructor(state){
		// Set initial state of the search tree
		this.rootNode = state.getCopy();
	}

	getPlay(){
		return this.negamax(this.rootNode, 0);
	}

	negamax(state, depth){
		if(state.getWinner() == TIE){
			return 0;
		}
		if(state.getWinner() != ONGOING){
			return depth - 10;
		}

		let greatestValue = -Infinity;
		let index = 0;

		for(let i = 0; i < 9; i++){
			if(state.isLegalMove(i) == false){
				continue;
			}

			let childState = state.getNextState(i);

			let moveValue = -this.negamax(childState, depth + 1);

			if(moveValue >= greatestValue){
				greatestValue = moveValue;
				index = i;
			}
		}

		if(depth == 0){
			return index;
		}

		return greatestValue;
	}
}
// -------------------------------------------------------------------------------

// User Interface Stuff ----------------------------------------------------------
function setup(){
	htmlTiles = document.getElementsByClassName("tile");
	htmlButton = document.getElementsByClassName("button")[0];

	reset = true;
	currentState = new Board();

	for(let i = 0; i < 9; i++){
		htmlTiles[i].addEventListener("click", function(evt){
			tileClick(i);
		}, false);
	}

	htmlButton.addEventListener("click", buttonClick, false);

	updateHTML();
}

window.addEventListener("load", function(evt){
	setup();
}, false);

function updateHTML(){
	for(let i = 0; i < 9; i++){
		if(currentState.values[i] == PLAYER_1){
			htmlTiles[i].style.background = PLAYER_1_COLOR;
		}
		else if(currentState.values[i] == PLAYER_2){
			htmlTiles[i].style.background = PLAYER_2_COLOR;
		}
		else{
			htmlTiles[i].style.background = EMPTY_COLOR;
		}
	}

	if(reset == true){
		htmlButton.innerHTML = "Let the ai go first";
	}
	else{
		htmlButton.innerHTML = "Reset";
	}
}

function claimTile(tileIndex){
	if(currentState.isLegalMove(tileIndex)){
		currentState = currentState.getNextState(tileIndex);

		reset = false;
	}

	updateHTML();
}

function callAI(){
	let ai = new Search(currentState);
	let play = ai.getPlay();

	claimTile(play);
}

function resetBoard(){
	currentState = new Board();
	reset = true;

	updateHTML();
}

function tileClick(tileIndex){
	if(currentState.isLegalMove(tileIndex) == false)
		return;

	claimTile(tileIndex);

	if(currentState.getWinner() == ONGOING){
		requestAnimationFrame(callAI);
	}
}

function buttonClick(){
	if(reset == true){
		callAI();
	}
	else{
		resetBoard();
	}
}
// -------------------------------------------------------------------------------