export class Game extends Phaser.Scene {
    constructor() {
        super({ key: 'game' });
    }

    proyectiles;
    fireRate = 300; // Milisegundos entre disparos (0.3 segundos)
    nextFire = 0;
    projectileLife = 800; // Vida del proyectil en milisegundos (0.8 segundos)
    score = 0; // Inicialización del puntaje

    preload() {
        // Carga las imágenes para el juego
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

        // Crear el grupo de proyectiles
        this.proyectiles = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,
            defaultKey: 'proyectil',
            maxSize: 10,
            createCallback: (proyectil) => {
                proyectil.setGravityY(0);
                proyectil.setCollideWorldBounds(true);
                proyectil.setBounce(0);
                proyectil.setVisible(false);
            }
        });

        // Crear el grupo de asteroides
        this.asteroides = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,
            defaultKey: 'asteroide',
            maxSize: 20,
            runChildUpdate: true
        });

        // Crear el techo
        this.techo = this.physics.add.image(400, -250, 'techo');
        this.techo.body.allowGravity = false;

        // Configurar controles
        this.cursors = this.input.keyboard.createCursorKeys();

        this.asteroideTimer = this.time.addEvent({
            delay: 700, // Tiempo en milisegundos entre la generación de asteroides
            callback: this.crearAsteroide,
            callbackScope: this,
            loop: true
        });

        // Colisiones
        this.physics.add.collider(this.nave, this.asteroides, this.colisionNaveAsteroide, null, this);
        this.physics.add.collider(this.proyectiles, this.asteroides, this.colisionProyectilAsteroide, null, this);

        // Inicializar puntuación
        this.scoreText = this.add.text(16, 450, 'Score: ' + this.score, { fontSize: '32px', fill: '#ffffff' });
    }

    dispararProyectil() {
        const now = this.time.now;

        if (now > this.nextFire) {
            this.nextFire = now + this.fireRate;

            const proyectil = this.proyectiles.get();

            if (proyectil) {
                proyectil.setActive(true);
                proyectil.setVisible(true);
                proyectil.setPosition(this.nave.x, this.nave.y);

                // escalar y girar
                proyectil.setScale(0.03);
                proyectil.setAngle(-90);

                //dirección y velocidad
                proyectil.setVelocityY(-800);
                
                // Desactiva el proyectil
                this.time.delayedCall(this.projectileLife, () => {
                    proyectil.setActive(false).setVisible(false);
                });
            }
        }
    }

    crearAsteroide() {
        let asteroide = this.asteroides.get(Phaser.Math.Between(50, 750), -50, 'asteroide');

        if (asteroide) {
            asteroide.setScale(0.07)
                .setActive(true)
                .setVisible(true)
                .setVelocityY(200); // Velocidad del asteroide
        }
    }

    colisionNaveAsteroide(nave, asteroide) {
        nave.setVisible(false);
        asteroide.setActive(false).setVisible(false);

        this.gameoverImage.setVisible(true);
        this.physics.pause(); // Pausar la física del juego

        //reiniciar el juego
        this.input.keyboard.once('keydown-Q', () => {
            this.reiniciarJuego(); // Llamar al método de reinicio
        });
    }

    colisionProyectilAsteroide(proyectil, asteroide) {
        proyectil.setActive(false).setVisible(false);
        asteroide.setActive(false).setVisible(false);

        // Aumentar el puntaje por impacto de proyectil
        this.score += 20;
        this.scoreText.setText('Score: ' + this.score);
    }

    reiniciarJuego() {
        this.scene.restart(); // Reinicia la escena actual
    }

    update() {
        // Movimiento de la nave
        if (this.cursors.left.isDown) {
            this.nave.setVelocityX(-350);
        } else if (this.cursors.right.isDown) {
            this.nave.setVelocityX(350);
        } else {
            this.nave.setVelocityX(0);
        }

        if (this.cursors.space.isDown) {
            this.dispararProyectil();
        }



        // Desactivar asteroides fuera de la pantalla y actualizar puntuación
        this.asteroides.children.iterate(asteroide => {
            if (asteroide.y > this.sys.game.config.height) {
                asteroide.setActive(false).setVisible(false);

                // Aumentar el puntaje por asteroides que desaparecen sin ser destruidos
                this.score += 1;
                this.scoreText.setText('Score: ' + this.score);
            }
        });
    }
}
