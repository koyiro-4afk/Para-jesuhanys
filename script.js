const starsCanvas = document.getElementById("stars");
const ctxStars = starsCanvas.getContext("2d");

const heartCanvas = document.getElementById("heartCanvas");
const ctxHeart = heartCanvas.getContext("2d");

starsCanvas.width = window.innerWidth;
starsCanvas.height = window.innerHeight;

heartCanvas.width = window.innerWidth;
heartCanvas.height = window.innerHeight;

const stars = [];

for(let i=0; i<200; i++){

    stars.push({
        x:Math.random()*starsCanvas.width,
        y:Math.random()*starsCanvas.height,
        size:Math.random()*2
    });

}

function drawStars(){

    ctxStars.clearRect(0,0,starsCanvas.width,starsCanvas.height);

    ctxStars.fillStyle="white";

    stars.forEach(star=>{

        ctxStars.beginPath();
        ctxStars.arc(
            star.x,
            star.y,
            star.size,
            0,
            Math.PI*2
        );
        ctxStars.fill();

    });

    requestAnimationFrame(drawStars);
}

drawStars();

document.getElementById("startButton")
.addEventListener("click", ()=>{

    document.getElementById("intro").style.opacity="0";

    setTimeout(()=>{

        document.getElementById("intro").style.display="none";

        drawHeart();

        showMessage();

    },1000);

});

function drawHeart(){

    ctxHeart.strokeStyle="#ff2d55";
    ctxHeart.lineWidth=3;

    ctxHeart.beginPath();

    let first = true;

    for(let t=0; t<Math.PI*2; t+=0.02){

        let x = 16*Math.pow(Math.sin(t),3);

        let y =
            13*Math.cos(t)
            -5*Math.cos(2*t)
            -2*Math.cos(3*t)
            -Math.cos(4*t);

        x *= 15;
        y *= 15;

        x += heartCanvas.width/2;
        y = heartCanvas.height/2 - y;

        if(first){
            ctxHeart.moveTo(x,y);
            first=false;
        }else{
            ctxHeart.lineTo(x,y);
        }

    }

    ctxHeart.stroke();
}

function showMessage(){

    const text = document.getElementById("textContainer");

    text.innerHTML =
    "Tú eres una persona muy especial, Jesuhanys ❤️";

    text.style.opacity=1;
}
