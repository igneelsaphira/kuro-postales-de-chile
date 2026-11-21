function createPhaserRenderer(mount, camera, worldWidthFor, readPlayer) {
  const world = mount.parentElement;
  const worldHeight = camera.viewHeight;
  // El lienzo usa las unidades del mundo. El contenedor aplica la escala de pantalla.
  const surfaceHeight = Math.ceil(worldHeight);
  const frameWidth = 543;
  const playerScale = .76;
  const poses = {
    idle: { file: 'kuro-idle-sprite-sheet.png', frameHeight: 724, height: 133 },
    running: { file: 'kuro-run-sprite-sheet.png', frameHeight: 375, height: 69, lift: 12, offset: -4 },
    jumping: { file: 'kuro-jump-sprite-sheet.png', frameHeight: 375, height: 69, offset: 6 },
    interact: { file: 'kuro-interact-sprite-sheet.png', frameHeight: 724, height: 133 },
    reading: { file: 'kuro-reading-seated-sprite-sheet.png', frameHeight: 724, height: 133, floor: .27 }
  };
  const places = {
    house: { file: 'casa-kuro-interior-v1.png', floor: .14, draw: drawHouse },
    street: { file: 'barrio-plaza-quinta-continuo-pixel-v1.png', floor: .22, draw: drawStreet }
  };
  let requestedPlace = null;
  let activePlace = null;
  let status = 'idle';
  let engine;

  function fail(error) {
    status = 'failed';
    delete world.dataset.phaserScene;
    engine?.destroy(true);
    console.warn('El juego usará el renderizador original.', error);
  }

  function showAfterRender(game, place) {
    game.events.once('postrender', () => {
      if (status === 'ready' && requestedPlace === place) world.dataset.phaserScene = place;
    });
  }

  function drawHouse(scene, width) {
    const background = scene.add.image(width / 2, worldHeight / 2, 'house');
    background.setScale(Math.max(width / background.width, worldHeight / background.height));
  }

  function drawStreet(scene, width) {
    scene.add.image(0, 0, 'street').setOrigin(0).setDisplaySize(width, worldHeight);
    const cornerX = width * .31;
    const cornerY = worldHeight * .755;
    scene.add.ellipse(cornerX + 56.5, cornerY - 2, 103, 14, 0x49382d, .22);
    const table = scene.add.image(cornerX - 80, cornerY + 4, 'mota-table').setOrigin(0, 1);
    table.setScale(88 / table.width);
    const mota = scene.add.image(cornerX, cornerY, 'mota').setOrigin(0, 1);
    mota.setScale(118 / mota.width);
  }

  function drawPlayer(sprite, floor) {
    const player = readPlayer();
    const pose = poses[player.pose];
    const bottom = worldHeight * (1 - (pose.floor ?? floor)) - player.jump - (pose.lift ?? 0);
    const offset = pose.offset ?? 0;
    if (sprite.texture.key !== player.pose) {
      sprite.setTexture(player.pose, player.frame);
      sprite.setDisplaySize(100 * playerScale, pose.height * playerScale);
      if (offset > 0) sprite.setCrop(0, 0, frameWidth, pose.frameHeight * (pose.height - offset) / pose.height);
      else sprite.setCrop();
    } else if (sprite.frame.name !== player.frame) {
      sprite.setFrame(player.frame);
    }
    sprite.setPosition(player.centerX, bottom + offset * playerScale);
    sprite.setFlipX(player.facing < 0);
  }

  function switchScene(game) {
    if (activePlace) game.scene.stop(activePlace);
    activePlace = requestedPlace;
    if (activePlace) {
      game.scene.start(activePlace);
      game.loop.wake();
    } else {
      game.loop.sleep();
    }
  }

  function boot(Phaser) {
    class LoadScenes extends Phaser.Scene {
      constructor() {
        super('load-scenes');
      }

      preload() {
        this.load.once('loaderror', (file) => fail(new Error(`No se pudo cargar ${file.key}.`)));
        for (const [key, place] of Object.entries(places)) this.load.image(key, `assets/${place.file}`);
        this.load.image('mota', 'assets/mota-reading.png');
        this.load.image('mota-table', 'assets/mesita-once-mota-v1.png');
        for (const [key, pose] of Object.entries(poses)) {
          this.load.spritesheet(key, `assets/${pose.file}`, { frameWidth, frameHeight: pose.frameHeight });
        }
      }

      create() {
        if (status === 'failed') return;
        status = 'ready';
        this.scene.stop();
        switchScene(this.game);
      }
    }

    class KuroScene extends Phaser.Scene {
      constructor(place) {
        super(place);
        this.place = place;
      }

      create() {
        places[this.place].draw(this, worldWidthFor(this.place));
        this.kuro = this.add.sprite(0, 0, 'idle', 0).setOrigin(.5, 1);
        this.kuro.setDisplaySize(100 * playerScale, poses.idle.height * playerScale);
        this.cameras.main.setRoundPixels(false);
        this.update();
        showAfterRender(this.game, this.place);
      }

      update() {
        if (requestedPlace !== this.place || status !== 'ready') return;
        const width = Math.ceil(camera.viewWidth);
        if (this.scale.width !== width) this.scale.resize(width, surfaceHeight);
        this.cameras.main.setScroll(camera.x, camera.y);
        drawPlayer(this.kuro, places[this.place].floor);
      }
    }

    engine = new Phaser.Game({
      type: Phaser.CANVAS,
      parent: mount,
      backgroundColor: '#eac99d',
      pixelArt: true,
      banner: false,
      audio: { noAudio: true },
      input: { keyboard: false, mouse: false, touch: false, gamepad: false },
      loader: { imageLoadType: 'HTMLImageElement' },
      scale: { mode: Phaser.Scale.NONE, width: Math.ceil(camera.viewWidth), height: surfaceHeight },
      scene: [LoadScenes, ...Object.keys(places).map(place => new KuroScene(place))]
    });
  }

  function setLocation(place) {
    const nextPlace = Object.hasOwn(places, place) ? place : null;
    if (requestedPlace === nextPlace) return;
    requestedPlace = nextPlace;
    delete world.dataset.phaserScene;
    if (status === 'ready') {
      switchScene(engine);
    } else if (status === 'idle' && requestedPlace) {
      status = 'loading';
      const script = document.createElement('script');
      script.src = 'vendor/phaser/phaser.min.js?v=4.2.1';
      script.onload = () => {
        try {
          boot(window.Phaser);
        } catch (error) {
          fail(error);
        }
      };
      script.onerror = () => fail(new Error('No se pudo cargar Phaser.'));
      document.head.appendChild(script);
    }
  }

  return { setLocation };
}
