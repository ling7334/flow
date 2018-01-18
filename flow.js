class Flow {
  constructor(target, text, size, config, colorConfig) {
    this.displayText = text || "Flynn"
    this.textSize = size || 200
    this.setup(target, config, colorConfig)
  }

  setup(targetCanvas, config, colorConfig) {
    this.size = 3
    this.noiseZ = 0
    this.canvas = document.querySelector(targetCanvas)
    this.ctx = this.canvas.getContext("2d")
    window.addEventListener("resize", this.reset)
    this.config = config || {
      zoom: 80,
      noiseSpeed: 0.007,
      particleSpeed: 1,
      fieldForce: 20,
    }
  
    this.colorConfig = colorConfig || {
      particleOpacity: 0.08,
      baseHue: 120,
      hueRange: 15,
      hueSpeed: 0.005,
      colorSaturation: 90,
    }
    this.reset()
  }

  reset() {
    this.hue = this.colorConfig.baseHue
    noise.seed(Math.random())
    this.w = this.canvas.width = window.innerWidth
    this.h = this.canvas.height = window.innerHeight
    this.columns = Math.floor(this.w / this.size) + 1
    this.rows = Math.floor(this.h / this.size) + 1
    this.initParticles()
    this.initField()
    this.drawText()
    this.drawBackground(1)
  }

  initParticles() {
    this.particles = []
    let numberOfParticles = this.w * this.h / 300
    for(let i = 0; i < numberOfParticles; i++) {
      let particle = new Particle(Math.random() * this.w, Math.random() * this.h)
      this.particles.push(particle)
    }
  }

  initField() {
    this.field = new Array(this.columns);
    for(let x = 0; x < this.columns; x++) {
      this.field[x] = new Array(this.columns);
      for(let y = 0; y < this.rows; y++) {
        this.field[x][y] = new Vector(0, 0);
      }
    }  
  }

  calculateField() {
    let x1;
    let y1;
    for(let x = 0; x < this.columns; x++) {
      for(let y = 0; y < this.rows; y++) {
        let color = this.buffer32[y*this.size * this.w + x*this.size];
        if (color) {
          x1 = (Math.random()-0.5) * 3;
          y1 = (Math.random()-0.5) * 3;
        } else {
          x1 = noise.simplex3(x/this.config.zoom, y/this.config.zoom, this.noiseZ) * this.config.fieldForce / 20;
          y1 = noise.simplex3(x/this.config.zoom + 40000, y/this.config.zoom + 40000, this.noiseZ) * this.config.fieldForce / 20;
          
        }
        this.field[x][y].x = x1;
        this.field[x][y].y = y1;
      }
    }
  }

  drawBackground(alpha) {
    this.ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    this.ctx.fillRect(0, 0, this.w, this.h);
  }

  drawText() {
    this.ctx.save();
    let text = this.displayText
    let fontSize = this.textSize
    this.ctx.font = "bold " + fontSize + "px sans-serif";
    var textWidth = this.ctx.measureText(text).width;
    var marginLeft = (this.w - textWidth) * 0.5;
    var marginTop = (this.h - fontSize) * 0.25;
  
    this.ctx.fillStyle = "white";
    this.ctx.fillText(text, marginLeft, marginTop + fontSize*0.9);
    this.ctx.restore();
    let image = this.ctx.getImageData(0, 0, this.w, this.h);
    this.buffer32 = new Uint32Array(image.data.buffer);
  }

  drawParticles() {
    this.hue += this.colorConfig.hueSpeed
    let h = Math.sin(this.hue) * this.colorConfig.hueRange + this.colorConfig.baseHue
    this.ctx.strokeStyle = `hsla(${this.h}, ${this.colorConfig.colorSaturation}%, 50%, ${this.colorConfig.particleOpacity})`
    let x;
    let y;
    this.particles.forEach(p => {
      x = p.pos.x / this.size;
      y = p.pos.y / this.size;
      let v;
      if(x >= 0 && x < this.columns && y >= 0 && y < this.rows) {
        v = this.field[Math.floor(x)][Math.floor(y)];
      }
      p.move(v, this.config.particleSpeed);
      p.wrap(this.w, this.h);
      p.drawLine(this.ctx);
    });
  }

}

