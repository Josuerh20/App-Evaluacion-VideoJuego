const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Definir dimensiones del canvas
function resizeCanvas() {
    const headerHeight = document.querySelector('header').offsetHeight;
    const footerHeight = document.querySelector('footer').offsetHeight;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - headerHeight - footerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const window_height = canvas.height;
const window_width = canvas.width;

// Cargar imagen del círculo y del fondo
const circleImage = new Image();
circleImage.src = 'img1.png';

const backgroundImage = new Image();
backgroundImage.src = '11fondo1.jpg';

// Estado del juego
let gameState = "inicio";
let currentRound = 1;
let circles = [];
let circlesToClick = 3;
let timer = 3; // Contador antes de iniciar cada ronda
let score = 0; // Score inicial

// Función para dibujar el fondo
function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, window_width, window_height);
}

// Función para dibujar texto en el centro del canvas
function drawText(text, fontSize, color, offsetY = 0) {
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, window_width / 2, window_height / 2 + offsetY);
}

// Función para dibujar el score en la esquina de la pantalla
function drawScore() {
    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`Score: ${score}`, 10, 30);
}

// Función para iniciar el juego
function startGame() {
    gameState = "ronda";
    circles = [];
    circlesToClick = 3;
    currentRound = 1;
    score = 0;
    document.body.style.cursor = 'url(img2.png), auto'; // Cambiar cursor al iniciar el juego
    startNewRound();
}

// Función para iniciar una nueva ronda
function startNewRound() {
    gameState = "preparacion";
    timer = 3;
    const countdownInterval = setInterval(() => {
        timer--;
        if (timer <= 0) {
            clearInterval(countdownInterval);
            gameState = "ronda";
            createCircles();
        }
    }, 1000);
}

// Función para crear los círculos de la ronda actual
function createCircles() {
    circles = [];
    const minRadius = 35;
    const maxRadius = 75;
    const circleSpeed = 1 + (currentRound - 1) * 0.1; // Aumentar la velocidad con cada ronda
    while (circles.length < circlesToClick) {
        const radius = minRadius + Math.random() * (maxRadius - minRadius);
        const x = Math.random() * (window_width - radius * 2) + radius;
        const y = window_height + radius;

        let overlapping = false;
        for (let circle of circles) {
            const distance = Math.sqrt(Math.pow(circle.posX - x, 2) + Math.pow(circle.posY - y, 2));
            if (distance < circle.radius + radius) {
                overlapping = true;
                break;
            }
        }

        if (!overlapping) {
            circles.push(new Circle(x, y, radius, circleSpeed));
        }
    }
}

// Función para manejar los clics del usuario
canvas.addEventListener('click', handleCanvasClick);

function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const clickPos = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };

    if (gameState === "inicio") {
        startGame();
    } else if (gameState === "ronda") {
        handleCircleClick(clickPos);
    } else if (gameState === "perdiste") {
        handleRestartClick(clickPos);
    }
}

// Función para manejar los clics en los círculos
function handleCircleClick(clickPos) {
    for (let i = 0; i < circles.length; i++) {
        const circle = circles[i];
        const distance = Math.sqrt(Math.pow(clickPos.x - circle.posX, 2) + Math.pow(clickPos.y - circle.posY, 2));
        if (distance <= circle.radius) {
            circles.splice(i, 1);
            circlesToClick--;
            score++;
            break;
        }
    }

    if (circlesToClick === 0) {
        gameState = "transicion";
        setTimeout(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBackground();
            drawText("¡Muy bien!", 40, "#000");
        }, 0);

        setTimeout(() => {
            currentRound++;
            circlesToClick = currentRound + 2;
            startNewRound();
        }, 2000);
    }
}

// Función para el bucle del juego
function gameLoop() {
    updateGame();
    requestAnimationFrame(gameLoop);
}

// Función para actualizar el estado del juego
function updateGame() {
    drawBackground();
    drawScore();

    if (gameState === "inicio") {
        drawText("¿listo? Haz clic!", 40, "#000");
    } else if (gameState === "preparacion") {
        drawText(timer.toString(), 100, "#000");
    } else if (gameState === "ronda") {
        for (let circle of circles) {
            circle.update(ctx);
        }

        for (let circle of circles) {
            if (circle.posY + circle.radius < 0) {
                gameState = "perdiste";
                document.body.style.cursor = 'auto'; // Restablecer el cursor al estilo predeterminado
                break;
            }
        }

        if (circles.length === 0 && circlesToClick > 0) {
            gameState = "perdiste";
            document.body.style.cursor = 'auto'; // Restablecer el cursor al estilo predeterminado
        }
    } else if (gameState === "perdiste") {
        drawText(`¡PERDISTE! ¡TE HAN METIDO GOL!`, 40, "#000");
        drawText(`Nivel: ${currentRound}`, 30, "#000", 50);
        drawText(`Score: ${score}`, 30, "#000", 100);
        drawRestartButton();
    }
}

// Clase para representar los círculos del juego
class Circle {
    constructor(x, y, radius, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.speed = speed;
        this.dy = -speed; // Dirección hacia arriba
    }

    draw(context) {
        context.drawImage(circleImage, this.posX - this.radius, this.posY - this.radius, this.radius * 2, this.radius * 2);
    }

    update(context) {
        this.posY += this.dy;
        this.draw(context);
    }
}

// Función para dibujar el botón de reinicio
// Función para dibujar el botón de reinicio
function drawRestartButton() {
    if (gameState === "perdiste") {
        const buttonWidth = 200;
        const buttonHeight = 50;
        const buttonX = (window_width - buttonWidth) / 2;
        const buttonY = (window_height - buttonHeight) / 2 + 160;

        ctx.fillStyle = "#fff";
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

        ctx.fillStyle = "#000";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Comenzar de nuevo", buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);

        // Eliminar el evento de clic antes de agregarlo para evitar duplicados
        canvas.removeEventListener('click', handleRestartClick);
        canvas.addEventListener('click', handleRestartClick);
    }
}


// Función para manejar los clics del usuario
function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const clickPos = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };

    if (gameState === "inicio") {
        startGame();
    } else if (gameState === "ronda") {
        handleCircleClick(clickPos);
    } else if (gameState === "perdiste") {
        handleRestartClick(clickPos); // Cambiar esto
    }
}


// Función para manejar los clics en los círculos
function handleCircleClick(clickPos) {
    if (gameState === "ronda") {
        for (let i = 0; i < circles.length; i++) {
            const circle = circles[i];
            const distance = Math.sqrt(Math.pow(clickPos.x - circle.posX, 2) + Math.pow(clickPos.y - circle.posY, 2));
            if (distance <= circle.radius) {
                circles.splice(i, 1);
                circlesToClick--;
                score++;
                break;
            }
        }

        if (circlesToClick === 0) {
            gameState = "transicion";
            setTimeout(() => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawBackground();
                drawText("¡Muy bien!", 40, "#000");
            }, 0);

            setTimeout(() => {
                currentRound++;
                circlesToClick = currentRound + 2;
                startNewRound();
            }, 2000);
        }
    }
}

// Función para manejar los clics del reinicio
function handleRestartClick(event) {
    if (gameState === "perdiste") {
        // Obtener la posición del clic relativa al canvas
        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        // Coordenadas del botón de reinicio
        const buttonWidth = 200;
        const buttonHeight = 50;
        const buttonX = (window_width - buttonWidth) / 2;
        const buttonY = (window_height - buttonHeight) / 2 + 160;

        // Verificar si el clic está dentro del área del botón de reinicio
        if (clickX >= buttonX && clickX <= buttonX + buttonWidth &&
            clickY >= buttonY && clickY <= buttonY + buttonHeight) {
            startGame();
        }
    }
}


// Comenzar el bucle del juego
gameLoop();
