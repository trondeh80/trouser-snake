class Game {

    constructor() {
        this.setupCanvas();
    }

    setupCanvas() {

        this.density = 10;
        this.speed = 9; // Difficulty
        this.gridsize = [1080, 800];
        this.drawable = {};
        this.lastFrameMs = 0;
        this.direction = 1; // 0 = up, 1 = right, 2 = down, 3 = left.

        this.dom = document.querySelector('.game');
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'canvas';
        this.canvas.width = this.gridsize[0];
        this.canvas.height = this.gridsize[1];
        this.dom.appendChild(this.canvas);

        this.addKeyListener();

        this.addStartPosition();

        // Start loop
        this.loop(0);
    }

    addKeyListener() {
        window.addEventListener('keydown', event => {
            if (event.key === 'ArrowUp') {
                this.direction = 0;
            } else if (event.key === 'ArrowRight') {
                this.direction = 1;
            } else if (event.key === 'ArrowDown') {
                this.direction = 2;
            } else if (event.key === 'ArrowLeft') {
                this.direction = 3;
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
            const foodPos = {
                x: Math.floor(Math.random() * (this.gridsize[0] / this.density)),
                y: Math.floor(Math.random() * (this.gridsize[1] / this.density))
            };
            this.drawable.food = {
                x: foodPos.x,
                y: foodPos.y
            }
        }
        return this.drawable.food;
    }

    drawFood() {
        const food = this.getFood();
        this.getContext().fillStyle = 'red';
        this.getContext().fillRect(food.x * this.density, food.y * this.density, 10, 10);
    }

    intersects() {
        // Intersects food:
        if (this.drawable.food.x === this.drawable.player.position.x &&
            this.drawable.food.y === this.drawable.player.position.y) {
            this.drawable.player.eaten++;
            this.drawable.food = null;
            if (this.drawable.player.eaten % 5 === 0) {
                this.speed = this.speed * 0.8; // Increase speed by 20%;
            }
        }
    }

    loop(timestamp) {

        // console.log('timestamp: ', timestamp);

        // Reset board:
        this.getContext().fillStyle = 'white';
        this.getContext().fillRect(0, 0, this.gridsize[0], this.gridsize[1]);

        this.drawFood(); // draw new og existing food item

        this.movePlayer(); // updates player position.

        this.intersects(); // handles intersection. (extends snake, or player looses)

        this.drawPlayer();

        // Wait to simulate correct timing.
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

    getContext() {
        if (!this.ctx) {
            this.ctx = this.canvas.getContext('2d');
        }
        return this.ctx;
    }

    movePlayer() {

        const {x, y} = this.drawable.player.position;

        if (this.direction === 1) { // right
            this.drawable.player.position.x = (x + 1 >= this.gridsize[0] / this.density) ? 0 : x + 1;
        } else if (this.direction === 3) { // left
            this.drawable.player.position.x = (x - 1 <= 0) ? this.gridsize[0] / this.density : x - 1;
        } else if (this.direction === 0) {
            this.drawable.player.position.y = (y - 1 <= 0) ? this.gridsize[1] / this.density : y - 1;
        } else if (this.direction === 2) {
            this.drawable.player.position.y = (y + 1 >= this.gridsize[1] / this.density) ? 0 : y + 1;
        }

        if (this.drawable.player.moves[0].direction !== this.direction) {
            this.drawable.player.moves.splice(0, 0, {
                direction: this.direction,
                x: this.drawable.player.position.x,
                y: this.drawable.player.position.y
            });
        }
    }

    drawPlayer() {
        let {x, y} = this.drawable.player.position;
        const ctx = this.getContext();
        ctx.fillStyle = '#000000';

        // draw current position!
        ctx.fillRect(x * this.density, y * this.density, this.density, this.density); // density = 10 ie.

        // draw tail TODO: fix this using vector!
        let drawn = this.drawable.player.eaten;
        let moves = 0;
        while (drawn > 0) {
            let move = this.drawable.player.moves[moves];
            let dir = move.direction;

            if (dir === 1) { // right
                x = x - 1;
            } else if (dir === 3) {
                x = x + 1;
            } else if (dir === 0) {
                y = y + 1;
            } else if (dir === 2) {
                y = y - 1;
            }

            ctx.fillRect(x * this.density, y * this.density, this.density, this.density); // density = 10 ie.

            if (x === move.x && y === move.y) {
                moves++;
            }

            drawn--;
        }


    }
}

const game = new Game();