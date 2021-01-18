class Settings {
    constructor(param) {
        this.rowCount = 21;
        this.colCount = 21;
        this.bomb = 5;
        this._init(param);
    }
    _init(param) {
        let defaultParams = { rowCount: 21, colCount: 21, bomb: 5, };
        Object.assign(defaultParams, param);
        this.rowCount = defaultParams.rowCount;
        this.colCount = defaultParams.colCount;
        this.bomb = defaultParams.bomb;
    }
}

class Status {
    constructor() {
        this.status = 'playing';
    }
    setPlaying() {
        this.status = 'playing';
    }
    setStoping() {
        this.status = 'stoping';
    }

    isPlaying() {
        return this.status === 'playing';
    }
    isStoping() {
        return this.status === 'stoping';
    }
}

class Board {
    constructor(settings) {
        this.boardEl = null;
        this.parametrsEl = document.getElementById('parameters');
        this.tableWrp = document.querySelector('.table-wrp');
        this.settings = settings;
        this._init();
    }

    _init() {
        this.renderParameterSelection();
    }

    renderNumberCell(x, y, tdElems) {
        let bombCounter = tdElems.filter(tdEl => tdEl.classList.contains('bomb'));
        let tdEl = this.getCellEl(x, y);
        tdEl.textContent = String(bombCounter.length);
        tdEl.classList.add('td--background');
    }

    cellFill(tdElems) {
        tdElems.forEach(tdEl => {
            tdEl.classList.contains('td--image') ? tdEl.classList.remove('td--image') : tdEl.classList.add('td--background');
        })
    }

    clearboard() {
        let tdElems = document.querySelectorAll('td');
        tdElems.forEach(tdEl => {
            tdEl.className = '';
            tdEl.textContent = '';
        })
    }

    showAllBombs() {
        let tdElems = document.querySelectorAll('.bomb');
        tdElems.forEach(tdEl => {
            if (tdEl.classList.contains('td--image')) {
                tdEl.classList.remove('td--image');
            }
            tdEl.classList.add('td--bomb');
        });
    }

    renderParameterSelection() {
        let parameterSelection = `<h2>Выберите сложность игры:</h2>
         <p class="parameters__text">
             <input type="radio" class="parameters__input" id="easy-game" name="parameter" value="easy">
             <label for="easy-game">Новичок</label>
         </p>
         <p class="parameters__text">
             <input type="radio" class="parameters__input" id="middle-game" name="parameter" value="middle">
             <label for="middle-game">Любитель</label>
         </p>
         <p class="parameters__text">
             <input type="radio" class="parameters__input" id="hard-game" name="parameter" value="hard">
             <label for="hard-game">Профессионал</label>
         </p>`
        this.parametrsEl.insertAdjacentHTML('afterbegin', parameterSelection);
    }

    renderBoard() {
        let boardEl = document.createElement('table');
        for (let row = 0; row < this.settings.rowCount; row++) {
            let tr = document.createElement('tr');
            boardEl.appendChild(tr);
            for (let col = 0; col < this.settings.colCount; col++) {
                let td = document.createElement('td');
                tr.appendChild(td);
            }
        }
        this.tableWrp.insertAdjacentElement('beforeend', boardEl);
        this.boardEl = boardEl;
    }

    clearParameterSelection() {
        this.parametrsEl.remove();
    }

    renderBomb(coordsBomb) {
        let bodyElems = this.getBombsCoords(coordsBomb.bomb);
        bodyElems.forEach(td => {
            td.classList.add('bomb');
        })
    }

    renderCounter(counter) {
        counter.textContent = this.settings.bomb
    }

    changeCounter(counter) {
        let flags = document.querySelectorAll('.td--image');
        counter.textContent = this.settings.bomb - flags.length;
    }

    getBombsCoords(bombCoords) {
        if (bombCoords.length > 0) {
            let coordsElems = [];
            for (let elem of bombCoords) {
                let tdEl = this.getCellEl(elem.x, elem.y);
                coordsElems.push(tdEl);
            }
            return coordsElems;
        }
    }

    bombCheck(tdElems) {
        return tdElems.some(tdEl => tdEl.classList.contains('bomb'))
    }

    cellRepeatCheck(cell) {
        return cell.classList.contains('td--background');
    }

    isNextCellWall(coords) {
        return coords.x > this.settings.colCount || coords.y > this.settings.rowCount || coords.x < 1 || coords.y < 1 ? true : false;
    }

    isCellBomb(event) {
        return event.target.className === 'bomb';
    }

    getCellEl(x, y) {
        return this.boardEl.querySelector(`tr:nth-child(${y}) td:nth-child(${x})`);
    }
}

class Bomb {
    constructor(settings, board) {
        this.bomb = [];
        this.settings = settings;
        this.board = board;
    }

    setNewBomb() {
        const bomb = this.generateRandomCoordinates();
        this.board.renderBomb(bomb);
    }

    generateRandomCoordinates() {
        this.bomb = [];
        while (this.bomb.length !== this.settings.bomb) {
            let bombCcoords = {
                x: Math.floor(Math.random() * this.settings.colCount) + 1,
                y: Math.floor(Math.random() * this.settings.rowCount) + 1,
            }
            if (this.bombsRepeat(bombCcoords)) {
                continue;
            }
            this.bomb.push(bombCcoords);
        }
        return this;
    }

    bombsRepeat(coords) {
        if (this.bomb.length > 0) {
            return this.bomb.some(value => value.x == coords.x && value.y == coords.y)
        }
    }
}

class Menu {
    constructor(settings, board) {
        this.settings = settings;
        this.board = board;
        this.resetBtn = document.querySelector('button');
        this.counterWindow = document.querySelector('.menu__counter');
        this.timerWindow = document.querySelector('.menu__timer');
    }

    addButtonClickListener(addButtonHandlerReset) {
        this.resetBtn.addEventListener('click', addButtonHandlerReset);
    }
}

class Game {
    constructor(settings, board, status, bomb, menu) {
        this.settings = settings;
        this.board = board;
        this.status = status;
        this.bomb = bomb;
        this.menu = menu;
        this.headerEl = document.querySelector('.header')
        this.inputParameters = document.querySelectorAll('.parameters__input');
        this.tickIdentifier = null;
        this.x = null;
        this.y = null;
        this.lock = true;
        this.cellSteps = [];
        this._init();
    }

    _init() {
        this.selectGameOptions();
    }

    selectGameOptions() {
        this.inputParameters.forEach(inputEl => {
            inputEl.addEventListener('change', (event) => {
                if (innerWidth < 576) {
                    this.headerEl.classList.add('header--display');
                }
                if (event.target.value == 'easy') {
                    this.settings.rowCount = 10;
                    this.settings.colCount = 10;
                    this.settings.bomb = 10;
                }
                if (event.target.value == 'middle') {
                    this.settings.rowCount = 16;
                    this.settings.colCount = 16;
                    this.settings.bomb = 40;
                }
                if (innerWidth < 576 && event.target.value == 'hard') {
                    this.settings.rowCount = 25;
                    this.settings.colCount = 16;
                    this.settings.bomb = 99;
                }

                if (innerWidth > 576 && event.target.value == 'hard') {
                    this.settings.rowCount = 16;
                    this.settings.colCount = 30;
                    this.settings.bomb = 99;
                }

                if (event.target.checked) {
                    this.board.clearParameterSelection();
                    this.board.renderBoard();
                    this.bomb.setNewBomb();
                    this.board.renderCounter(this.menu.counterWindow);
                    this.renderTimer(this.menu.timerWindow, 0);
                    this.initEventHandlers();
                    this.menu.addButtonClickListener(() => this.reset());
                }
            })
        })
    }

    renderTimer(timer, n) {
        let sec = n;
        this.tickIdentifier = setInterval(() => {
            if (sec < 999) {
                sec++;
                timer.textContent = sec;
            } else {
                clearInterval(this.tickIdentifier);
            }
        }, 1000)
    }

    reset() {
        this.board.clearboard();
        this.bomb.setNewBomb();
        clearInterval(this.tickIdentifier);
        this.renderTimer(this.menu.timerWindow, -1);
        this.board.renderCounter(this.menu.counterWindow);
        this.status.setPlaying();
        this.menu.resetBtn.classList.remove('button--image-lost', 'button--image-win');
    }

    initEventHandlers() {
        this.board.boardEl.addEventListener('click', event => this.cellClickHandler(event));
        this.board.boardEl.addEventListener('contextmenu', event => {
            event.preventDefault();
            this.cellClickHandler2(event)
        })
    }

    cellClickHandler(event) {
        if (!this.isCorrectClick(event)) {
            return;
        }
        if (this.cellContainsFlag(event)) {
            return;
        }
        this.gameProcess(event);
    }

    cellClickHandler2(event) {
        if (!this.isCorrectClick(event)) {
            return;
        }
        this.setFlag(event);
        this.board.changeCounter(this.menu.counterWindow);
    }

    isCorrectClick(event) {
        return this.status.isPlaying() && this.isClickByCell(event) && this.isRepeatedClickByCell(event);
    };

    cellContainsFlag(event) {
        return event.target.classList.contains('td--image');
    }


    isClickByCell(event) {
        return event.target.tagName === 'TD';
    };

    isRepeatedClickByCell(event) {
        return !this.board.cellRepeatCheck(event.target);
    }

    gameProcess(event) {
        if (this.isGameLost(event)) {
            return;
        }
        this.x = event.target.cellIndex + 1;
        this.y = event.target.parentNode.rowIndex + 1;
        event.target.classList.add('td--background');
        this.checkNearbyCells(this.x, this.y);
        if (this.isGameWin()) {
            return;
        }
    }

    setFlag(event) {
        !event.target.classList.contains('td--image') ? event.target.classList.add('td--image') : event.target.classList.remove('td--image');
    }

    checkNearbyCells(x, y) {
        let tdElems = [];
        let coordsNearbyCells = [
            { x: x + 1, y: y },
            { x: x - 1, y: y },
            { x: x, y: y + 1 },
            { x: x + 1, y: y + 1 },
            { x: x - 1, y: y + 1 },
            { x: x, y: y - 1 },
            { x: x + 1, y: y - 1 },
            { x: x - 1, y: y - 1 },
        ]
        for (let coords of coordsNearbyCells) {
            if (this.board.isNextCellWall(coords)) {
                continue;
            }
            let tdEl = this.board.getCellEl(coords.x, coords.y);
            if (this.board.cellRepeatCheck(tdEl)) {
                continue;
            }
            tdElems.push(tdEl);
        }
        if (!this.board.bombCheck(tdElems)) {
            tdElems.forEach(tdEl => {
                this.cellSteps.push(tdEl);
            })
            this.board.cellFill(tdElems);
            if (this.lock) {
                this.lock = false;
                for (let coords of this.cellSteps) {
                    this.x = coords.cellIndex + 1;
                    this.y = coords.parentNode.rowIndex + 1;
                    this.checkNearbyCells(this.x, this.y);
                }
                this.lock = true;
                this.cellSteps = [];
            }
        }
        if (this.board.bombCheck(tdElems)) {
            this.board.renderNumberCell(this.x, this.y, tdElems);
        }
    }

    setIconLost() {
        this.menu.resetBtn.classList.add('button--image-lost');
    }

    setIconWin() {
        this.menu.resetBtn.classList.add('button--image-win');
    }

    isGameWin() {
        if (this.settings.rowCount * this.settings.colCount - document.querySelectorAll('.td--background').length === this.settings.bomb) {
            this.status.setStoping();
            clearInterval(this.tickIdentifier);
            this.setIconWin();
            return true;
        }
        return false;
    }

    isGameLost(event) {
        if (this.board.isCellBomb(event)) {
            this.status.setStoping();
            this.board.showAllBombs();
            clearInterval(this.tickIdentifier);
            this.setIconLost()
            return true;
        }
        return false;
    }
}

window.addEventListener('load', () => {
    const settings = new Settings({ rowCount: 10, colCount: 10, bomb: 0 });
    const status = new Status;
    const board = new Board(settings);
    const bomb = new Bomb(settings, board);
    const menu = new Menu(settings, board);
    const game = new Game(settings, board, status, bomb, menu);
})