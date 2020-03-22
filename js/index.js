var sw = 20, //一个方块的宽度
    sh = 20, //一个方块的高度
    tr = 30, //行数
    td = 30; //列数
var snake = null, //蛇实例
    food = null, //食物实例
    game = null; //游戏逻辑实例
function Square(x, y, classname) {
    this.x = x * sw;
    this.y = y * sh;
    this.class = classname;

    this.viewContent = document.createElement('div');
    this.viewContent.className = this.class;
    this.parent = document.getElementById('snakeWrap');
}
Square.prototype.create = function() { //创建方块DOM
    this.viewContent.style.position = 'absolute';
    this.viewContent.style.width = sw + 'px';
    this.viewContent.style.height = sh + 'px';
    this.viewContent.style.left = this.x + 'px';
    this.viewContent.style.top = this.y + 'px';

    this.parent.appendChild(this.viewContent);

};
Square.prototype.remove = function() {
    this.parent.removeChild(this.viewContent);
};

//蛇
function Snake() {
    this.head = null;
    this.tail = null;
    this.pos = [];

    this.directionNum = {
        left: {
            x: -1,
            y: 0
        },
        right: {
            x: 1,
            y: 0
        },
        up: {
            x: 0,
            y: -1
        },
        down: {
            x: 0,
            y: 1
        }
    }
};
Snake.prototype.init = function() {
    //蛇头
    var snakeHead = new Square(2, 0, 'snakeHead');
    snakeHead.create();
    this.head = snakeHead;
    this.pos.push([2, 0]);

    var snakeBody1 = new Square(1, 0, 'snakeBody');
    snakeBody1.create();
    this.pos.push([1, 0]);

    var snakeBody2 = new Square(0, 0, 'snakeBody');
    snakeBody2.create();
    this.tail = snakeBody2;
    this.pos.push([0, 0]);

    //形成链表关系
    snakeHead.last = null;
    snakeHead.next = snakeBody1;

    snakeBody1.last = snakeHead;
    snakeBody1.next = snakeBody2;

    snakeBody2.last = snakeBody1;
    snakeBody2.next = null;

    //蛇默认方向
    this.direction = this.directionNum.right;
}

//获取蛇头下一个位置
Snake.prototype.getNextPos = function() {
    var nextPos = [ //蛇头要走的下一个点坐标
        this.head.x / sw + this.direction.x,
        this.head.y / sh + this.direction.y
    ]

    //下一个点是自己，代表撞到了自己，game over
    var selfCollied = false; //是否撞到自己
    this.pos.forEach((value) => {
        if (value[0] == nextPos[0] && value[1] == nextPos[1]) {
            selfCollied = true;
        }
    })
    if (selfCollied) {
        this.strategies.die.call(this);
        return;
    }
    //下一个点是墙，game over
    if (nextPos[0] < 0 || nextPos[1] < 0 || nextPos[0] > td - 1 || nextPos[1] > tr - 1) {
        this.strategies.die.call(this);
        return;
    }
    //下个点是食物，吃
    if (food && food.pos[0] == nextPos[0] && food.pos[1] == nextPos[1]) {
        //如果条件成立，蛇头下一个点就是食物的点
        console.log('得分了！')
        this.strategies.eat.call(this)
        return;
    }
    //下一个点什么都不是，走
    this.strategies.move.call(this);
};
//处理碰撞后要做的事
Snake.prototype.strategies = {
    move: function(format) { //当传了这个参数后就是吃
        //在旧蛇头的位置创建新身体
        var newBody = new Square(this.head.x / sw, this.head.y / sh, 'snakeBody')

        //更新链表的关系
        newBody.next = this.head.next;
        newBody.next.last = newBody;
        newBody.last = null;

        this.head.remove(); //删除旧蛇头
        newBody.create();

        //创建一个新蛇头(蛇头下一个要走的点)
        var newHead = new Square(this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y, 'snakeHead')

        //更新链表的关系
        newHead.next = newBody;
        newHead.last = null;
        newBody.last = newHead;
        newHead.create();

        //蛇身上的每一个坐标也要更新
        this.pos.splice(0, 0, [this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y])
        this.head = newHead;

        if (!format) {
            this.tail.remove();
            this.tail = this.tail.last;

            this.pos.pop();
        }
    },
    eat: function() {
        this.strategies.move.call(this, true);
        createFood();
        game.score++;
    },
    die: function() {
        game.over()
    }
}
snake = new Snake();

//创建食物
function createFood() {
    //食物的随机坐标
    var x = null;
    var y = null;

    var include = true; //循环调成的条件，true表示食物的坐标在蛇身上

    while (include) {
        x = Math.round(Math.random() * (td - 1));
        y = Math.round(Math.random() * (tr - 1));
        snake.pos.forEach((value) => {
            if (x != value[0] && y != value[1]) {
                include = false;
            }
        })
    }
    //生成食物
    food = new Square(x, y, 'food');
    food.pos = [x, y]; //存储生成食物坐标

    var foodDom = document.querySelector('.food');
    if (foodDom) {
        foodDom.style.left = x * sw + 'px';
        foodDom.style.top = y * sh + 'px';
    } else {
        food.create();
    }
}

//创建游戏逻辑
function Game() {
    this.timer = null;
    this.score = 0;
}
Game.prototype.init = function() {
    snake.init();
    createFood();
    document.onkeydown = function(ev) {
        if (ev.which == 37 && snake.direction != snake.directionNum.right) {
            snake.direction = snake.directionNum.left;
        } else if (ev.which == 38 && snake.direction != snake.directionNum.down) {
            snake.direction = snake.directionNum.up;
        } else if (ev.which == 39 && snake.direction != snake.directionNum.left) {
            snake.direction = snake.directionNum.right;
        } else if (ev.which == 40 && snake.direction != snake.directionNum.up) {
            snake.direction = snake.directionNum.down;
        }
    };
    this.start();
}
Game.prototype.start = function() {
    this.timer = setInterval(function() {
        snake.getNextPos()
    }, 200)
}
Game.prototype.pause = function() {
    clearInterval(this.timer)
}
Game.prototype.over = function() {
        clearInterval(this.timer);
        alert('你的得分为：' + this.score);
        // 游戏回到最初状态
        var snakeWrap = document.getElementById('snakeWrap');
        snakeWrap.innerHTML = '';

        snake = new Snake();
        game = new Game()

        var startBtnWrap = document.querySelector('.startBtn');
        startBtnWrap.style.display = 'block';
    }
    //开启游戏
game = new Game();
var startBtn = document.querySelector('.startBtn button');
startBtn.onclick = function() {
    startBtn.parentNode.style.display = 'none';
    game.init();
};

//暂停
var snakeWrap = document.getElementById('snakeWrap');
var pauseBtn = document.querySelector('.pauseBtn button');
snakeWrap.onclick = function() {
    game.pause();
    pauseBtn.parentNode.style.display = 'block';
}
pauseBtn.onclick = function() {
    game.start();
    pauseBtn.parentNode.style.display = 'none';
}