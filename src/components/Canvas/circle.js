class Circle {
	constructor(args) {
	  this.position = args.position;
	  this.radius = args.radius;
	  this.color = args.color;
	}
  
	draw(args) {
	  const context = args.context;
	  this.position = args.position;
  
	  context.save();
	  context.beginPath();
	  context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
	  context.fillStyle = this.color;
	  context.fill();
	  context.closePath();
	  context.restore();
	}
  }
  
export default Circle;