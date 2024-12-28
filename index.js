const app = document.querySelector("#app")
const create_room = document.querySelector(".create-room-btn")
const join_room = document.querySelector(".join-room-btn")

class Game {
  constructor(){
    this.players = {}

    create_room.addEventListener("click",this.handleCreateRoom.bind(this))
    join_room.addEventListener("click",this.handleJoinRoom.bind(this))
  }

  async handleCreateRoom(){
    try {
      await this.connectToWs()
      this.ws.send("create_room")
    }catch(err){
      console.log(err)
    }
  }

  async handleJoinRoom(){
     try {
      await this.connectToWs()
      const room_input = document.querySelector(".room-input")
      if(room_input.value.length == 0) return;
      this.ws.send("join_room",room_input.value)

    }catch(err){
      console.log(err)
    }
  }

  async connectToWs(){
    try {
      const ws = new WS(this,"ws://localhost:6969/ws")
      await ws.connect()
      
      this.ws = ws

      return new Promise((res,rej) => {
        res("connected")
      })
    }catch(err){
      return new Promise((res,rej) => {
        rej("errorconnecting")
      })
    }

  }

  loadCanvas() {
    app.innerHTML = ""

    const canvas = document.createElement('canvas')
    canvas.width = this.canvas_width
    canvas.height = this.canvas_height
    canvas.style.border = '1px solid #ccc'
    canvas.style.borderRadius = "10px";

    const innerDiv = document.createElement("div")
    innerDiv.style.display = "flex"
    innerDiv.style.marginBottom = "8px"
    innerDiv.style.justifyContent = "space-around"
    innerDiv.style.alignItems = "center"

    const bruv = document.createElement("div")
    bruv.style.display = "flex"
    bruv.style.justifyContent = "space-around"
    bruv.style.alignItems = "center"
    bruv.style.gap = "5px"

    const p = document.createElement("p")
    p.innerText = `Room ID: ${this.roomID}`
    p.style.fontWeight = "bold"

    const timerEl = document.createElement("h1")
    
    const timerInterval = setInterval(() => {
      const minutes = Math.floor(this.countdown / 60) 
      const seconds = this.countdown % 60 

      timerEl.textContent = 
          `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

      if (this.countdown <= 0) {
          clearInterval(timerInterval) 
          timerEl.textContent = "00:00"
      }
      this.countdown--
    }, 1000) 

    const copyButton = document.createElement("button")
    copyButton.innerText = "COPY ID"
    copyButton.style.fontSize = "10px"
    copyButton.style.fontWeight = "bold"
    copyButton.addEventListener("click", () => {
      navigator.clipboard.writeText(this.roomID)

      copyButton.innerText = "COPIED"
      setTimeout(() => {
        copyButton.innerText = "COPY ID"
      },1000)
    })

    bruv.appendChild(p)
    bruv.appendChild(copyButton)
    innerDiv.appendChild(bruv)
    innerDiv.appendChild(timerEl)
    app.appendChild(innerDiv)
    app.appendChild(canvas)
  
    this.app = app

    this.canvas = canvas
    this.ctx = canvas.getContext("2d")
    
    this.initCanvas()
  }

  initCanvas() {
    window.addEventListener("keydown", this.handleKeyDown.bind(this))
    requestAnimationFrame(this.updateCanvas.bind(this))
  }
  updateCanvas() {
	
    this.ctx.clearRect(0, 0, this.canvas_width, this.canvas_height)


    this.grids?.forEach(g => {
      this.ctx.fillStyle = g.color
      this.ctx.fillRect(
        g.x,
        g.y,
        this.grid_size,
        this.grid_size,
      )
    })
	

    for (let i in this.players) {
      this.ctx.fillStyle = this.players[i].color
      this.ctx.fillRect(
        this.players[i].x,
        this.players[i].y,
        this.players[i].width,
        this.players[i].height
      )

      this.ctx.strokeStyle = "black"
      this.ctx.lineWidth = 3
      this.ctx.strokeRect(
        this.players[i].x,
        this.players[i].y,
        this.players[i].width,
        this.players[i].height
      )

	  this.ctx.font = "bold 30px Arial"
	  
	  this.ctx.fillStyle = "black"
	  this.ctx.textAlign = 'center'
	  this.ctx.fillText(this.players[i].points, this.players[i].x + this.players[i].width/2,this.players[i].y + this.players[i].height / 2);
    }

    requestAnimationFrame(this.updateCanvas.bind(this))
  }

  handleKeyDown(e){
    switch(e.code){
    case "KeyA":
      this.ws.send("keydown","a")
      break
    case "KeyD":
      this.ws.send("keydown","d")
      break
    case "KeyW":
      this.ws.send("keydown","w")
      break
    case "KeyS":
      this.ws.send("keydown","s")
      break
    }
  }

  handleExitRoom(){
    this.ws.close()

    this.app.innerHTML = `
      <h1>Room Manager</h1>
      <div class="buttons">
        <button class="create-room-btn">Create Room</button>
      </div>
      <div class="join-room">
        <input type="text" class="room-input" placeholder="Enter Room ID">
        <button class="join-room-btn">Join Room</button>
      </div>
    `

    const new_create_room = document.querySelector(".create-room-btn")
    const new_join_room = document.querySelector(".join-room-btn")

    new_create_room.addEventListener("click",this.handleCreateRoom.bind(this))
    new_join_room.addEventListener("click",this.handleJoinRoom.bind(this))
  }
}

new Game()
