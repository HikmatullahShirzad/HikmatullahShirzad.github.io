
const canvas = document.getElementById("mycanvas");
const ctx = canvas.getContext("2d");


const gradient = ctx.createLinearGradient(0, 0, 0, 400);
gradient.addColorStop(0, "midnightblue"); 
gradient.addColorStop(1, "darkblue"); 

ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 400, 400); 


ctx.fillStyle = "white";
ctx.fillRect(0, 300, 400, 100);


function drawStars() {
    ctx.fillStyle = "white";
    for (let i = 0; i < 50; i++) { 
        let x = Math.random() * 400; 
        let y = Math.random() * 300; 
        let r = Math.random() * 2;   
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fill();
    }
}


function triangle(x, y, baseWidth, height) {
    ctx.beginPath();
    ctx.moveTo(x, y); 
    ctx.lineTo(x - baseWidth / 2, y + height); 
    ctx.lineTo(x + baseWidth / 2, y + height); 
    ctx.closePath();
    ctx.fill();
}


function tree(x, y) {
    ctx.fillStyle = "green";
    triangle(x, y, 60, 60); // Top triangle
    triangle(x, y + 50, 80, 80); // Middle triangle
    triangle(x, y + 120, 100, 100); // Bottom triangle

    ctx.fillStyle = "brown";
    ctx.fillRect(x - 15, y + 220, 30, 50); 
}

// Draw stars and trees
drawStars();
tree(200, 100);
tree(100, 100);
tree(300, 100);
