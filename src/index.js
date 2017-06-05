class Game {

    constructor() {

        this.setupCanvas();

        this.addKeyListener();

        this.addMouseListener();

        this.addStartPosition();

        // Start render loop
        this.loop(0);
    }

    setupCanvas() {
        this.gameover = false;
        this.highscores = [];
        this.density = 20;
        this.speed = 9; // Difficulty
        this.gridsize = [1080, 600];
        this.drawable = {};
        this.score = 0;
        this.lastFrameMs = 0;
        this.direction = 1; // 0 = up, 1 = right, 2 = down, 3 = left.

        this.dom = document.querySelector('.game');
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'canvas';
        this.canvas.width = this.gridsize[0];
        this.canvas.height = this.gridsize[1];
        this.dom.appendChild(this.canvas);
    }

    addKeyListener() {
        window.addEventListener('keydown', event => {
            if (event.key === 'ArrowUp' && this.direction !== 2) {
                this.direction = 0;
            } else if (event.key === 'ArrowRight' && this.direction !== 3) {
                this.direction = 1;
            } else if (event.key === 'ArrowDown' && this.direction !== 0) {
                this.direction = 2;
            } else if (event.key === 'ArrowLeft' && this.direction !== 1) {
                this.direction = 3;
            }
        });
    }

    addMouseListener() {
        window.addEventListener('mouseup', event => {
            if (this.gameover) {
                this.addStartPosition();
                this.gameover = false;
                this.speed = 9; // Difficulty
                this.score = 0;
            }
        });
    }

    addStartPosition() {
        const x = 10;
        const y = 10;
        this.drawable.player = {
            position: {x, y},
            increment: false,
            eaten: 0,
            moves: [{
                direction: this.direction,
                x,
                y
            }]
        }
    }

    getFood() {
        if (!this.drawable.food) {
            this.drawable.food = {
                x: Math.floor(Math.random() * (this.gridsize[0] / this.density)),
                y: Math.floor(Math.random() * (this.gridsize[1] / this.density))
            }
        }
        return this.drawable.food;
    }

    drawFood() {
        const food = this.getFood();
        this.getContext().fillStyle = 'red';
        this.getContext().fillRect(food.x * this.density, food.y * this.density, this.density, this.density);
    }


    intersects() {
        // Intersects food:
        if (this.drawable.food.x === this.drawable.player.position.x &&
            this.drawable.food.y === this.drawable.player.position.y) {
            this.drawable.player.eaten++;
            this.drawable.food = null;

            this.score = Math.floor((this.drawable.player.eaten + 1) * (this.drawable.player.eaten * (this.speed)));

            if (this.drawable.player.eaten % 5 === 0) {
                this.speed = this.speed * 0.8; // Increase speed by 20%;
            }
        }

        for (let z = this.drawable.player.eaten; z > 0; z--) {
            let move = this.drawable.player.moves[z];
            if (z > 3 && this.drawable.player.position.x === move.x && this.drawable.player.position.y === move.y) {
                this.gameover = true;
            }
        }
    }

    loop(timestamp) {

        // Reset board:
        this.getContext().fillStyle = 'white';
        this.getContext().fillRect(0, 0, this.gridsize[0], this.gridsize[1]);

        if (this.gameover) {

            this.drawGameOver();

        } else {

            this.drawFood(); // draw new og existing food item

            this.movePlayer(); // updates player position.

            this.intersects(); // handles intersection. (extends snake, or player looses)

            this.drawPlayer();

            this.setScore(this.score);

        }

        // Wait to simulate correct timing. TODO: Fix this...
        let waiting = true;
        let ts = Date.now();
        while (waiting) {
            if (Date.now() - ts >= this.speed * 10) {
                waiting = false;
                this.lastFrameMs = timestamp;
            }
        }

        window.requestAnimationFrame(this.loop.bind(this));
    }

    movePlayer() {

        for (let z = this.drawable.player.eaten + 1; z > 0; z--) {
            this.drawable.player.moves[z] = {
                x: this.drawable.player.moves[(z - 1)].x,
                y: this.drawable.player.moves[(z - 1)].y
            };
        }

        const {x, y} = this.drawable.player.position;

        if (this.direction === 1) { // right
            this.drawable.player.position.x = (x + 1 === this.gridsize[0] / this.density) ? 0 : x + 1;
        } else if (this.direction === 3) { // left
            this.drawable.player.position.x = (x - 1 < 0) ? this.gridsize[0] / this.density : x - 1;
        } else if (this.direction === 0) {
            this.drawable.player.position.y = (y - 1 < 0) ? this.gridsize[1] / this.density : y - 1;
        } else if (this.direction === 2) {
            this.drawable.player.position.y = (y + 1 === this.gridsize[1] / this.density) ? 0 : y + 1;
        }

        this.drawable.player.moves[0] = {
            direction: this.direction,
            x: this.drawable.player.position.x,
            y: this.drawable.player.position.y
        };
    }


    setScore(score) {
        document.querySelector('.score-points').innerHTML = score;
    }

    setHighscore() {
        let highest = this.highscores.reduce((memo, item) => {
            return item.score > memo ? item.score : memo;
        }, 0);
        if (this.score > highest) {
            document.querySelector('.high-score-points').innerHTML = this.score;
            this.highscores.push({ score: this.score });
        }
    }

    drawGameOver() {

        this.setHighscore();

        const ctx = this.getContext();
        ctx.font = '48px serif';
        ctx.fillStyle = '#000';
        ctx.drawStyle = '#000';
        ctx.fillText('GAME OVER', this.gridsize[0] / 2 - 150, this.gridsize[1] / 2, this.gridsize[1] / 2);
    }

    drawPlayer() {
        const ctx = this.getContext();
        ctx.fillStyle = '#000000';
        const playerBits = this.drawable.player.eaten + 1;
        for (let v = 0; v < playerBits; v++) {
            let move = this.drawable.player.moves[v];
            ctx.fillRect(move.x * this.density, move.y * this.density, this.density, this.density); // density = 10 ie.
        }
    }


    getContext() {
        if (!this.ctx) {
            this.ctx = this.canvas.getContext('2d');
        }
        return this.ctx;
    }

}

const game = new Game();