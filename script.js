const kuro = document.querySelector('#kuro');
const game = document.querySelector('.game');
const scene = document.querySelector('#scene');
const dialogue = document.querySelector('#dialogue');
const dialogueName = document.querySelector('#dialogue-name');
const dialogueText = document.querySelector('#dialogue-text');
const interactionPrompt = document.querySelector('#interaction-prompt');
const promptAction = document.querySelector('#prompt-action');
const locationLabel = document.querySelector('#location-label');
const fade = document.querySelector('#fade');
const travelAlbum = document.querySelector('#travel-album');
const albumEmpty = document.querySelector('#album-empty');
const whaleAlbumPage = document.querySelector('#whale-album-page');
const keys = new Set();
const worldWidth = 2200;
let x = 430;
let y = 0;
let velocityY = 0;
let grounded = true;
let frame = 0;
let timer = 0;
let lastTime = performance.now();
let cameraX = 0;
let facing = 1;
let currentPlace = 'street';
let transitioning = false;
let dialogueLines = [];
let dialogueIndex = 0;
let typingTimer = null;
let fullDialogueText = '';
let typingComplete = true;
let motaConversationComplete = false;
let whalePostcardCollected = localStorage.getItem('kuro-whale-postcard') === 'collected';

const motaConversation = [
  ['Mota', '¡Kuro! Ven a mirar esto. El diario dice que en Japón hay gatos que esperan trenes.'],
  ['Kuro', '¿Gatos que esperan trenes? ¿Y para qué?'],
  ['Mota', 'Quién sabe. Quizás tienen trabajo.'],
  ['Kuro', '¿Y tú esperarías el tren para ir al trabajo?'],
  ['Mota', 'Por supuesto. Aunque yo prefiero esperar la once.'],
  ['Kuro', 'Eso sí que se te da bien.'],
  ['Mota', 'Si algún día llegas a Japón, busca a los gatos de estación. Dicen que algunos tienen hasta uniforme.'],
  ['Mota', 'Yo también quería viajar… pero descubrí que la Plaza Yungay tiene sombra después de almuerzo.'],
  ['Kuro', 'Entonces tendré que viajar por los dos.'],
  ['Mota', 'Eso. Y cuando vuelvas, me cuentas si encontraste un lugar con mejor once que la de aquí.']
];

function typeDialogueLine(speaker, text) {
  clearInterval(typingTimer);
  dialogue.hidden = false;
  dialogueName.textContent = speaker;
  dialogueName.className = 'dialogue-name';
  if (speaker === 'Kuro') dialogueName.classList.add('kuro-speaker');
  else if (speaker === 'Mota') dialogueName.classList.add('mota-speaker');
  else if (speaker === 'Álbum de Viaje') dialogueName.classList.add('album-speaker');
  dialogueText.textContent = '';
  fullDialogueText = text;
  typingComplete = false;
  let character = 0;
  typingTimer = setInterval(() => {
    character += 1;
    dialogueText.textContent = text.slice(0, character);
    if (character >= text.length) {
      clearInterval(typingTimer);
      typingComplete = true;
    }
  }, 24);
}

function startDialogue(lines) {
  dialogueLines = lines;
  dialogueIndex = 0;
  typeDialogueLine(...dialogueLines[0]);
}

function advanceDialogue() {
  if (!typingComplete) {
    clearInterval(typingTimer);
    dialogueText.textContent = fullDialogueText;
    typingComplete = true;
    return;
  }
  dialogueIndex += 1;
  if (dialogueIndex >= dialogueLines.length) {
    if (dialogueLines === motaConversation) {
      motaConversationComplete = true;
      scene.classList.add('mota-complete');
    }
    dialogueLines = [];
    dialogue.hidden = true;
    return;
  }
  typeDialogueLine(...dialogueLines[dialogueIndex]);
}

function closeDialogue() {
  clearInterval(typingTimer);
  dialogueLines = [];
  dialogueIndex = 0;
  typingComplete = true;
  dialogue.hidden = true;
}

function renderAlbum() {
  albumEmpty.hidden = whalePostcardCollected;
  whaleAlbumPage.hidden = !whalePostcardCollected;
}

function openAlbum() {
  keys.clear();
  renderAlbum();
  travelAlbum.hidden = false;
}

function closeAlbum() {
  travelAlbum.hidden = true;
}

function currentInteraction() {
  if (!grounded || transitioning) return null;
  if (currentPlace === 'street' && x >= 175 && x <= 300) return 'enter-house';
  if (currentPlace === 'street' && x >= worldWidth - 260) return 'go-plaza';
  if (currentPlace === 'house' && x <= 210) return 'exit-house';
  if (currentPlace === 'house' && x >= 540 && x <= 770) return 'open-album';
  if (currentPlace === 'plaza' && x <= 180) return 'return-street';
  if (currentPlace === 'plaza' && x >= 1010 && x <= 1270) return 'talk-mota';
  if (currentPlace === 'plaza' && x >= worldWidth - 280) return motaConversationComplete ? 'go-quinta' : 'route-blocked';
  if (currentPlace === 'quinta' && x <= 180) return 'return-plaza';
  if (currentPlace === 'quinta' && x >= 1110 && x <= 1510) return 'enter-museum';
  if (currentPlace === 'museum' && x <= 75) return 'exit-museum';
  if (currentPlace === 'museum' && !whalePostcardCollected && x >= game.clientWidth - 300) return 'collect-postcard';
  return null;
}

function changeLocation(nextLocation, entry = 'default') {
  if (transitioning) return;
  transitioning = true;
  fade.classList.add('active');
  setTimeout(() => {
    currentPlace = nextLocation;
    const inside = currentPlace === 'house';
    const atPlaza = currentPlace === 'plaza';
    const atQuinta = currentPlace === 'quinta';
    const atMuseum = currentPlace === 'museum';
    scene.classList.toggle('inside', inside);
    scene.classList.toggle('plaza', atPlaza);
    scene.classList.toggle('quinta', atQuinta);
    scene.classList.toggle('museum', atMuseum);
    locationLabel.hidden = atMuseum;
    locationLabel.textContent = inside ? 'Casa de Kuro' : atPlaza ? 'Plaza Yungay' : atQuinta ? 'Quinta Normal' : atMuseum ? 'Museo · Sala de la Ballena' : 'Barrio Yungay';
    if (inside) x = 175;
    else if (atPlaza) x = entry === 'from-quinta' ? worldWidth - 360 : 170;
    else if (atQuinta) x = entry === 'from-museum' ? 1430 : 170;
    else if (atMuseum) x = 170;
    else x = entry === 'from-plaza' ? worldWidth - 360 : 315;
    y = 0;
    velocityY = 0;
    grounded = true;
    if (entry === 'from-plaza' || entry === 'from-quinta') cameraX = Math.max(0, worldWidth - game.clientWidth);
    else if (entry === 'from-museum') cameraX = Math.max(0, Math.min(worldWidth - game.clientWidth, 1430 - game.clientWidth * 0.45));
    else cameraX = 0;
    dialogue.hidden = true;
    scene.style.transform = 'translateX(0)';
    requestAnimationFrame(() => {
      fade.classList.remove('active');
      transitioning = false;
    });
  }, 180);
}

addEventListener('keydown', (event) => {
  const pressedKey = event.key.toLowerCase();
  if (!travelAlbum.hidden) {
    if ((pressedKey === 'escape' || pressedKey === 'e' || pressedKey === 'enter') && !event.repeat) closeAlbum();
    return;
  }
  if (!dialogue.hidden) {
    if (pressedKey === 'escape') closeDialogue();
    else if ((pressedKey === 'e' || pressedKey === 'enter') && !event.repeat) advanceDialogue();
    return;
  }
  keys.add(pressedKey);
  if (event.code === 'Space' && grounded && dialogue.hidden) {
    grounded = false;
    velocityY = 620;
    frame = 0;
    event.preventDefault();
  }
  if ((pressedKey === 'e' || pressedKey === 'enter') && !event.repeat) {
    const interaction = currentInteraction();
    if (interaction === 'enter-house') changeLocation('house');
    if (interaction === 'exit-house') changeLocation('street');
    if (interaction === 'return-street') changeLocation('street', 'from-plaza');
    if (interaction === 'return-plaza') changeLocation('plaza', 'from-quinta');
    if (interaction === 'exit-museum') changeLocation('quinta', 'from-museum');
    if (interaction === 'open-album') {
      openAlbum();
    }
    if (interaction === 'go-plaza') changeLocation('plaza');
    if (interaction === 'go-quinta') changeLocation('quinta');
    if (interaction === 'talk-mota') {
      if (motaConversationComplete) startDialogue([['Mota', 'La sombra sigue buena, Kuro. Cuando vuelvas, me cuentas del viaje.']]);
      else startDialogue(motaConversation);
    }
    if (interaction === 'route-blocked') {
      dialogue.hidden = false;
      dialogueName.textContent = 'Camino';
      dialogueText.textContent = 'El camino hacia Quinta Normal todavía está cerrado.';
    }
    if (interaction === 'enter-museum') changeLocation('museum');
    if (interaction === 'collect-postcard') {
      whalePostcardCollected = true;
      localStorage.setItem('kuro-whale-postcard', 'collected');
      scene.classList.add('postcard-collected');
      startDialogue([
        ['Álbum de Viaje', 'Postal: La ballena de Quinta Normal'],
        ['Álbum de Viaje', 'Algunas criaturas recorren océanos enteros. Kuro se pregunta cuántos lugares podría conocer él.']
      ]);
    }
  }
});
addEventListener('keyup', (event) => {
  keys.delete(event.key.toLowerCase());
  if (event.code === 'Space' && velocityY > 180) velocityY = 180;
});

function loop(time) {
  const dt = Math.min((time - lastTime) / 1000, 0.033);
  lastTime = time;
  const controlsEnabled = dialogue.hidden && travelAlbum.hidden;
  const moving = controlsEnabled && (keys.has('arrowright') || keys.has('d') || keys.has('arrowleft') || keys.has('a'));
  const sprinting = keys.has('shift');
  const speed = sprinting ? 370 : 240;
  if (controlsEnabled && (keys.has('arrowright') || keys.has('d'))) {
    const activeWorldWidth = currentPlace === 'house' || currentPlace === 'museum' ? game.clientWidth : worldWidth;
    x = Math.min(activeWorldWidth - 110, x + speed * dt);
    facing = 1;
    kuro.style.setProperty('--facing', facing);
  }
  if (controlsEnabled && (keys.has('arrowleft') || keys.has('a'))) {
    x = Math.max(10, x - speed * dt);
    facing = -1;
    kuro.style.setProperty('--facing', facing);
  }

  if (!grounded) {
    velocityY -= 1600 * dt;
    y += velocityY * dt;
    if (y <= 0) {
      y = 0;
      velocityY = 0;
      grounded = true;
      frame = 0;
    }
  }

  kuro.style.left = `${x}px`;
  kuro.style.setProperty('--jump-y', `${y}px`);
  const interaction = currentInteraction();
  const interactionLabels = {
    'enter-house': 'Entrar a casa',
    'exit-house': 'Salir a Barrio Yungay',
    'open-album': 'Ver Álbum de Viaje',
    'go-plaza': 'Ir a Plaza Yungay',
    'return-street': 'Volver a Barrio Yungay',
    'return-plaza': 'Volver a Plaza Yungay',
    'talk-mota': 'Hablar con Mota',
    'route-blocked': 'Revisar el camino',
    'go-quinta': 'Ir a Quinta Normal',
    'enter-museum': 'Entrar al museo',
    'exit-museum': 'Salir a Quinta Normal',
    'collect-postcard': 'Revisar vitrina'
  };
  promptAction.textContent = interactionLabels[interaction] || '';
  interactionPrompt.classList.toggle('edge-left', interaction === 'exit-museum');
  interactionPrompt.classList.toggle('object-right', interaction === 'collect-postcard');
  interactionPrompt.hidden = !interaction || !dialogue.hidden;

  const viewportWidth = game.clientWidth;
  const activeWorldWidth = currentPlace === 'house' || currentPlace === 'museum' ? viewportWidth : worldWidth;
  const maxCameraX = Math.max(0, activeWorldWidth - viewportWidth);
  const lookAhead = moving ? facing * 90 : 0;
  const desiredCameraX = Math.max(0, Math.min(maxCameraX, x - viewportWidth * 0.45 + lookAhead));
  cameraX += (desiredCameraX - cameraX) * Math.min(1, 7 * dt);
  scene.style.transform = `translateX(${-cameraX}px)`;
  kuro.classList.toggle('jumping', !grounded);
  kuro.classList.toggle('running', grounded && moving);
  kuro.classList.toggle('interact', grounded && !moving && !dialogue.hidden);

  if (!grounded) {
    // Una sola secuencia por salto: impulso, subida, caída y aterrizaje.
    if (velocityY > 360) frame = 0;
    else if (velocityY > 0) frame = 1;
    else if (velocityY > -360) frame = 2;
    else frame = 3;
    kuro.style.backgroundPositionX = `${-frame * 100}px`;
  } else {
    const frameDelay = moving ? (sprinting ? 75 : 115) : 420;
    if (time - timer > frameDelay) {
      frame = (frame + 1) % 4;
      kuro.style.backgroundPositionX = `${-frame * 100}px`;
      timer = time;
    }
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

if (whalePostcardCollected) scene.classList.add('postcard-collected');
renderAlbum();

// Vista directa para revisar escenas durante el desarrollo. No afecta el juego normal.
const previewParams = new URLSearchParams(window.location.search);
const previewPlace = previewParams.get('preview');
if (['house', 'plaza', 'quinta', 'museum'].includes(previewPlace)) {
  requestAnimationFrame(() => changeLocation(previewPlace));
}
if (previewParams.get('postcard') === 'collected') whalePostcardCollected = true;
if (previewParams.get('album') === 'open') {
  setTimeout(openAlbum, 240);
}
