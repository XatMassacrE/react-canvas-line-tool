import React, { Component } from 'react';

const lineData = require('../curve_example.json');
console.log(lineData);

export default class CanvasComponent extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      color: 'green',
      width: 800,
      height: 400
    };
    this.config = {
      isMouseDown: false,
      step: 0,

      isMirror: false,
      isEdit: false
    };
    this.points = [{},{},{},{},{}];
  }
  handleClick() {
    this.setState({
      color: 'red',
    });
    console.log(this.state.color);
  }
  componentDidMount() {
    //this.updateCanvas();
    this.config.isMouseDown = false;
    this.canvas = this.refs.canvas;
    this.ctx = this.canvas.getContext('2d');
  }
  componentWillUpdate() {
    this.clear();
    this.points.map((arr) => this.drawCir(arr));
    this.drawQua(this.points[0], this.points[1], this.points[2]);
    this.drawQua(this.points[2], this.points[3], this.points[4]);
    this.drawLine(this.points[2], this.points[1]);
    this.drawLine(this.points[2], this.points[3]);
  }
  updateCanvas() {
    const ctx = this.refs.canvas.getContext('2d');
    ctx.fillRect(0, 0, 100, 100);
  }
  clear() {
    this.refs.canvas.getContext('2d').clearRect(0, 0, this.state.width, this.state.height);
  }
  handleEsc(e) {
    console.log(e);
    this.clear();
    this.config.isEdit = false;
  }
  handleMouseDown(e) {
    const config = this.config;
    const points = this.points;
    const canvas = this.canvas;
    const ctx = this.ctx;
    let x = e.pageX - canvas.offsetLeft;
    let y = e.pageY - canvas.offsetTop;

    if (config.isEdit) {
      console.log('is edit');
      for (let i in this.points) {
        this.drawCir(this.points[i]);
        if (ctx.isPointInPath(x, y)) {
          console.log('in path');
          canvas.onmousemove = (e) => {
            this.clear();
            let x = e.pageX - canvas.offsetLeft;
            let y = e.pageY - canvas.offsetTop;
            this.points[i].x = x;
            this.points[i].y = y;
            if (config.isMirror) {
              if (i == 1) {
                this.points[3].x = 2*points[2].x - this.points[1].x;
                this.points[3].y = 2*points[2].y - this.points[1].y;
              } else if (i == 3) {
                this.points[1].x = 2*points[2].x - this.points[3].x;
                this.points[1].y = 2*points[2].y - this.points[3].y;
              }
            }
            this.forceUpdate();
          }
          canvas.onmouseup = (e) => {
            canvas.onmousemove = null;
            this.forceUpdate(); 
          }
        }
      }
    } else {
      this.config.step += 1;
      console.log(this.config.step);
      this.config.isMouseDown = true;
      
      switch(config.step) {
        case 1:
          points[0].x = x;
          points[0].y = y;
          points[0].isControl = false;
          break;
        case 2:
          points[2].x = x;
          points[2].y = y;
          points[2].isControl = false;
          break;
        case 3:
          points[4].x = x;
          points[4].y = y;
          points[4].isControl = false;

          this.end(x, y);
          config.isMouseDown = false;
          config.step = 0;
          config.isEdit = true;
          break;
        default:
          return
      }
    }
  }
  handleMouseMove(e) {
    const canvas = this.canvas;
    const ctx = this.ctx;
    const config = this.config;
    const points = this.points;
    let x = e.pageX - canvas.offsetLeft;
    let y = e.pageY - canvas.offsetTop;
    let point = {};
    point.x = x;
    point.y = y;
    if (this.config.isMouseDown) {
      this.clear();
      switch(this.config.step) {
        case 1:
          this.drawLine(points[0], point);
          break;
        case 2:
          this.drawLine(points[2], point);
          break;
        case 3:
          return;
        default:
          return;
      }
    }
  }
  drawCir(point) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.fillStyle = point.isControl ? 'red' : 'yellow';
    ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
  drawLine(point1, point2) {
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = 'gray';
    ctx.moveTo(point1.x, point1.y);
    ctx.lineTo(point2.x, point2.y);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }

  drawQua(point1, controlPoint, point2) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(point1.x, point1.y);
    ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, point2.x, point2.y);
    ctx.stroke();
    ctx.closePath();
  }
  end(x, y) {
    console.log('end');
    const config = this.config;
    const points = this.points;

    points[1].x = (points[0].x + points[2].x) / 2;
    points[1].y = points[2].y;
    points[1].isControl = true;

    points[3].x = (points[2].x + points[4].x) / 2;
    points[3].y = points[2].y;
    points[3].isControl = true; 
    this.forceUpdate();
  } 
  handleExport() {
    if (!this.points[0].x) {
      alert('please draw something and try again');
      return;
    }
    let data = JSON.stringify(this.points);
    let filename = 'example.json';
    var element = document.createElement('a');
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(data));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    console.log('done');
  }
  handleLoadExampleJson() {
    this.clear();
    this.points = lineData;
    this.config.isEdit = true;
    this.forceUpdate();
  }
  handleLoadJson(e) {
    console.log(e.target.files[0])
    let reader = new FileReader();
    reader.readAsText(e.target.files[0]);
    reader.onload = (e) => console.log(this.result);
  }
  changeToMirror() {
    this.config.isMirror = true;
    this.refs.mode.innerHTML = 'now is mirror mode';
  }
  changeToFree() {
    this.config.isMirror = false;
    this.refs.mode.innerHTML = 'now is free mode';
  }
  render() {
    return (
      <div>
        <p> double click to redraw </p>
        <canvas ref='canvas' width={this.state.width} height={this.state.height} onDoubleClick={this.handleEsc.bind(this)} onMouseDown={this.handleMouseDown.bind(this)} onMouseMove={this.handleMouseMove.bind(this)} >
          This text is displayed if your browser does not support HTML5 Canvas. Please use another browser(maybe Chrome) and try again.
        </canvas>
        <button onClick={this.handleExport.bind(this)}> export as json</button>
        <button onClick={this.handleLoadExampleJson.bind(this)}> load example json file </button>
        <button onClick={this.changeToMirror.bind(this)}> mirror mode </button>
        <button onClick={this.changeToFree.bind(this)}> free mode </button>
        <span ref='mode'>now is free mode</span>
      </div>
    );
  }
}
