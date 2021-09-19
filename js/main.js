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
      let tempOffset = offset

      if (index === 0) tempOffset /= 2

      context.fillStyle = 'blue'
      context.fillRect(
        (bodyPart.x * width) + tempOffset,
        (bodyPart.y * height) + tempOffset,
        width - tempOffset * 2,
        height - tempOffset * 2
      )
    })
  }

  // this.moveUp = () => {
  //   let oldSnakeHead = this.bodyParts[0]
  //   this.bodyParts.unshift({ x: oldSnakeHead.x, y: oldSnakeHead.y - 1 })
  //   this.bodyParts.pop()
  // }

  this.move = (direction, win) => {
    let oldSnakeHead = this.bodyParts[0]

    this.bodyParts.unshift({
      x: oldSnakeHead.x + direction.x,
      y: oldSnakeHead.y + direction.y
    })
    
    if (!win) this.bodyParts.pop()
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
    context.fillStyle = 'red'
    context.fillRect(
      (width * this.x) + offset,
      (height * this.y) + offset,
      width - offset * 2,
      height - offset * 2
    )
  }

  this.generateFood = (columns, rows) => {
    this.x = Math.floor(Math.random() * columns)
    this.y = Math.floor(Math.random() * rows)
  }
}

const gameScreen = new Canvas(
  document.querySelector('#gameScreen'),
  30,
  30,
  15,
  15
)

gameScreen.initialize()
gameScreen.drawBackground()

const snake = new Snake([
  { x: 3, y: 5 },
  { x: 3, y: 6 },
  { x: 4, y: 6 },
  { x: 4, y: 7 },
  { x: 4, y: 8 },
  { x: 4, y: 9 }
])

snake.draw(
  gameScreen.context,
  gameScreen.squareWidth,
  gameScreen.squareHeight,
  5
)

const food = new Food(2, 4)

food.draw(
  gameScreen.context,
  gameScreen.squareWidth,
  gameScreen.squareHeight,
  3
)

function manageInput(key) {
  if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) return

  const direction = { x: 0, y: 0 }

  if (key === 'ArrowUp') direction.y = -1
  if (key === 'ArrowDown') direction.y = 1
  if (key === 'ArrowLeft') direction.x = -1
  if (key === 'ArrowRight') direction.x = 1

  let oldSnakeHead = snake.bodyParts[0]
  let fail = false
  let win = false

  snake.bodyParts.forEach(bodyPart => {
    if (
      oldSnakeHead.x + direction.x === bodyPart.x &&
      oldSnakeHead.y + direction.y === bodyPart.y
    ) fail = true

    if (
      oldSnakeHead.x + direction.x === -1 ||
      oldSnakeHead.x + direction.x === gameScreen.checkerboardColumns ||
      oldSnakeHead.y + direction.y === -1 ||
      oldSnakeHead.y + direction.y === gameScreen.checkerboardRows
    ) fail = true

    if (
      oldSnakeHead.x + direction.x === food.x &&
      oldSnakeHead.y + direction.y === food.y
    ) win = true
  })

  if (!fail) snake.move(direction, win)

  if (win && !fail) food.generateFood(gameScreen.checkerboardColumns, gameScreen.checkerboardRows)

  gameScreen.drawBackground()
  snake.draw(
    gameScreen.context,
    gameScreen.squareWidth,
    gameScreen.squareHeight,
    5
  )
  food.draw(
    gameScreen.context,
    gameScreen.squareWidth,
    gameScreen.squareHeight,
    3
  )
}

new InputHandler(manageInput)

//TODO: refactor code and layout, add score, remove food spawns on snake bug, add death message and host website

//OPTIONAL: make responsive and mobile porting