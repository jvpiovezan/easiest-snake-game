function Canvas(element, squareWidth, squareHeight, checkerboardColumns, checkerboardRows) {
  this.element = element
  this.context = this.element.getContext('2d')

  this.squareWidth = squareWidth
  this.squareHeight = squareHeight

  this.checkerboardColumns = checkerboardColumns
  this.checkerboardRows = checkerboardRows

  this.initialized = false

  this.initialize = () => {
    if (this.initialized) return

    this.element.width = this.squareWidth * this.checkerboardColumns
    this.element.height = this.squareHeight * this.checkerboardRows
    this.initialized = true
  }

  this.drawBackground = () => {
    for (let i = 0; i < this.checkerboardRows; i++) {
      for (let j = 0; j < this.checkerboardColumns / 2; j++) {
        this.context.fillStyle = '#89c955'
        this.context.fillRect(
          j * this.squareWidth * 2 + (i % 2 === 1 ? this.squareWidth : 0),
          i * this.squareHeight,
          this.squareWidth,
          this.squareHeight
        )

        this.context.fillStyle = '#9bfc4c'
        this.context.fillRect(
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
        context.fillRect(
          bodyPart.x * width + offset / 2,
          bodyPart.y * height + offset / 2,
          width - offset,
          height - offset
        )
      }
      
      const previous = this.bodyParts[index - 1]
      
      if (previous) {
        const numbers = {
          longX: (previous.x > bodyPart.x ? previous : bodyPart).x,
          longY: (previous.y > bodyPart.y ? previous : bodyPart).y,
          shortX: (previous.x > bodyPart.x ? bodyPart : previous).x,
          shortY: (previous.y > bodyPart.y ? bodyPart : previous).y
        }

        const squareX = numbers.shortX * width + offset
        const squareY = numbers.shortY * height + offset

        context.fillRect(
          squareX,
          squareY,
          (numbers.longX * width + width - offset) - squareX,
          (numbers.longY * height + height - offset) - squareY
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
    context.fillRect(
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

function Game(canvas, snake, food) {
  this.canvas = canvas
  this.snake = snake
  this.food = food

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

    if (eatenFood && !unableToMove) this.food.generateFood(this.canvas.checkerboardColumns, this.canvas.checkerboardRows, this.snake.bodyParts)

    this.draw()
  }

  this.inputHandler = new InputHandler(this.step)
}

function startGame() {
  const gameScreen = new Canvas(
    document.querySelector('#gameScreen'),
    40,
    40,
    15,
    15
  )
  gameScreen.initialize()
  
  const snake = new Snake([
    { x: 3, y: 5 },
    { x: 3, y: 6 },
    { x: 4, y: 6 },
    { x: 4, y: 7 },
    { x: 4, y: 8 },
    { x: 4, y: 9 }
  ])
  
  const food = new Food(2, 4)

  const game = new Game(gameScreen, snake, food)
  game.draw()
}

startGame()

//TODO: refactor code and layout, add score, remove food spawns on snake bug, add death message and host website

//OPTIONAL: make responsive and mobile porting