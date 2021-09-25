function Canvas(element, checkerboardColumns, checkerboardRows) {
  this.element = element
  this.context = this.element.getContext('2d')

  this.checkerboardColumns = checkerboardColumns
  this.checkerboardRows = checkerboardRows

  this.squareWidth = 0
  this.squareHeight = 0

  this.initialized = false

  this.initialize = () => {
    if (this.initialized) return

    this.resize()
    this.initialized = true
  }

  this.startListener = (step) => {
    const touch = {
      start: {
        x: 0,
        y: 0
      },
      end: {
        x: 0,
        y: 0
      }
    }

    this.element.addEventListener('touchstart', (event) => {
      touch.start.x = event.changedTouches[0].screenX
      touch.start.y = event.changedTouches[0].screenY
    })

    this.element.addEventListener('touchend', (event) => {
      touch.end.x = event.changedTouches[0].screenX
      touch.end.y = event.changedTouches[0].screenY

      const key = manageGesture()
      step(key)
    })

    function manageGesture() {
      if (touch.start.x !== touch.end.x && touch.start.y !== touch.end.y) {
        const numbers = {
          nearest: {
            x: Math.min(touch.start.x, touch.end.x),
            y: Math.min(touch.start.y, touch.end.y)
          },
          farest: {
            x: Math.max(touch.start.x, touch.end.x),
            y: Math.max(touch.start.y, touch.end.y)
          }
        }
  
        const diffX = numbers.farest.x - numbers.nearest.x
        const diffY = numbers.farest.y - numbers.nearest.y
  
        if (diffX >= diffY) {
          if (touch.start.x > touch.end.x) {
            return 'ArrowLeft'
          } else {
            return 'ArrowRight'
          }
        } else {
          if (touch.start.y > touch.end.y) {
            return 'ArrowUp'
          } else {
            return 'ArrowDown'
          }
        }
      }
    }
  }

  this.viewport = {
    x: 0,
    y: 0,
    size: 0
  }

  this.resize = () => {
    this.element.width = document.body.clientWidth
    this.element.style.width = document.body.clientWidth
    this.element.height = document.body.clientHeight
    this.element.style.height = document.body.clientHeight

    if (this.element.width <= this.element.height) {
      this.viewport.size = this.element.width
      this.viewport.x = 0
      this.viewport.y = this.element.height / 2 - this.viewport.size / 2
    } else {
      this.viewport.size = this.element.height
      this.viewport.x = this.element.width / 2 - this.viewport.size / 2
      this.viewport.y = 0
    }

    this.squareWidth = this.viewport.size / this.checkerboardColumns
    this.squareHeight = this.viewport.size / this.checkerboardRows
  }

  this.context.fillRectByViewport = (x, y, width, height) => {
    // console.log(this.viewport.x)
    this.context.fillRect(
      this.viewport.x + x,
      this.viewport.y + y,
      width,
      height
    )
  }

  this.context.fillTextByViewport = (text, x, y) => {
    this.context.fillText(
      text,
      this.viewport.x + x,
      this.viewport.y + y
    )
  }

  this.drawBackground = () => {
    this.context.fillStyle = '#333'
    this.context.fillRect(
      0,
      0,
      this.element.width,
      this.element.height
    )

    for (let i = 0; i < this.checkerboardRows; i++) {
      for (let j = 0; j < this.checkerboardColumns / 2; j++) {
        this.context.fillStyle = '#89c955'
        this.context.fillRectByViewport(
          j * this.squareWidth * 2 + (i % 2 === 1 ? this.squareWidth : 0),
          i * this.squareHeight,
          this.squareWidth,
          this.squareHeight
        )

        this.context.fillStyle = '#9bfc4c'
        this.context.fillRectByViewport(
          j * this.squareWidth * 2 + (i % 2 === 0 ? this.squareWidth : 0),
          i * this.squareHeight,
          this.squareWidth,
          this.squareHeight
        )
      }
    }
  }
}

function Snake(bodyParts) {
  this.bodyParts = bodyParts

  this.draw = (context, width, height, offset) => {
    this.bodyParts.forEach((bodyPart, index) => {
      context.fillStyle = '#2e7eff'

      if (index === 0) {
        context.fillRectByViewport(
          bodyPart.x * width + offset / 2,
          bodyPart.y * height + offset / 2,
          width - offset,
          height - offset
        )
      }
      
      const previous = this.bodyParts[index - 1]
      
      if (previous) {
        const numbers = {
          farest: {
            x: Math.max(previous.x, bodyPart.x),
            y: Math.max(previous.y, bodyPart.y),
          },
          nearest: {
            x: Math.min(previous.x, bodyPart.x),
            y: Math.min(previous.y, bodyPart.y)
          }
        }

        const squareX = numbers.nearest.x * width + offset
        const squareY = numbers.nearest.y * height + offset

        context.fillRectByViewport(
          squareX,
          squareY,
          (numbers.farest.x * width + width - offset) - squareX,
          (numbers.farest.y * height + height - offset) - squareY
        )
      }
    })
  }

  this.move = (direction, eatenFood) => {
    let oldSnakeHead = this.bodyParts[0]

    this.bodyParts.unshift({
      x: oldSnakeHead.x + direction.x,
      y: oldSnakeHead.y + direction.y
    })
    
    if (!eatenFood) this.bodyParts.pop()
  }
}

function InputHandler(callback) {
  this.callback = callback
  this.state = {
    key: null,
    pressing: false
  }

  document.addEventListener('keydown', (event) => {
    if (this.state.pressing) return

    this.callback(event.key)
    this.state.key = event.key
    this.state.pressing = true
  })

  document.addEventListener('keyup', (event) => {
    if (event.key !== this.state.key) return

    this.state.key = null
    this.state.pressing = false
  })
}

function Food(x, y) {
  this.x = x
  this.y = y

  this.draw = (context, width, height, offset) => {
    context.fillStyle = '#ff2e89'
    context.fillRectByViewport(
      (width * this.x) + offset,
      (height * this.y) + offset,
      width - offset * 2,
      height - offset * 2
    )
  }

  this.generateFood = (columns, rows, bodyParts) => {
    const newX = Math.floor(Math.random() * columns)
    const newY = Math.floor(Math.random() * rows)

    const isOnSnake = bodyParts.some(object => JSON.stringify({ x: newX, y: newY }) === JSON.stringify(object))

    if (isOnSnake) return this.generateFood(columns, rows, bodyParts)
    this.x = newX
    this.y = newY
  }
}

function Scoreboard(score) {
  this.score = score

  this.draw = (context) => {
    context.font = '50px monospace'
    context.fillStyle = 'white'
    context.fillTextByViewport(`score: ${this.score}`, 8, 48)
    context.fillStyle = '#ff2e89'
    context.fillTextByViewport(`score: ${this.score}`, 8, 45)
  }
}

function Game(canvas, snake, food, scoreboard) {
  this.canvas = canvas
  this.snake = snake
  this.food = food
  this.scoreboard = scoreboard

  this.draw = () => {
    this.canvas.drawBackground()
    this.snake.draw(
      this.canvas.context,
      this.canvas.squareWidth,
      this.canvas.squareHeight,
      10
    )
    this.food.draw(
      this.canvas.context,
      this.canvas.squareWidth,
      this.canvas.squareHeight,
      6
    )
    this.scoreboard.draw(
      this.canvas.context
    )
  }

  this.step = (key) => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) return

    const direction = { x: 0, y: 0 }

    if (key === 'ArrowUp') direction.y = -1
    if (key === 'ArrowDown') direction.y = 1
    if (key === 'ArrowLeft') direction.x = -1
    if (key === 'ArrowRight') direction.x = 1

    let oldSnakeHead = this.snake.bodyParts[0]
    let unableToMove = false
    let eatenFood = false

    this.snake.bodyParts.forEach(bodyPart => {
      if (
        oldSnakeHead.x + direction.x === bodyPart.x &&
        oldSnakeHead.y + direction.y === bodyPart.y
      ) unableToMove = true

      if (
        oldSnakeHead.x + direction.x === -1 ||
        oldSnakeHead.x + direction.x === this.canvas.checkerboardColumns ||
        oldSnakeHead.y + direction.y === -1 ||
        oldSnakeHead.y + direction.y === this.canvas.checkerboardRows
      ) unableToMove = true

      if (
        oldSnakeHead.x + direction.x === this.food.x &&
        oldSnakeHead.y + direction.y === this.food.y
      ) eatenFood = true
    })

    if (!unableToMove) this.snake.move(direction, eatenFood)

    if (eatenFood && !unableToMove) {
      this.food.generateFood(
        this.canvas.checkerboardColumns,
        this.canvas.checkerboardRows,
        this.snake.bodyParts
      )
      this.scoreboard.score += 1
    }

    this.draw()
  }

  this.inputHandler = new InputHandler(this.step)
  this.canvas.startListener(this.step)
}

function startGame() {
  const gameScreen = new Canvas(
    document.querySelector('#gameScreen'),
    10,
    10
  )
  gameScreen.initialize()
  
  const snakeInitialState = [
    { x: 3, y: 5 },
    { x: 3, y: 6 },
    { x: 4, y: 6 },
    { x: 4, y: 7 },
    { x: 4, y: 8 },
    { x: 4, y: 9 }
  ]

  const snake = new Snake(snakeInitialState)

  const scoreboard = new Scoreboard(snakeInitialState.length)
  
  const food = new Food(2, 4)

  const game = new Game(gameScreen, snake, food, scoreboard)
  game.draw()

  window.addEventListener('resize', () => {
    gameScreen.resize()
    game.draw()
  })
}

startGame()

//TODO: refactor code and layout, add score, remove food spawns on snake bug, add death message and host website
// add bombs and shadow

//OPTIONAL: make responsive and mobile porting