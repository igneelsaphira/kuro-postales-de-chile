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
const quintaPhotoPage = document.querySelector('#quinta-photo-page');
const albumPageNumber = document.querySelector('#album-page-number');
const albumPrev = document.querySelector('#album-prev');
const albumNext = document.querySelector('#album-next');
const photoMoment = document.querySelector('#photo-moment');
const shutterFlash = document.querySelector('#shutter-flash');
const keys = new Set();
const worldWidth = 2200;
let x = Math.min(430, game.clientWidth * 0.36);
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
let quintaPhotoCollected = localStorage.getItem('kuro-quinta-photo') === 'collected';
let firstLetterSent = localStorage.getItem('kuro-first-letter') === 'sent';
let sittingInChair = false;
let albumPageIndex = 0;

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
  const pages = [];
  if (whalePostcardCollected) pages.push({ element: whaleAlbumPage, number: 'Santiago · 01' });
  if (quintaPhotoCollected) pages.push({ element: quintaPhotoPage, number: 'Santiago · 02' });
  albumPageIndex = Math.max(0, Math.min(albumPageIndex, pages.length - 1));
  albumEmpty.hidden = pages.length > 0;
  whaleAlbumPage.hidden = true;
  quintaPhotoPage.hidden = true;
  albumPrev.hidden = pages.length < 2;
  albumNext.hidden = pages.length < 2;
  if (pages.length) {
    pages[albumPageIndex].element.hidden = false;
    albumPageNumber.textContent = `${pages[albumPageIndex].number} · ${albumPageIndex + 1}/${pages.length}`;
  } else {
    albumPageNumber.textContent = 'Santiago · 00';
  }
}

function changeAlbumPage(direction) {
  const pageCount = Number(whalePostcardCollected) + Number(quintaPhotoCollected);
  if (pageCount < 2) return;
  albumPageIndex = (albumPageIndex + direction + pageCount) % pageCount;
  renderAlbum();
}

function openAlbum() {
  keys.clear();
  renderAlbum();
  travelAlbum.hidden = false;
}

function closeAlbum() {
  travelAlbum.hidden = true;
}

function takeQuintaPhoto() {
  keys.clear();
  quintaPhotoCollected = true;
  localStorage.setItem('kuro-quinta-photo', 'collected');
  scene.classList.add('quinta-photo-collected');
  shutterFlash.classList.remove('active');
  void shutterFlash.offsetWidth;
  shutterFlash.classList.add('active');
  setTimeout(() => {
    photoMoment.hidden = false;
    shutterFlash.classList.remove('active');
  }, 230);
}

function closePhotoMoment() {
  photoMoment.hidden = true;
}

albumPrev.addEventListener('click', () => changeAlbumPage(-1));
albumNext.addEventListener('click', () => changeAlbumPage(1));

function currentInteraction() {
  if (!grounded || transitioning) return null;
  if (sittingInChair) return 'leave-chair';
  if (currentPlace === 'street' && x >= game.clientWidth * 0.27 && x <= game.clientWidth * 0.44) return 'enter-house';
  if (currentPlace === 'street' && x >= game.clientWidth * 2 - 170) return 'go-plaza';
  if (currentPlace === 'house' && x <= game.clientWidth * 0.25) return 'exit-house';
  if (currentPlace === 'house' && x >= game.clientWidth * 0.27 && x <= game.clientWidth * 0.39) return 'sit-chair';
  if (currentPlace === 'house' && x >= game.clientWidth * 0.40 && x <= game.clientWidth * 0.58) return 'look-window';
  if (currentPlace === 'house' && x >= game.clientWidth * 0.67) return 'open-album';
  if (currentPlace === 'plaza' && x <= 180) return 'return-street';
  const motaX = game.clientWidth + 160;
  if (currentPlace === 'plaza' && x >= motaX - 110 && x <= motaX + 190) return 'talk-mota';
  if (currentPlace === 'plaza' && x >= game.clientWidth * 2 - 170) return motaConversationComplete ? 'go-quinta' : 'route-blocked';
  if (currentPlace === 'quinta' && x <= 180) return 'return-plaza';
  if (currentPlace === 'quinta' && x >= 1110 && x <= 1510) return 'enter-museum';
  if (currentPlace === 'quinta' && x >= 2050) return quintaPhotoCollected ? 'go-station' : 'station-locked';
  if (currentPlace === 'quinta' && x >= 1840 && x <= 2035) return quintaPhotoCollected ? 'view-mirador' : 'take-photo';
  if (currentPlace === 'museum' && x <= 75) return 'exit-museum';
  if (currentPlace === 'museum' && !whalePostcardCollected && x >= game.clientWidth - 300) return 'collect-postcard';
  if (currentPlace === 'station' && x <= 180) return 'return-quinta';
  if (currentPlace === 'station' && x >= 720 && x <= 1010) return 'use-estafeta';
  if (currentPlace === 'station' && x >= 1370 && x <= 1780) return 'inspect-train';
  if (currentPlace === 'station' && x >= 2040) return 'station-route-blocked';
  return null;
}

function changeLocation(nextLocation, entry = 'default') {
  if (transitioning) return;
  transitioning = true;
  fade.classList.add('active');
  setTimeout(() => {
    currentPlace = nextLocation;
    sittingInChair = entry === 'at-chair';
    const inside = currentPlace === 'house';
    const atStreet = currentPlace === 'street';
    const atPlaza = currentPlace === 'plaza';
    const atQuinta = currentPlace === 'quinta';
    const atMuseum = currentPlace === 'museum';
    const atStation = currentPlace === 'station';
    scene.classList.toggle('inside', inside);
    scene.classList.toggle('street', atStreet);
    scene.classList.toggle('plaza', atPlaza);
    scene.classList.toggle('quinta', atQuinta);
    scene.classList.toggle('museum', atMuseum);
    scene.classList.toggle('station', atStation);
    locationLabel.hidden = atMuseum;
    locationLabel.textContent = inside ? 'Casa de Kuro' : atPlaza ? 'Plaza Yungay' : atQuinta ? 'Quinta Normal' : atMuseum ? 'Museo · Sala de la Ballena' : atStation ? 'Estación Mapocho' : 'Barrio Yungay';
    if (inside) x = entry === 'at-chair' ? game.clientWidth * 0.305 : 175;
    else if (atPlaza) x = entry === 'from-quinta' ? game.clientWidth * 2 - 280 : entry === 'at-mota' ? game.clientWidth + 80 : 170;
    else if (atQuinta) x = entry === 'from-museum' ? 1430 : entry === 'at-mirador' ? 1980 : 170;
    else if (atMuseum) x = 170;
    else if (atStation) x = entry === 'at-estafeta' ? 850 : entry === 'at-train' ? 1510 : entry === 'from-route' ? worldWidth - 360 : 170;
    else x = entry === 'from-plaza' ? game.clientWidth * 2 - 280 : entry === 'at-neighborhood' ? game.clientWidth * 1.35 : entry === 'at-seam' ? game.clientWidth * 0.95 : game.clientWidth * 0.36;
    y = 0;
    velocityY = 0;
    grounded = true;
    if (entry === 'from-plaza') cameraX = game.clientWidth;
    else if (entry === 'at-neighborhood') cameraX = game.clientWidth;
    else if (entry === 'at-seam') cameraX = game.clientWidth * 0.5;
    else if (entry === 'at-mota') cameraX = game.clientWidth;
    else if (entry === 'from-quinta') cameraX = atPlaza ? game.clientWidth : Math.max(0, worldWidth - game.clientWidth);
    else if (entry === 'from-museum') cameraX = Math.max(0, Math.min(worldWidth - game.clientWidth, 1430 - game.clientWidth * 0.45));
    else if (entry === 'at-mirador') cameraX = Math.max(0, worldWidth - game.clientWidth);
    else if (entry === 'at-estafeta' || entry === 'at-train') cameraX = Math.max(0, Math.min(worldWidth - game.clientWidth, x - game.clientWidth * 0.45));
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
  if (sittingInChair) {
    if ((pressedKey === 'escape' || pressedKey === 'e' || pressedKey === 'enter') && !event.repeat) {
      sittingInChair = false;
      x = game.clientWidth * 0.395;
      frame = 0;
    }
    return;
  }
  if (!photoMoment.hidden) {
    if ((pressedKey === 'escape' || pressedKey === 'e' || pressedKey === 'enter') && !event.repeat) closePhotoMoment();
    return;
  }
  if (!travelAlbum.hidden) {
    if (pressedKey === 'arrowleft' && !event.repeat) changeAlbumPage(-1);
    else if (pressedKey === 'arrowright' && !event.repeat) changeAlbumPage(1);
    else if ((pressedKey === 'escape' || pressedKey === 'e' || pressedKey === 'enter') && !event.repeat) closeAlbum();
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
    if (interaction === 'look-window') {
      startDialogue([
        ['Kuro', 'Desde aquí Santiago se ve enorme.'],
        ['Kuro', 'Pero mi casa todavía se siente cerquita de todo.']
      ]);
    }
    if (interaction === 'sit-chair') {
      keys.clear();
      sittingInChair = true;
      x = game.clientWidth * 0.305;
      facing = 1;
      frame = 0;
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
    if (interaction === 'go-station') changeLocation('station');
    if (interaction === 'return-quinta') changeLocation('quinta', 'at-mirador');
    if (interaction === 'station-locked') {
      startDialogue([['Kuro', 'Quiero seguir, pero antes debería guardar una foto de este lugar.']]);
    }
    if (interaction === 'take-photo') takeQuintaPhoto();
    if (interaction === 'view-mirador') {
      startDialogue([['Kuro', 'Desde aquí todo se ve distinto. Me alegra haber guardado este momento.']]);
    }
    if (interaction === 'inspect-train') {
      startDialogue([['Kuro', 'Mota tenía razón. Las estaciones sí dan ganas de conocer lugares nuevos.']]);
    }
    if (interaction === 'station-route-blocked') {
      startDialogue([['Kuro', 'El camino hacia el centro todavía no está listo. Volveré después.']]);
    }
    if (interaction === 'use-estafeta') {
      if (firstLetterSent) {
        startDialogue([['Estafeta Gatuna', 'Tu carta ya va en camino. El viaje de hoy está guardado.']]);
      } else {
        firstLetterSent = true;
        localStorage.setItem('kuro-first-letter', 'sent');
        scene.classList.add('letter-sent');
        startDialogue([
          ['Kuro', 'Abuelita: hoy vi una ballena enorme y saqué mi primera foto.'],
          ['Kuro', 'Empecé cerquita de casa, pero siento que el mundo ya se hizo más grande.'],
          ['Estafeta Gatuna', 'Carta enviada. Tu viaje quedó guardado.']
        ]);
      }
    }
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
  const controlsEnabled = dialogue.hidden && travelAlbum.hidden && photoMoment.hidden && !sittingInChair;
  const moving = controlsEnabled && (keys.has('arrowright') || keys.has('d') || keys.has('arrowleft') || keys.has('a'));
  const sprinting = keys.has('shift');
  const speed = sprinting ? 370 : 240;
  if (controlsEnabled && (keys.has('arrowright') || keys.has('d'))) {
    const activeWorldWidth = currentPlace === 'house' || currentPlace === 'museum' ? game.clientWidth : currentPlace === 'street' || currentPlace === 'plaza' ? game.clientWidth * 2 : worldWidth;
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
    'look-window': 'Mirar por la ventana',
    'sit-chair': 'Sentarse a leer',
    'leave-chair': 'Levantarse',
    'go-plaza': 'Ir a Plaza Yungay',
    'return-street': 'Volver a Barrio Yungay',
    'return-plaza': 'Volver a Plaza Yungay',
    'talk-mota': 'Hablar con Mota',
    'route-blocked': 'Revisar el camino',
    'go-quinta': 'Ir a Quinta Normal',
    'enter-museum': 'Entrar al museo',
    'go-station': 'Ir a Estación Mapocho',
    'return-quinta': 'Volver a Quinta Normal',
    'station-locked': 'Revisar la ruta',
    'take-photo': 'Sacar una foto',
    'view-mirador': 'Mirar el paisaje',
    'use-estafeta': firstLetterSent ? 'Revisar Estafeta' : 'Enviar carta a la abuelita',
    'inspect-train': 'Mirar el tren',
    'station-route-blocked': 'Revisar próxima ruta',
    'exit-museum': 'Salir a Quinta Normal',
    'collect-postcard': 'Revisar vitrina'
  };
  promptAction.textContent = interactionLabels[interaction] || '';
  interactionPrompt.classList.toggle('edge-left', interaction === 'exit-museum');
  interactionPrompt.classList.toggle('object-right', interaction === 'collect-postcard');
  interactionPrompt.classList.toggle('chair-action', interaction === 'leave-chair');
  interactionPrompt.hidden = !interaction || !dialogue.hidden;

  const viewportWidth = game.clientWidth;
  const activeWorldWidth = currentPlace === 'house' || currentPlace === 'museum' ? viewportWidth : currentPlace === 'street' || currentPlace === 'plaza' ? viewportWidth * 2 : worldWidth;
  const maxCameraX = Math.max(0, activeWorldWidth - viewportWidth);
  const lookAhead = moving ? facing * 90 : 0;
  const desiredCameraX = Math.max(0, Math.min(maxCameraX, x - viewportWidth * 0.45 + lookAhead));
  cameraX += (desiredCameraX - cameraX) * Math.min(1, 7 * dt);
  scene.style.transform = `translateX(${-cameraX}px)`;
  kuro.classList.toggle('jumping', !grounded);
  kuro.classList.toggle('running', grounded && moving);
  kuro.classList.toggle('interact', grounded && !moving && !dialogue.hidden);
  kuro.classList.toggle('chair-reading', sittingInChair);

  if (!grounded) {
    // Una sola secuencia por salto: impulso, subida, caída y aterrizaje.
    if (velocityY > 360) frame = 0;
    else if (velocityY > 0) frame = 1;
    else if (velocityY > -360) frame = 2;
    else frame = 3;
    kuro.style.backgroundPositionX = `${-frame * 100}px`;
  } else {
    const frameDelay = sittingInChair ? 700 : moving ? (sprinting ? 75 : 115) : 420;
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
if (quintaPhotoCollected) scene.classList.add('quinta-photo-collected');
if (firstLetterSent) scene.classList.add('letter-sent');
renderAlbum();

// Vista directa para revisar escenas durante el desarrollo. No afecta el juego normal.
const previewParams = new URLSearchParams(window.location.search);
const previewPlace = previewParams.get('preview');
if (['street', 'house', 'plaza', 'quinta', 'museum', 'station'].includes(previewPlace)) {
  const previewSpot = previewParams.get('at');
  const previewEntry = previewPlace === 'quinta' && previewSpot === 'mirador'
    ? 'at-mirador'
    : previewPlace === 'house' && previewParams.get('chair') === 'sit'
      ? 'at-chair'
    : previewPlace === 'street' && ['neighborhood', 'seam'].includes(previewSpot)
      ? `at-${previewSpot}`
    : previewPlace === 'plaza' && previewSpot === 'mota'
      ? 'at-mota'
    : previewPlace === 'station' && ['estafeta', 'train'].includes(previewSpot)
      ? `at-${previewSpot}`
      : 'default';
  requestAnimationFrame(() => changeLocation(previewPlace, previewEntry));
}
if (previewParams.get('postcard') === 'collected') whalePostcardCollected = true;
if (previewParams.get('photo') === 'collected') quintaPhotoCollected = true;
if (previewParams.get('album') === 'open') {
  setTimeout(openAlbum, 240);
}
if (previewParams.get('photoView') === 'open') {
  setTimeout(() => { photoMoment.hidden = false; }, 240);
}
