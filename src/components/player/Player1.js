class Player1 {
	constructor(args) {
	  this.position = args.position;
	  this.radius = args.radius;
	  this.color = args.color;
	  this.image = args.image;
	  this.width = args.width;
	  this.height = args.height;
	}
  
	draw(args) {
	  const context = args.context;
	  this.position = args.position;
  
	  context.save();
	  context.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
	  context.restore();
	}
  }
  
export default Player1;