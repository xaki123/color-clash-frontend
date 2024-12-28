class WS {
	constructor(game,addr){
		this.game = game
		this.addr = addr
		this.connect()
	}

	connect(){
		this.socket = new WebSocket(this.addr)
		
		this.socket.onmessage = this.handleMessages.bind(this)

		return new Promise((res,rej) => {		
			this.socket.onopen = () => {
				res("connected")
			}

			this.socket.onerror = (err) => {
				rej("erorr connecting: ",err)
			}

			this.socket.onclose = (r) => {
				rej("conn closed: ",r)
			}
		})
	}

	handleMessages(m) {
		const data = JSON.parse(m.data)

		switch(data.eventName){

		case "get_token":
			this.game.roomID = data.eventData.room_id
			this.game.my_id = data.eventData.my_id
			this.game.countdown = data.eventData.time_left
			this.game.grid_size = data.eventData.grid_size

			this.game.canvas_width = data.eventData.canvas_width
			this.game.canvas_height = data.eventData.canvas_height

			this.game.loadCanvas()
			break

		case "tick":
			this.game.grids = data.eventData["grids"]
			this.game.players = data.eventData["players"]
			break
		case "warning":
			window.alert(data.eventData)
			break
		case "winner":
			window.alert(data.eventData)
			location.reload()
			break
		}
		
	}

	send(eventName,eventData){
      	this.socket.send(WS.eventJSON(eventName,eventData))
	}

	close(){
		this.socket.close()
	}

	static eventJSON(eventName,eventData) {
		return JSON.stringify({eventName,eventData})
	}
}