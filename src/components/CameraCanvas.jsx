import {useEffect,useRef} from "react";
import {Hands} from "@mediapipe/hands";
import {countFingers} from "../utils/gestures";

export default function CameraCanvas({mode,color,size}){
const videoRef=useRef(), canvasRef=useRef();

useEffect(()=>{
const video=videoRef.current;
const canvas=canvasRef.current;
const ctx=canvas.getContext("2d");

navigator.mediaDevices.getUserMedia({video:true}).then(s=>video.srcObject=s);

const hands=new Hands({locateFile:f=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`});
hands.setOptions({maxNumHands:1,minDetectionConfidence:.7,minTrackingConfidence:.7});

let px=null,py=null;

hands.onResults(r=>{
if(r.multiHandLandmarks){
let h=r.multiHandLandmarks[0];
let n=countFingers(h);
let x=h[8].x*640,y=h[8].y*480;

if(n===0){ctx.clearRect(0,0,640,480);return;}

if(mode==="draw"&&n===1){
ctx.strokeStyle=color;ctx.lineWidth=size;
if(px!==null){ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(x,y);ctx.stroke();}
px=x;py=y;
}

if(mode==="emoji"){ctx.font="50px Arial";ctx.fillText("😊",x,y);}

if(mode==="shape"&&n===2){
ctx.beginPath();ctx.arc(x,y,40,0,Math.PI*2);ctx.stroke();
}
}
});

async function loop(){
await hands.send({image:video});
requestAnimationFrame(loop);
}
loop();
},[mode,color,size]);

return <div className="camera">
<video ref={videoRef} width="640" height="480" autoPlay/>
<canvas ref={canvasRef} width="640" height="480"/>
</div>
}