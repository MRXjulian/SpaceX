export class Game extends Phaser.Scene {

    constructor() {
        super({ key: 'game' });
    }

    preload() {
        this.load.image('background', 'imgs/background.webp');
        this.load.image('gameover', 'imgs/gameover.png');
        this.load.image('nave', 'imgs/nave.png');
        this.load.image('proyectil', 'imgs/bala.png'); 
        this.load.image('techo', 'imgs/techo.png');
        this.load.image('asteroide', 'imgs/asteroide.png');
    }

    create() {
        // Fondo y game over
        this.add.image(410, 250, 'background');
        this.gameoverImage = this.add.image(400, 90, 'gameover').setVisible(false);

        // Crear la nave
        this.nave = this.physics.add.image(400, 430, 'nave')
            .setScale(0.1)
            .setCollideWorldBounds(true);

        // Crear el grupo de asteroides
        this.asteroides = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,
            defaultKey: 'asteroide',
            maxSize: 20,
            runChildUpdate: true // Hacer que los asteroides actualicen su estado
        });

        // Crear el techo
        this.techo = this.physics.add.image(400, -250, 'techo');
        this.techo.body.allowGravity = false;

        // Configurar controles
        this.cursors = this.input.keyboard.createCursorKeys();

        // Generar asteroides periódicamente
        this.asteroideTimer = this.time.addEvent({
            delay: 700, // Tiempo en milisegundos entre la generación de asteroides
            callback: this.crearAsteroide,
            callbackScope: this,
            loop: true
        });

        // Colisiones
        this.physics.add.collider(this.nave, this.asteroides, this.colisionNaveAsteroide, null, this);

        // Inicializar puntuación
        this.score = 0;
        this.scoreText = this.add.text(16, 450, 'Score: ' + this.score, { fontSize: '32px', fill: '#ffffff' });
    }

    crearAsteroide() {
        // Crear un nuevo asteroide
        let asteroide = this.asteroides.get(Phaser.Math.Between(50, 750), -50, 'asteroide');
        
        if (asteroide) {
            asteroide.setScale(0.07)
                .setActive(true)
                .setVisible(true)
                .setVelocityY(200); // Velocidad de caída del asteroide
        }
    }

    dispararProyectil() {
        if (!this.proyectil.visible) { // Solo dispara si el proyectil no está visible
            // Sincronizar la posición del proyectil con la de la nave
            this.proyectil.setPosition(this.nave.x, this.nave.y)
                .setVisible(true)
                .setActive(true);
        }
    } 

    reiniciarJuego() {
        this.scene.restart(); // Reinicia la escena actual
    }

    colisionNaveAsteroide(nave, asteroide) {
        nave.setVisible(false);
        asteroide.setActive(false).setVisible(false);
        
        this.gameoverImage.setVisible(true);
        this.physics.pause(); // Pausar la física del juego
    
        // Escuchar el evento para reiniciar el juego
        this.input.keyboard.once('keydown-Q', () => {
            this.reiniciarJuego(); // Llamar al método de reinicio
        });
    }

    update() {
        // Movimiento de la nave
        if (this.cursors.left.isDown) {
            this.nave.setVelocityX(-350);
        }
        else if (this.cursors.right.isDown) {
            this.nave.setVelocityX(350);
        }
        else {
            this.nave.setVelocityX(0);
        }

        // Desactivar asteroides fuera de la pantalla y actualizar puntuación
        this.asteroides.children.iterate(asteroide => {
            if (asteroide.y > this.sys.game.config.height) {
                asteroide.setActive(false).setVisible(false);
                
                // Aumentar el puntaje
                this.score += 1;
                this.scoreText.setText('Score: ' + this.score);
            }
        });
    }
}
