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
const valparaisoAlbumPage = document.querySelector('#valparaiso-album-page');
const valparaisoPostscript = document.querySelector('#valparaiso-postscript');
const albumPageNumber = document.querySelector('#album-page-number');
const albumPrev = document.querySelector('#album-prev');
const albumNext = document.querySelector('#album-next');
const photoMoment = document.querySelector('#photo-moment');
const shutterFlash = document.querySelector('#shutter-flash');
const worldMap = document.querySelector('#world-map');
const worldMapClose = document.querySelector('#world-map-close');
const santiagoMapStatus = document.querySelector('#santiago-map-status');
const mapZoneStamp = document.querySelector('#map-zone-stamp');
const mapZoneTitle = document.querySelector('#map-zone-title');
const mapZoneMessage = document.querySelector('#map-zone-message');
const mapZoneIcon = document.querySelector('#map-zone-icon');
const mapZoneDescription = document.querySelector('#map-zone-description');
const mapZoneTravel = document.querySelector('#map-zone-travel');
const localMapNodes = document.querySelector('.local-map-nodes');
const nextDestination = document.querySelector('#next-destination');
const sootSeaLion = document.querySelector('#soot-sea-lion');
const sootGoat = document.querySelector('#soot-goat');
const sootDog = document.querySelector('#soot-dog');
const sootBird = document.querySelector('#soot-bird');
const sootProjectile = document.querySelector('#soot-projectile');
const caveBell = document.querySelector('#cave-bell');
const bellAwakening = document.querySelector('#bell-awakening');
const caveClaw = document.querySelector('#cave-claw');
const movementHint = document.querySelector('.hint');
const dialogueChoices = document.querySelector('#dialogue-choices');
const dialogueChoiceButtons = [...dialogueChoices.querySelectorAll('[data-tizne-choice]')];
const dialogueHelp = dialogue.querySelector('.dialogue-help');
const mapZoneNodes = [...worldMap.querySelectorAll('[data-map-zone]')];
const localTravelButtons = [...worldMap.querySelectorAll('[data-travel]')];
const keys = new Set();
const worldWidth = 2200;
const valparaisoHillGroundProfile = [
  [0, 13.2],
  [0.1, 13.8],
  [0.2, 18.3],
  [0.3, 22.5],
  [0.5, 28.5],
  [0.7, 29.2],
  [0.82, 29],
  [1, 28.2],
];
let x = Math.min(430, game.clientWidth * 0.36);
let y = 0;
let velocityY = 0;
let grounded = true;
let jumpsUsed = 0;
let frame = 0;
let timer = 0;
let lastTime = performance.now();
let cameraX = 0;
let cameraLookAhead = 0;
let facing = 1;
let currentPlace = 'street';
let transitioning = false;
let dialogueLines = [];
let dialogueIndex = 0;
let typingTimer = null;
let fullDialogueText = '';
let typingComplete = true;
let dialogueOnComplete = null;
let dialogueChoiceActive = false;
let selectedTizneChoice = 0;
let motaConversationComplete = false;
let tizneConversationComplete = false;
let whalePostcardCollected = localStorage.getItem('kuro-whale-postcard') === 'collected';
let quintaPhotoCollected = localStorage.getItem('kuro-quinta-photo') === 'collected';
let firstLetterSent = localStorage.getItem('kuro-first-letter') === 'sent';
let caveBellCollected = localStorage.getItem('kuro-cave-bell') === 'collected';
let tizneResponse = localStorage.getItem('kuro-tizne-response');
let sittingInChair = false;
let autoEscapingCave = false;
let albumPageIndex = 0;
let selectedMapZone = 'santiago';
let selectedLocalDestination = -1;
let seaLionAttackPhase = 'idle';
let seaLionPhaseUntil = 0;
let nextSeaLionAttackAt = performance.now() + 1400;
let sootProjectileActive = false;
let sootProjectileX = 0;
let sootProjectileY = 0;
let sootProjectileVelocityX = -315;
let sootProjectileVelocityY = 0;
let sootProjectileBounces = 0;
let sootProjectileSpin = 0;
let sootProjectileDeflected = false;
let clawUntil = 0;
let nextClawAt = 0;
let sootHitCount = 0;
let sootInvulnerableUntil = 0;
let seaLionFacing = -1;
let goatX = 0;
let goatActive = false;
let goatChaseComplete = false;
let goatLastHitAt = 0;
let audioContext = null;

function movementHintText() {
  if (currentPlace === 'cave' && !caveBellCollected) return '← → moverse · Shift correr · Espacio saltar · F zarpazo';
  if (caveBellCollected) return '← → moverse · Shift correr · Espacio ×2 doble salto';
  return '← → moverse · Shift correr · Espacio saltar';
}

function playBellChime() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  audioContext ||= new AudioContextClass();
  if (audioContext.state === 'suspended') audioContext.resume();
  const now = audioContext.currentTime;
  [880, 1174.66, 1567.98].forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = index === 0 ? 'sine' : 'triangle';
    oscillator.frequency.setValueAtTime(frequency, now + index * .11);
    gain.gain.setValueAtTime(.0001, now + index * .11);
    gain.gain.exponentialRampToValueAtTime(index === 0 ? .12 : .07, now + index * .11 + .018);
    gain.gain.exponentialRampToValueAtTime(.0001, now + index * .11 + .72);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now + index * .11);
    oscillator.stop(now + index * .11 + .75);
  });
}

function awakenBell() {
  const bellRect = caveBell.getBoundingClientRect();
  const gameRect = game.getBoundingClientRect();
  bellAwakening.style.left = `${bellRect.left - gameRect.left + bellRect.width / 2}px`;
  bellAwakening.style.top = `${bellRect.top - gameRect.top + bellRect.height / 2}px`;
  bellAwakening.classList.remove('active');
  void bellAwakening.offsetWidth;
  bellAwakening.classList.add('active');
  setTimeout(() => bellAwakening.classList.remove('active'), 1100);
  playBellChime();
}

function triggerDoubleJumpSpark() {
  kuro.classList.remove('double-jump');
  void kuro.offsetWidth;
  kuro.classList.add('double-jump');
  setTimeout(() => kuro.classList.remove('double-jump'), 320);
}

function attemptJump() {
  if (grounded) {
    grounded = false;
    jumpsUsed = 1;
    velocityY = 620;
    frame = 0;
    return;
  }
  if (caveBellCollected && jumpsUsed === 1) {
    jumpsUsed = 2;
    velocityY = 585;
    frame = 0;
    triggerDoubleJumpSpark();
  }
}

function collectCaveBell() {
  if (caveBellCollected) return;
  awakenBell();
  caveBellCollected = true;
  localStorage.setItem('kuro-cave-bell', 'collected');
  scene.classList.add('cave-bell-collected');
  game.classList.add('cave-return');
  caveClaw.hidden = true;
  movementHint.textContent = movementHintText();
  sootHitCount = 0;
  updateSootLevel();
  startDialogue([
    ['Kuro', 'Está cubierto de hollín… pero todavía es un cascabel.'],
    ['Kuro', '¡Sonó! Siento las patas mucho más ligeras…'],
    ['Nuevo movimiento', 'Doble salto desbloqueado · Pulsa Espacio otra vez mientras estás en el aire.']
  ]);
}

function resetSootProjectile() {
  sootProjectileActive = false;
  sootProjectile.hidden = true;
  sootProjectileBounces = 0;
  sootProjectileDeflected = false;
}

function setGridFrame(element, frameIndex, columns, rows) {
  const column = frameIndex % columns;
  const row = Math.floor(frameIndex / columns);
  const positionX = columns === 1 ? 0 : column / (columns - 1) * 100;
  const positionY = rows === 1 ? 0 : row / (rows - 1) * 100;
  element.style.backgroundPosition = `${positionX}% ${positionY}%`;
}

function resetGoatChase() {
  goatX = Math.max(40, game.clientWidth * .24);
  goatActive = false;
  goatChaseComplete = false;
  goatLastHitAt = 0;
  sootGoat.classList.remove('active');
  sootGoat.style.left = `${goatX}px`;
  sootGoat.style.setProperty('--goat-y', '0px');
  setGridFrame(sootGoat, 0, 3, 2);
}

function updateGoatChase(time, dt) {
  if (currentPlace !== 'cave') {
    sootGoat.classList.remove('active');
    return;
  }
  if (caveBellCollected) {
    goatActive = false;
    goatX = game.clientWidth * 1.21;
    sootGoat.classList.add('active');
    sootGoat.style.left = `${goatX}px`;
    sootGoat.style.setProperty('--goat-y', '0px');
    setGridFrame(sootGoat, 0, 3, 2);
    return;
  }

  const chaseStart = game.clientWidth * .62;
  const chaseEnd = game.clientWidth * 1.72;
  if (!goatActive && !goatChaseComplete && x >= chaseStart && x < chaseEnd) {
    goatActive = true;
    goatX = Math.max(35, x - game.clientWidth * .34);
    sootGoat.classList.add('active');
  }
  if (!goatActive) return;

  const controlsEnabled = dialogue.hidden && travelAlbum.hidden && photoMoment.hidden && worldMap.hidden && !autoEscapingCave;
  if (controlsEnabled) {
    const targetX = x - 46;
    const chaseSpeed = x > goatX ? 302 : 220;
    goatX += Math.max(-chaseSpeed * dt, Math.min(chaseSpeed * dt, targetX - goatX));
  }
  const frameIndex = Math.floor(time / 105) % 6;
  const goatLift = frameIndex === 4 ? 35 : frameIndex === 5 ? 18 : 0;
  setGridFrame(sootGoat, frameIndex, 3, 2);
  sootGoat.style.left = `${goatX}px`;
  sootGoat.style.setProperty('--goat-y', `${goatLift}px`);

  const touchesKuro = Math.abs(x + 45 - (goatX + 66)) < 58 && y < 54;
  if (touchesKuro && time - goatLastHitAt > 1200) {
    goatLastHitAt = time;
    goatX -= 145;
    registerSootHit(time);
  }
  if (x >= chaseEnd) {
    goatActive = false;
    goatChaseComplete = true;
    sootGoat.classList.remove('active');
  }
}

function launchSootProjectile() {
  const seaLionX = game.clientWidth * 6 * 0.34;
  const caveFloor = game.clientHeight * 0.14;
  sootProjectileActive = true;
  sootProjectileX = seaLionX + (seaLionFacing < 0 ? 8 : 104);
  sootProjectileY = caveFloor + 74;
  sootProjectileVelocityX = seaLionFacing * 315;
  sootProjectileVelocityY = 70;
  sootProjectileBounces = 0;
  sootProjectileSpin = 0;
  sootProjectileDeflected = false;
  sootProjectile.hidden = false;
}

function triggerClaw() {
  const now = performance.now();
  const controlsEnabled = dialogue.hidden && travelAlbum.hidden && photoMoment.hidden && worldMap.hidden && !autoEscapingCave;
  if (currentPlace !== 'cave' || caveBellCollected || !controlsEnabled || now < nextClawAt) return;
  clawUntil = now + 260;
  nextClawAt = now + 430;
  kuro.classList.add('swiping');
}

function updateSootLevel() {
  kuro.classList.toggle('soot-level-1', sootHitCount === 1);
  kuro.classList.toggle('soot-level-2', sootHitCount === 2);
}

function registerSootHit(time) {
  if (time < sootInvulnerableUntil) return;
  sootHitCount += 1;
  sootInvulnerableUntil = time + 850;
  kuro.classList.remove('soot-hit');
  void kuro.offsetWidth;
  kuro.classList.add('soot-hit');
  setTimeout(() => kuro.classList.remove('soot-hit'), 320);
  resetSootProjectile();
  updateSootLevel();
  if (sootHitCount < 3) return;
  sootHitCount = 0;
  updateSootLevel();
  x = 185;
  cameraX = 0;
  cameraLookAhead = 0;
  scene.style.transform = 'translateX(0px)';
  startDialogue([['Kuro', '¡Ay, no! ¡Qué miedooo!']]);
  setTimeout(() => {
    if (currentPlace !== 'cave') return;
    closeDialogue();
    autoEscapingCave = true;
    facing = -1;
    kuro.style.setProperty('--facing', facing);
  }, 760);
}

function updateSeaLionAttack(time, dt) {
  const canAttack = currentPlace === 'cave' && !caveBellCollected && dialogue.hidden && !autoEscapingCave;
  const seaLionX = game.clientWidth * 6 * 0.34;
  const seaLionCenterX = seaLionX + 68;
  seaLionFacing = x + 50 < seaLionCenterX ? -1 : 1;
  sootSeaLion.style.setProperty('--sea-lion-facing', seaLionFacing);
  const kuroIsClose = Math.abs(x + 50 - seaLionCenterX) <= game.clientWidth * 0.82;

  if (!canAttack) {
    sootSeaLion.classList.remove('warning', 'spitting');
    seaLionAttackPhase = 'idle';
    if (currentPlace !== 'cave' || caveBellCollected) resetSootProjectile();
    return;
  }

  if (seaLionAttackPhase === 'idle' && !sootProjectileActive && kuroIsClose && time >= nextSeaLionAttackAt) {
    seaLionAttackPhase = 'warning';
    seaLionPhaseUntil = time + 650;
    sootSeaLion.classList.add('warning');
  } else if (seaLionAttackPhase === 'warning' && time >= seaLionPhaseUntil) {
    seaLionAttackPhase = 'mouth-open';
    seaLionPhaseUntil = time + 110;
    sootSeaLion.classList.remove('warning');
    sootSeaLion.classList.add('spitting');
  } else if (seaLionAttackPhase === 'mouth-open' && time >= seaLionPhaseUntil) {
    seaLionAttackPhase = 'recovering';
    seaLionPhaseUntil = time + 260;
    launchSootProjectile();
  } else if (seaLionAttackPhase === 'recovering' && time >= seaLionPhaseUntil) {
    seaLionAttackPhase = 'idle';
    nextSeaLionAttackAt = time + 2200;
    sootSeaLion.classList.remove('spitting');
  }

  if (!sootProjectileActive) return;
  const caveFloor = game.clientHeight * 0.14;
  sootProjectileVelocityY -= 880 * dt;
  sootProjectileX += sootProjectileVelocityX * dt;
  sootProjectileY += sootProjectileVelocityY * dt;
  sootProjectileSpin -= 520 * dt;

  const projectileCenterX = sootProjectileX + 12;
  const projectileCenterY = sootProjectileY + 12;
  const kuroCenterX = x + 50;
  const kuroFeetY = caveFloor + y;
  const deltaX = projectileCenterX - kuroCenterX;
  const withinSwipeHeight = projectileCenterY >= kuroFeetY + 10 && projectileCenterY <= kuroFeetY + 118;
  const inFrontOfKuro = facing > 0 ? deltaX >= -8 && deltaX <= 125 : deltaX <= 8 && deltaX >= -125;

  if (!sootProjectileDeflected && time < clawUntil && withinSwipeHeight && inFrontOfKuro) {
    sootProjectileDeflected = true;
    sootProjectileVelocityX = facing * 430;
    sootProjectileVelocityY = Math.max(280, Math.abs(sootProjectileVelocityY) * .6);
    sootProjectileBounces = 0;
  }

  if (sootProjectileDeflected && Math.abs(projectileCenterX - seaLionCenterX) <= 48) {
    resetSootProjectile();
    sootSeaLion.classList.add('startled');
    setTimeout(() => sootSeaLion.classList.remove('startled'), 380);
    return;
  }

  const touchesKuro = Math.abs(deltaX) <= 35 && projectileCenterY >= kuroFeetY + 8 && projectileCenterY <= kuroFeetY + 104;
  if (!sootProjectileDeflected && touchesKuro) {
    registerSootHit(time);
    return;
  }

  if (sootProjectileY <= caveFloor) {
    if (sootProjectileBounces === 0) {
      sootProjectileY = caveFloor;
      sootProjectileVelocityY = 330;
      sootProjectileVelocityX *= 0.86;
      sootProjectileBounces = 1;
    } else {
      resetSootProjectile();
      return;
    }
  }

  if (sootProjectileX < -40 || sootProjectileX > game.clientWidth * 6 + 40) {
    resetSootProjectile();
    return;
  }
  sootProjectile.style.left = `${sootProjectileX}px`;
  sootProjectile.style.bottom = `${sootProjectileY}px`;
  sootProjectile.style.setProperty('--soot-spin', `${sootProjectileSpin}deg`);
}

const mapZoneDetails = {
  north: ['Zona norte', 'Norte', 'Bloqueado · todavía muy lejos', '🔒', 'Desiertos, salares y cielos enormes esperan más adelante.'],
  rapa: ['Destino especial', 'Rapa Nui', 'Bloqueado · viaje especial', '🔒', 'Una ruta muy lejana que aparecerá en una futura aventura.'],
  valparaiso: ['Costa central', 'Valparaíso', 'Disponible · Estación Puerto', '🚂', 'El tren ya puede llevar a Kuro hasta su primera parada junto al mar.'],
  santiago: ['Zona central', 'Santiago', '', '★', ''],
  cordillera: ['Destino final', 'Cordillera', 'Bloqueado · completa las demás zonas', '🔒', 'La gran subida final se abrirá después de conocer el resto de Chile.'],
  south: ['Zona sur', 'Sur verde', 'Bloqueado · viaje futuro', '🔒', 'Bosques, lluvia y un camino secreto hacia Isla Mocha.'],
  chiloe: ['Patagonia norte', 'Chiloé', 'Bloqueado · viaje futuro', '🔒', 'Palafitos, agua y el lugar ideal para aprender a cruzarla sin miedo.'],
  antarctica: ['Destino especial', 'Antártida', 'Bloqueado · viaje especial', '🔒', 'Una expedición futura al extremo más frío del mapa.']
};

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

const tizneConversation = [
  ['Tizne', 'Oye… ¿eres turista?'],
  ['Kuro', 'Supongo. Llegué en el tren hace poquito.'],
  ['Tizne', 'Conozco un lugar que no aparece en las guías.'],
  ['Kuro', 'Eso suena como algo que debería preocuparme.'],
  ['Tizne', 'O como algo que vale la pena descubrir. Perdí un cascabel allá arriba, en una cueva.'],
  ['Kuro', '¿Y por qué no vas a buscarlo tú?'],
  ['Tizne', 'Digamos que la cueva y yo no terminamos en muy buenos términos. Era de mi familia.'],
  ['Tizne', 'Si quieres conocer el verdadero Valparaíso, podría mostrarte el camino.']
];

const tizneReturnConversation = [
  ['Tizne', 'Volviste… y tienes el cascabel.', 'remorseful'],
  ['Kuro', 'La cueva no era como la contaste. Las sombras dejaron de atacar cuando lo hice sonar.', 'annoyed'],
  ['Tizne', 'Pensé que si te decía la verdad, no ibas a ayudarme.', 'remorseful'],
  ['Kuro', 'Entonces no era de tu familia.', 'annoyed'],
  ['Tizne', 'No. Un coleccionista paga bien por cosas antiguas. Yo… necesitaba una salida.', 'remorseful']
];

const tizneResponses = {
  precavido: {
    line: 'Quizás te habría ayudado. Pero ahora no sé si puedo creerte.',
    reply: 'Lo entiendo. Si vuelvo a pedirte algo, empezaré por la verdad.',
    followUp: 'No espero que confíes enseguida. Doña Bruma vive más arriba; puedes comprobarlo tú mismo.',
    postscript: 'P. D. Tener cuidado no cerró el camino; me ayudó a mirar mejor antes de seguir.'
  },
  comprensivo: {
    line: 'Podías pedírmelo. No necesitabas inventar una historia.',
    reply: 'No se me da bien pedir ayuda. Pero… gracias por volver.',
    followUp: 'Doña Bruma vive más arriba. Gracias por escucharme, incluso después de lo que hice.',
    postscript: 'P. D. A veces quien engaña también tiene miedo de pedir ayuda.'
  },
  aventurero: {
    line: 'La próxima vez dime la verdad. Probablemente habría venido igual.',
    reply: 'Hecho. Contigo ya veo que no hace falta adornar tanto las historias.',
    followUp: 'Doña Bruma vive más arriba. La próxima aventura te la cuento sin adornos… o con menos adornos.',
    postscript: 'P. D. Entré por curiosidad y volví con más preguntas. Quizás eso también sea una respuesta.'
  }
};

if (!tizneResponses[tizneResponse]) tizneResponse = null;

const portraitKuro = document.querySelector('#portrait-kuro');
const portraitNpc = document.querySelector('#portrait-npc');
const portraitSheets = {
  Kuro: {
    neutral: 'assets/kuro-dialogue-frames-v1.png',
    annoyed: 'assets/kuro-dialogue-annoyed-frames-v1.png'
  },
  Mota: {
    neutral: 'assets/mota-dialogue-frames-v1.png'
  },
  Tizne: {
    neutral: 'assets/tizne-dialogue-frames-v1.png',
    remorseful: 'assets/tizne-dialogue-remorseful-frames-v1.png'
  }
};
const npcPortraits = {
  Mota: portraitSheets.Mota.neutral,
  Tizne: portraitSheets.Tizne.neutral
};

function portraitEmotion(character, speaker, speakerEmotion) {
  if (character === speaker) return speakerEmotion;
  return dialogueLines.find(([name, , emotion]) => name === character && emotion)?.[2] || 'neutral';
}

function setPortraitSheet(portrait, character, emotion) {
  const sheet = portraitSheets[character]?.[emotion] || portraitSheets[character]?.neutral;
  if (!sheet || portrait.dataset.sheet === sheet) return;
  portrait.querySelector('.portrait-frames').style.backgroundImage = `url('${sheet}')`;
  portrait.dataset.sheet = sheet;
}

function updateDialoguePortraits(speaker, speakerEmotion = 'neutral') {
  const npc = npcPortraits[speaker] ? speaker : dialogueLines.find(([name]) => npcPortraits[name])?.[0];
  const hasCharacter = speaker === 'Kuro' || Boolean(npcPortraits[speaker]);
  portraitKuro.hidden = !hasCharacter;
  portraitNpc.hidden = !hasCharacter || !npc;
  if (hasCharacter) setPortraitSheet(portraitKuro, 'Kuro', portraitEmotion('Kuro', speaker, speakerEmotion));
  if (npc) {
    setPortraitSheet(portraitNpc, npc, portraitEmotion(npc, speaker, speakerEmotion));
    portraitNpc.dataset.character = npc;
  }
  portraitKuro.classList.toggle('is-speaking', speaker === 'Kuro');
  portraitNpc.classList.toggle('is-speaking', speaker === npc);
  dialogue.dataset.speakerSide = !hasCharacter ? 'none' : speaker === 'Kuro' ? 'left' : 'right';
}

function typeDialogueLine(speaker, text, emotion = 'neutral') {
  clearInterval(typingTimer);
  dialogue.hidden = false;
  updateDialoguePortraits(speaker, emotion);
  dialogue.classList.add('is-typing');
  dialogueName.textContent = speaker;
  dialogueName.className = 'dialogue-name';
  if (speaker === 'Kuro') dialogueName.classList.add('kuro-speaker');
  else if (speaker === 'Mota') dialogueName.classList.add('mota-speaker');
  else if (speaker === 'Tizne') dialogueName.classList.add('tizne-speaker');
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
      dialogue.classList.remove('is-typing');
    }
  }, 24);
}

function hideDialogueChoices() {
  dialogueChoiceActive = false;
  dialogueChoices.hidden = true;
  dialogue.classList.remove('has-choices');
  dialogueChoiceButtons.forEach((button) => button.classList.remove('selected'));
  dialogueHelp.textContent = 'E / Enter continuar · Esc cerrar';
}

function startDialogue(lines, onComplete = null) {
  hideDialogueChoices();
  dialogueLines = lines;
  dialogueIndex = 0;
  dialogueOnComplete = onComplete;
  typeDialogueLine(...dialogueLines[0]);
}

function advanceDialogue() {
  if (!typingComplete) {
    clearInterval(typingTimer);
    dialogueText.textContent = fullDialogueText;
    typingComplete = true;
    dialogue.classList.remove('is-typing');
    return;
  }
  dialogueIndex += 1;
  if (dialogueIndex >= dialogueLines.length) {
    const onComplete = dialogueOnComplete;
    if (dialogueLines === motaConversation) {
      motaConversationComplete = true;
      scene.classList.add('mota-complete');
    }
    if (dialogueLines === tizneConversation) tizneConversationComplete = true;
    dialogueLines = [];
    dialogueOnComplete = null;
    scene.classList.remove('window-gazing');
    if (onComplete) {
      onComplete();
      return;
    }
    dialogue.hidden = true;
    return;
  }
  typeDialogueLine(...dialogueLines[dialogueIndex]);
}

function closeDialogue() {
  clearInterval(typingTimer);
  hideDialogueChoices();
  dialogueLines = [];
  dialogueIndex = 0;
  dialogueOnComplete = null;
  typingComplete = true;
  dialogue.hidden = true;
  scene.classList.remove('window-gazing');
}

function selectTizneChoice(index, focus = false) {
  selectedTizneChoice = (index + dialogueChoiceButtons.length) % dialogueChoiceButtons.length;
  dialogueChoiceButtons.forEach((button, buttonIndex) => {
    const selected = buttonIndex === selectedTizneChoice;
    button.classList.toggle('selected', selected);
    if (selected && focus) button.focus({ preventScroll: true });
  });
}

function showTizneChoice() {
  clearInterval(typingTimer);
  dialogue.hidden = false;
  dialogueLines = [['Tizne', '', 'remorseful'], ['Kuro', '', 'annoyed']];
  dialogueOnComplete = null;
  updateDialoguePortraits('Kuro', 'annoyed');
  dialogueName.textContent = 'Kuro';
  dialogueName.className = 'dialogue-name kuro-speaker';
  dialogueText.textContent = '¿Qué quieres responderle?';
  fullDialogueText = dialogueText.textContent;
  typingComplete = true;
  dialogue.classList.remove('is-typing');
  dialogue.classList.add('has-choices');
  dialogueChoices.hidden = false;
  dialogueChoiceActive = true;
  dialogueHelp.textContent = '↑ ↓ elegir · E / Enter confirmar · también puedes usar 1, 2 o 3';
  selectTizneChoice(0);
}

function confirmTizneChoice(choiceId = dialogueChoiceButtons[selectedTizneChoice]?.dataset.tizneChoice) {
  const response = tizneResponses[choiceId];
  if (!response) return;
  tizneResponse = choiceId;
  localStorage.setItem('kuro-tizne-response', choiceId);
  scene.classList.add('valparaiso-complete');
  renderAlbum();
  startDialogue([
    ['Kuro', response.line, 'annoyed'],
    ['Tizne', response.reply, 'remorseful'],
    ['Tizne', 'El cascabel perteneció a Doña Bruma. Guiaba a los gatitos del barrio cuando bajaba la neblina.', 'remorseful'],
    ['Kuro', 'Entonces debería devolvérselo.', 'annoyed'],
    ['Álbum de Viaje', 'Nueva postal: Al volver de la Cueva del Chivato.']
  ]);
}

function startTizneReturnConversation() {
  startDialogue(tizneReturnConversation, showTizneChoice);
}

function renderAlbum() {
  const pages = [];
  if (whalePostcardCollected) pages.push({ element: whaleAlbumPage, number: 'Santiago · 01' });
  if (quintaPhotoCollected) pages.push({ element: quintaPhotoPage, number: 'Santiago · 02' });
  if (tizneResponse) pages.push({ element: valparaisoAlbumPage, number: 'Valparaíso · 01' });
  albumPageIndex = Math.max(0, Math.min(albumPageIndex, pages.length - 1));
  albumEmpty.hidden = pages.length > 0;
  whaleAlbumPage.hidden = true;
  quintaPhotoPage.hidden = true;
  valparaisoAlbumPage.hidden = true;
  if (tizneResponse) valparaisoPostscript.textContent = tizneResponses[tizneResponse].postscript;
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
  const pageCount = Number(whalePostcardCollected) + Number(quintaPhotoCollected) + Number(Boolean(tizneResponse));
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

function updateMapDetails(zoneId) {
  worldMap.dataset.zone = zoneId;
  const [stamp, title, status, icon, description] = mapZoneDetails[zoneId];
  const isSantiago = zoneId === 'santiago';
  mapZoneStamp.textContent = stamp;
  mapZoneTitle.textContent = title;
  santiagoMapStatus.textContent = isSantiago
    ? firstLetterSent
      ? 'Recorrido completado · carta enviada'
      : 'Recorrido completado · carta pendiente'
    : status;
  localMapNodes.hidden = !isSantiago;
  nextDestination.hidden = !isSantiago;
  mapZoneMessage.hidden = isSantiago;
  mapZoneIcon.textContent = icon;
  mapZoneDescription.textContent = description;
  mapZoneTravel.hidden = zoneId !== 'valparaiso';
}

function selectMapZone(zoneId, focusNode = false) {
  selectedMapZone = zoneId;
  selectedLocalDestination = -1;
  localMapNodes.classList.remove('keyboard-active');
  localTravelButtons.forEach((button) => button.classList.remove('keyboard-selected'));
  mapZoneNodes.forEach((node) => {
    const selected = node.dataset.mapZone === zoneId;
    node.classList.toggle('selected', selected);
    node.setAttribute('aria-pressed', String(selected));
    if (selected && focusNode) node.focus({ preventScroll: true });
  });
  updateMapDetails(zoneId);
}

function moveMapSelection(direction) {
  const current = mapZoneNodes.find((node) => node.dataset.mapZone === selectedMapZone);
  if (!current) return;
  const currentX = Number(current.dataset.mapX);
  const currentY = Number(current.dataset.mapY);
  const candidates = mapZoneNodes
    .filter((node) => node !== current)
    .map((node) => {
      const dx = Number(node.dataset.mapX) - currentX;
      const dy = Number(node.dataset.mapY) - currentY;
      const valid = direction === 'left' ? dx < -2
        : direction === 'right' ? dx > 2
          : direction === 'up' ? dy < -2
            : dy > 2;
      if (!valid) return null;
      const primary = direction === 'left' || direction === 'right' ? Math.abs(dx) : Math.abs(dy);
      const secondary = direction === 'left' || direction === 'right' ? Math.abs(dy) : Math.abs(dx);
      return { node, score: primary + secondary * 1.45 };
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score);
  if (candidates.length) selectMapZone(candidates[0].node.dataset.mapZone, true);
}

function selectLocalMapDestination(index) {
  selectedLocalDestination = Math.max(0, Math.min(localTravelButtons.length - 1, index));
  localMapNodes.classList.add('keyboard-active');
  localTravelButtons.forEach((button, buttonIndex) => {
    const selected = buttonIndex === selectedLocalDestination;
    button.classList.toggle('keyboard-selected', selected);
    if (selected) button.focus({ preventScroll: true });
  });
}

function moveLocalMapSelection(direction) {
  const columns = 2;
  let nextIndex = selectedLocalDestination;
  if (direction === 'left' && nextIndex % columns > 0) nextIndex -= 1;
  if (direction === 'right' && nextIndex % columns < columns - 1 && nextIndex + 1 < localTravelButtons.length) nextIndex += 1;
  if (direction === 'up' && nextIndex - columns >= 0) nextIndex -= columns;
  if (direction === 'down' && nextIndex + columns < localTravelButtons.length) nextIndex += columns;
  selectLocalMapDestination(nextIndex);
}

function confirmMapSelection() {
  if (selectedLocalDestination >= 0) {
    localTravelButtons[selectedLocalDestination].click();
    return;
  }
  if (selectedMapZone === 'santiago') localTravelButtons[0].click();
  else if (selectedMapZone === 'valparaiso') {
    closeWorldMap();
    changeLocation('valparaiso', 'from-map');
  }
  else {
    const selectedNode = mapZoneNodes.find((node) => node.dataset.mapZone === selectedMapZone);
    selectedNode?.classList.remove('map-denied');
    void selectedNode?.offsetWidth;
    selectedNode?.classList.add('map-denied');
  }
}

function openWorldMap() {
  keys.clear();
  selectMapZone('santiago');
  worldMap.hidden = false;
}

function closeWorldMap() {
  selectedLocalDestination = -1;
  localMapNodes.classList.remove('keyboard-active');
  localTravelButtons.forEach((button) => button.classList.remove('keyboard-selected'));
  worldMap.hidden = true;
}

albumPrev.addEventListener('click', () => changeAlbumPage(-1));
albumNext.addEventListener('click', () => changeAlbumPage(1));
worldMapClose.addEventListener('click', closeWorldMap);
nextDestination.addEventListener('click', () => selectMapZone('valparaiso', true));
mapZoneTravel.addEventListener('click', () => {
  closeWorldMap();
  changeLocation('valparaiso', 'from-map');
});
mapZoneNodes.forEach((node) => {
  node.addEventListener('click', () => selectMapZone(node.dataset.mapZone));
});
worldMap.querySelectorAll('[data-travel]').forEach((button) => {
  button.addEventListener('click', () => {
    const destination = button.dataset.travel;
    closeWorldMap();
    if (destination === 'santiago') changeLocation('street');
  });
});

function currentInteraction() {
  if (!grounded || transitioning || autoEscapingCave) return null;
  if (sittingInChair) return 'leave-chair';
  if (currentPlace === 'street' && x >= game.clientWidth * 0.07 && x <= game.clientWidth * 0.22) return 'enter-house';
  const motaX = game.clientWidth * 0.523;
  if (currentPlace === 'street' && x >= motaX - 180 && x <= motaX + 155) return 'talk-mota';
  if (currentPlace === 'street' && x >= game.clientWidth * 1.32 && x <= game.clientWidth * 1.49) return 'enter-museum';
  if (currentPlace === 'street' && x >= game.clientWidth * 1.6875 - 110) return quintaPhotoCollected ? 'go-station' : 'station-locked';
  if (currentPlace === 'street' && x >= game.clientWidth * 1.12 && x <= game.clientWidth * 1.27) return quintaPhotoCollected ? 'view-mirador' : 'take-photo';
  if (currentPlace === 'house' && x <= game.clientWidth * 0.25) return 'exit-house';
  if (currentPlace === 'house' && x >= game.clientWidth * 0.27 && x <= game.clientWidth * 0.39) return 'sit-chair';
  if (currentPlace === 'house' && x >= game.clientWidth * 0.40 && x <= game.clientWidth * 0.58) return 'look-window';
  if (currentPlace === 'house' && x >= game.clientWidth * 0.67) return 'open-album';
  if (currentPlace === 'plaza' && x <= 180) return 'return-street';
  if (currentPlace === 'quinta' && x <= 145) return 'return-plaza';
  if (currentPlace === 'quinta' && x >= game.clientWidth * 0.38 && x <= game.clientWidth * 0.57) return 'enter-museum';
  if (currentPlace === 'quinta' && x >= game.clientWidth * 0.72 && x <= game.clientWidth - 115) return quintaPhotoCollected ? 'view-mirador' : 'take-photo';
  if (currentPlace === 'quinta' && x >= game.clientWidth - 110) return quintaPhotoCollected ? 'go-station' : 'station-locked';
  if (currentPlace === 'museum' && x <= 75) return 'exit-museum';
  if (currentPlace === 'museum' && !whalePostcardCollected && x >= game.clientWidth - 300) return 'collect-postcard';
  if (currentPlace === 'station' && x <= 145) return 'return-quinta';
  if (currentPlace === 'station' && x >= game.clientWidth * 0.2 && x <= game.clientWidth * 0.5) return 'use-estafeta';
  if (currentPlace === 'station' && x >= game.clientWidth * 0.58 && x <= game.clientWidth - 125) return 'take-train';
  if (currentPlace === 'valparaiso' && x <= 145) return 'take-return-train';
  if (currentPlace === 'valparaiso' && x >= game.clientWidth * 1.24 && x <= game.clientWidth * 1.56) return 'talk-tizne';
  if (currentPlace === 'valparaiso' && x >= game.clientWidth * 3.2875 - 120) return 'enter-cave';
  if (currentPlace === 'cave' && x <= 145) return caveBellCollected ? 'exit-cave' : 'flee-cave';
  if (currentPlace === 'cave' && !caveBellCollected && x >= game.clientWidth * 6 - 230) return 'collect-bell';
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
    const atValparaiso = currentPlace === 'valparaiso';
    const atCave = currentPlace === 'cave';
    scene.classList.toggle('inside', inside);
    scene.classList.toggle('street', atStreet);
    scene.classList.toggle('plaza', atPlaza);
    scene.classList.toggle('quinta', atQuinta);
    scene.classList.toggle('museum', atMuseum);
    scene.classList.toggle('station', atStation);
    scene.classList.toggle('valparaiso', atValparaiso);
    scene.classList.toggle('cave', atCave);
    scene.classList.toggle('cave-bell-collected', caveBellCollected);
    game.classList.toggle('cave-active', atCave);
    game.classList.toggle('cave-return', atCave && caveBellCollected);
    caveClaw.hidden = !atCave || caveBellCollected;
    movementHint.textContent = movementHintText();
    if (!atCave) {
      sootHitCount = 0;
      updateSootLevel();
      resetSootProjectile();
    }
    if (atCave) resetGoatChase();
    locationLabel.hidden = atMuseum;
    locationLabel.textContent = inside ? 'Casa de Kuro' : atPlaza ? 'Plaza Yungay' : atQuinta ? 'Quinta Normal' : atMuseum ? 'Museo · Sala de la Ballena' : atStation ? 'Estación Mapocho' : atValparaiso ? 'Valparaíso' : atCave ? 'Cueva del Chivato' : 'Barrio Yungay · Plaza Yungay · Quinta Normal';
    if (inside) x = entry === 'at-chair' ? game.clientWidth * 0.34 : 175;
    else if (atPlaza) x = entry === 'from-quinta' ? game.clientWidth - 150 : entry === 'at-mota' ? game.clientWidth * 0.35 : 120;
    else if (atQuinta) x = entry === 'from-museum' ? game.clientWidth * 0.5 : entry === 'at-mirador' ? game.clientWidth * 0.76 : 120;
    else if (atMuseum) x = 170;
    else if (atStation) x = entry === 'at-estafeta' ? game.clientWidth * 0.23 : entry === 'at-train' ? game.clientWidth * 0.58 : entry === 'from-route' ? game.clientWidth - 150 : 120;
    else if (atValparaiso) x = entry === 'from-map' ? game.clientWidth * 0.24 : entry === 'at-tizne' ? game.clientWidth * 1.34 : entry === 'at-hills' ? game.clientWidth * 1.60 : entry === 'at-mid-hills' ? game.clientWidth * 2.44 : entry === 'at-cave' ? game.clientWidth * 3.12 : entry === 'at-connector' ? game.clientWidth * 0.82 : entry === 'at-station-seam' ? game.clientWidth * 0.56 : entry === 'at-plaza-seam' ? game.clientWidth * 1.12 : 160;
    else if (atCave) x = entry === 'at-goat' ? game.clientWidth * .82 : entry === 'at-sea-lion' ? game.clientWidth * 1.99 : entry === 'at-dog' ? game.clientWidth * 3.42 : entry === 'at-middle' ? game.clientWidth * 3 : entry === 'at-bird' ? game.clientWidth * 4.52 : entry === 'at-bell' ? game.clientWidth * 5.76 : 185;
    else x = entry === 'from-quinta' ? game.clientWidth * 1.6875 - 150 : entry === 'from-museum' ? game.clientWidth * 1.29 : entry === 'at-museum' ? game.clientWidth * 1.40 : entry === 'at-quinta' ? game.clientWidth * 1.20 : entry === 'at-mota' ? game.clientWidth * 0.36 : entry === 'at-plaza' ? game.clientWidth * 0.86 : entry === 'at-neighborhood' ? game.clientWidth * 0.46 : entry === 'at-seam' ? game.clientWidth * 0.90 : game.clientWidth * 0.14;
    y = 0;
    velocityY = 0;
    grounded = true;
    jumpsUsed = 0;
    autoEscapingCave = false;
    if (['at-neighborhood', 'at-seam', 'at-plaza', 'at-mota', 'at-quinta', 'at-museum', 'from-museum'].includes(entry) && atStreet) cameraX = Math.max(0, Math.min(game.clientWidth * 0.6875, x - game.clientWidth * 0.45));
    else if (entry === 'from-quinta') cameraX = atStreet ? game.clientWidth * 0.6875 : atPlaza ? 0 : Math.max(0, worldWidth - game.clientWidth);
    else if (entry === 'from-museum') cameraX = atQuinta ? 0 : Math.max(0, Math.min(worldWidth - game.clientWidth, 1430 - game.clientWidth * 0.45));
    else if (entry === 'at-mirador') cameraX = atQuinta ? 0 : Math.max(0, worldWidth - game.clientWidth);
    else if (entry === 'at-estafeta' || entry === 'at-train') cameraX = atStation ? 0 : Math.max(0, Math.min(worldWidth - game.clientWidth, x - game.clientWidth * 0.45));
    else if (['at-tizne', 'at-hills', 'at-mid-hills', 'at-cave', 'at-connector', 'at-station-seam', 'at-plaza-seam'].includes(entry)) cameraX = Math.max(0, Math.min(game.clientWidth * 2.2875, x - game.clientWidth * 0.45));
    else if (atCave && ['at-goat', 'at-sea-lion', 'at-dog', 'at-middle', 'at-bird', 'at-bell'].includes(entry)) cameraX = Math.max(0, Math.min(game.clientWidth * 5, x - game.clientWidth * 0.45));
    else cameraX = 0;
    cameraLookAhead = 0;
    dialogue.hidden = true;
    scene.classList.remove('window-gazing');
    scene.style.transform = `translateX(${-cameraX}px)`;
    requestAnimationFrame(() => {
      fade.classList.remove('active');
      transitioning = false;
    });
  }, 180);
}

addEventListener('keydown', (event) => {
  const pressedKey = event.key.toLowerCase();
  if (!worldMap.hidden) {
    if (pressedKey === 'escape') {
      closeWorldMap();
      return;
    }
    const mapDirection = pressedKey === 'arrowleft' || pressedKey === 'a' ? 'left'
      : pressedKey === 'arrowright' || pressedKey === 'd' ? 'right'
        : pressedKey === 'arrowup' || pressedKey === 'w' ? 'up'
          : pressedKey === 'arrowdown' || pressedKey === 's' ? 'down'
            : null;
    if (mapDirection && !event.repeat) {
      event.preventDefault();
      if (selectedLocalDestination >= 0) moveLocalMapSelection(mapDirection);
      else moveMapSelection(mapDirection);
    }
    if ((pressedKey === 'e' || pressedKey === 'enter' || event.code === 'Space') && !event.repeat) {
      event.preventDefault();
      confirmMapSelection();
    }
    return;
  }
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
    if (dialogueChoiceActive) {
      if ((pressedKey === 'arrowup' || pressedKey === 'w') && !event.repeat) selectTizneChoice(selectedTizneChoice - 1, true);
      else if ((pressedKey === 'arrowdown' || pressedKey === 's') && !event.repeat) selectTizneChoice(selectedTizneChoice + 1, true);
      else if (['1', '2', '3'].includes(pressedKey) && !event.repeat) confirmTizneChoice(dialogueChoiceButtons[Number(pressedKey) - 1]?.dataset.tizneChoice);
      else if ((pressedKey === 'e' || pressedKey === 'enter' || event.code === 'Space') && !event.repeat) confirmTizneChoice();
      else if (pressedKey === 'escape') closeDialogue();
      event.preventDefault();
      return;
    }
    if (pressedKey === 'escape') closeDialogue();
    else if ((pressedKey === 'e' || pressedKey === 'enter') && !event.repeat) advanceDialogue();
    return;
  }
  if (pressedKey === 'f' && !event.repeat) {
    triggerClaw();
    event.preventDefault();
  }
  keys.add(pressedKey);
  if (event.code === 'Space' && !event.repeat) {
    attemptJump();
    event.preventDefault();
  }
  if ((pressedKey === 'e' || pressedKey === 'enter') && !event.repeat) {
    const interaction = currentInteraction();
    if (interaction === 'enter-house') changeLocation('house');
    if (interaction === 'exit-house') changeLocation('street');
    if (interaction === 'return-street') changeLocation('street', 'at-plaza');
    if (interaction === 'return-plaza') changeLocation('street', 'from-quinta');
    if (interaction === 'exit-museum') changeLocation('street', 'from-museum');
    if (interaction === 'open-album') {
      openAlbum();
    }
    if (interaction === 'look-window') {
      scene.classList.add('window-gazing');
      startDialogue([
        ['Kuro', 'Qué bonito está el jacarandá hoy.']
      ]);
    }
    if (interaction === 'sit-chair') {
      keys.clear();
      sittingInChair = true;
      x = game.clientWidth * 0.34;
      facing = 1;
      frame = 0;
    }
    if (interaction === 'talk-mota') {
      if (motaConversationComplete) startDialogue([['Mota', 'La sombra sigue buena, Kuro. Cuando vuelvas, me cuentas del viaje.']]);
      else startDialogue(motaConversation);
    }
    if (interaction === 'enter-museum') changeLocation('museum');
    if (interaction === 'go-station') changeLocation('station');
    if (interaction === 'return-quinta') changeLocation('street', 'at-quinta');
    if (interaction === 'station-locked') {
      startDialogue([['Kuro', 'Quiero seguir, pero antes debería guardar una foto de este lugar.']]);
    }
    if (interaction === 'take-photo') takeQuintaPhoto();
    if (interaction === 'view-mirador') {
      startDialogue([['Kuro', 'Desde aquí todo se ve distinto. Me alegra haber guardado este momento.']]);
    }
    if (interaction === 'take-train') openWorldMap();
    if (interaction === 'take-return-train') openWorldMap();
    if (interaction === 'talk-tizne') {
      if (caveBellCollected && !tizneResponse) startTizneReturnConversation();
      else if (tizneResponse) startDialogue([['Tizne', tizneResponses[tizneResponse].followUp, 'remorseful']]);
      else if (tizneConversationComplete) startDialogue([['Tizne', 'No tienes que decidir ahora. Los cerros no se irán a ninguna parte.']]);
      else startDialogue(tizneConversation);
    }
    if (interaction === 'enter-cave') {
      changeLocation('cave');
    }
    if (interaction === 'flee-cave') {
      startDialogue([['Kuro', '¡Ay, no! ¡Qué miedooo!']]);
      setTimeout(() => {
        if (currentPlace !== 'cave') return;
        closeDialogue();
        autoEscapingCave = true;
        facing = -1;
        kuro.style.setProperty('--facing', facing);
      }, 720);
    }
    if (interaction === 'exit-cave') changeLocation('valparaiso', 'at-cave');
    if (interaction === 'collect-bell') collectCaveBell();
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
caveClaw.addEventListener('pointerdown', (event) => {
  event.preventDefault();
  triggerClaw();
});
dialogueChoiceButtons.forEach((button, index) => {
  button.addEventListener('pointerenter', () => selectTizneChoice(index));
  button.addEventListener('click', () => confirmTizneChoice(button.dataset.tizneChoice));
});
addEventListener('keyup', (event) => {
  keys.delete(event.key.toLowerCase());
  if (event.code === 'Space' && velocityY > 180) velocityY = 180;
});

function loop(time) {
  const dt = Math.min((time - lastTime) / 1000, 0.033);
  lastTime = time;
  const propScale = Math.max(0.78, Math.min(1, game.clientWidth / 1100));
  scene.style.setProperty('--prop-scale', propScale.toFixed(3));
  if (sittingInChair) x = game.clientWidth * 0.34;
  const controlsEnabled = dialogue.hidden && travelAlbum.hidden && photoMoment.hidden && worldMap.hidden && !sittingInChair && !autoEscapingCave;
  const moving = autoEscapingCave || (controlsEnabled && (keys.has('arrowright') || keys.has('d') || keys.has('arrowleft') || keys.has('a')));
  const sprinting = keys.has('shift');
  const speed = sprinting ? 370 : 240;
  if (autoEscapingCave) {
    x = Math.max(10, x - 520 * dt);
    if (x <= 12) {
      autoEscapingCave = false;
      changeLocation('valparaiso', 'at-cave');
    }
  }
  if (controlsEnabled && (keys.has('arrowright') || keys.has('d'))) {
    const activeWorldWidth = currentPlace === 'valparaiso' ? game.clientWidth * 3.2875 : currentPlace === 'cave' ? game.clientWidth * 6 : currentPlace === 'street' ? game.clientWidth * 1.6875 : currentPlace === 'house' || currentPlace === 'museum' || currentPlace === 'plaza' || currentPlace === 'quinta' || currentPlace === 'station' ? game.clientWidth : worldWidth;
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
      jumpsUsed = 0;
      frame = 0;
    }
  }

  if (currentPlace === 'valparaiso') {
    const panoramaWidth = game.clientWidth * 1.6875;
    const hillsStart = game.clientWidth * 1.60;
    const plazaRiseStart = game.clientWidth * 1.50;
    let groundPercent;
    if (x <= plazaRiseStart) {
      const descentProgress = Math.max(0, Math.min(1, x / panoramaWidth));
      groundPercent = 29.5 - descentProgress * 13;
    } else if (x <= hillsStart) {
      const seamProgress = (x - plazaRiseStart) / (hillsStart - plazaRiseStart);
      groundPercent = 17.94 + (valparaisoHillGroundProfile[0][1] - 17.94) * seamProgress;
    } else {
      const hillProgress = Math.max(0, Math.min(1, (x - hillsStart) / panoramaWidth));
      const nextPointIndex = valparaisoHillGroundProfile.findIndex(([progress]) => progress >= hillProgress);
      const nextPoint = valparaisoHillGroundProfile[nextPointIndex < 0 ? valparaisoHillGroundProfile.length - 1 : nextPointIndex];
      const previousPoint = valparaisoHillGroundProfile[Math.max(0, (nextPointIndex < 0 ? valparaisoHillGroundProfile.length - 1 : nextPointIndex) - 1)];
      const segmentLength = nextPoint[0] - previousPoint[0];
      const segmentProgress = segmentLength === 0 ? 0 : (hillProgress - previousPoint[0]) / segmentLength;
      groundPercent = previousPoint[1] + (nextPoint[1] - previousPoint[1]) * segmentProgress;
    }
    kuro.style.setProperty('--valpo-ground', `${groundPercent}%`);
  }
  updateGoatChase(time, dt);
  updateSeaLionAttack(time, dt);
  kuro.classList.toggle('swiping', time < clawUntil);
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
    'return-street': 'Volver a Barrio Yungay',
    'return-plaza': 'Volver a Plaza Yungay',
    'talk-mota': 'Hablar con Mota',
    'go-quinta': 'Ir a Quinta Normal',
    'enter-museum': 'Entrar al museo',
    'go-station': 'Ir a Estación Mapocho',
    'return-quinta': 'Volver a Quinta Normal',
    'station-locked': 'Revisar la ruta',
    'take-photo': 'Sacar una foto',
    'view-mirador': 'Mirar el paisaje',
    'use-estafeta': firstLetterSent ? 'Revisar Estafeta' : 'Enviar carta a la abuelita',
    'take-train': 'Tomar el tren',
    'take-return-train': 'Tomar el tren a Santiago',
    'talk-tizne': 'Hablar con Tizne',
    'enter-cave': 'Entrar a la cueva',
    'flee-cave': 'Salir de la cueva',
    'exit-cave': 'Volver a Valparaíso',
    'collect-bell': 'Recoger el cascabel',
    'exit-museum': 'Salir a Quinta Normal',
    'collect-postcard': 'Revisar vitrina'
  };
  promptAction.textContent = interactionLabels[interaction] || '';
  interactionPrompt.classList.toggle('edge-left', interaction === 'exit-museum');
  interactionPrompt.classList.toggle('object-right', interaction === 'collect-postcard');
  interactionPrompt.classList.toggle('chair-action', interaction === 'leave-chair');
  interactionPrompt.classList.toggle('talk-mota', interaction === 'talk-mota');
  interactionPrompt.classList.toggle('quinta-action', ['enter-museum', 'take-photo', 'view-mirador', 'go-station', 'station-locked'].includes(interaction));
  interactionPrompt.classList.toggle('mirador-action', ['take-photo', 'view-mirador', 'go-station', 'station-locked'].includes(interaction));
  interactionPrompt.classList.toggle('station-action', ['use-estafeta', 'take-train'].includes(interaction));
  interactionPrompt.classList.toggle('train-action', interaction === 'take-train');
  interactionPrompt.hidden = !interaction || !dialogue.hidden;

  const viewportWidth = game.clientWidth;
  const activeWorldWidth = currentPlace === 'valparaiso' ? viewportWidth * 3.2875 : currentPlace === 'cave' ? viewportWidth * 6 : currentPlace === 'street' ? viewportWidth * 1.6875 : currentPlace === 'house' || currentPlace === 'museum' || currentPlace === 'plaza' || currentPlace === 'quinta' || currentPlace === 'station' ? viewportWidth : worldWidth;
  const maxCameraX = Math.max(0, activeWorldWidth - viewportWidth);
  const targetLookAhead = moving ? facing * 72 : 0;
  cameraLookAhead += (targetLookAhead - cameraLookAhead) * Math.min(1, 3 * dt);
  const focusX = x + cameraLookAhead;
  const focusOnScreen = focusX - cameraX;
  const deadzoneLeft = viewportWidth * 0.40;
  const deadzoneRight = viewportWidth * 0.60;
  let desiredCameraX = cameraX;
  if (focusOnScreen < deadzoneLeft) desiredCameraX = focusX - deadzoneLeft;
  else if (focusOnScreen > deadzoneRight) desiredCameraX = focusX - deadzoneRight;
  desiredCameraX = Math.max(0, Math.min(maxCameraX, desiredCameraX));
  cameraX += (desiredCameraX - cameraX) * Math.min(1, 4.5 * dt);
  scene.style.transform = `translateX(${-cameraX}px)`;
  if (currentPlace === 'cave') game.style.setProperty('--cave-light-x', `${x - cameraX + 50}px`);
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
if (tizneResponse) scene.classList.add('valparaiso-complete');
renderAlbum();

// Vista directa para revisar escenas durante el desarrollo. No afecta el juego normal.
const previewParams = new URLSearchParams(window.location.search);
const requestedPreviewPlace = previewParams.get('preview');
const previewPlace = requestedPreviewPlace === 'sotomayor' ? 'valparaiso' : ['plaza', 'quinta'].includes(requestedPreviewPlace) ? 'street' : requestedPreviewPlace;
if (['street', 'house', 'plaza', 'quinta', 'museum', 'station', 'valparaiso', 'cave'].includes(previewPlace)) {
  const previewSpot = previewParams.get('at');
  const previewEntry = requestedPreviewPlace === 'quinta'
    ? 'at-quinta'
    : previewPlace === 'house' && previewParams.get('chair') === 'sit'
      ? 'at-chair'
    : previewPlace === 'street' && ['neighborhood', 'seam', 'plaza', 'mota', 'quinta', 'museum'].includes(previewSpot)
      ? `at-${previewSpot}`
    : previewPlace === 'station' && ['estafeta', 'train'].includes(previewSpot)
      ? `at-${previewSpot}`
    : previewPlace === 'valparaiso' && ['tizne', 'hills', 'mid-hills', 'cave', 'connector', 'station-seam', 'plaza-seam'].includes(previewSpot)
      ? `at-${previewSpot}`
    : previewPlace === 'cave' && ['goat', 'sea-lion', 'dog', 'middle', 'bird', 'bell'].includes(previewSpot)
      ? `at-${previewSpot}`
      : 'default';
  requestAnimationFrame(() => changeLocation(previewPlace, previewEntry));
}
if (previewParams.get('postcard') === 'collected') whalePostcardCollected = true;
if (previewParams.get('photo') === 'collected') quintaPhotoCollected = true;
if (previewParams.get('bell') === 'collected') caveBellCollected = true;
if (previewParams.get('bell') === 'missing') caveBellCollected = false;
if (previewParams.get('bell') === 'unlock') {
  caveBellCollected = false;
  setTimeout(() => {
    if (currentPlace === 'cave') collectCaveBell();
  }, 620);
}
if (previewParams.get('jump') === 'double') {
  setTimeout(() => {
    closeDialogue();
    attemptJump();
    setTimeout(attemptJump, 230);
  }, 620);
}
if (previewParams.get('story') === 'tizne-confession') {
  caveBellCollected = true;
  tizneResponse = null;
  setTimeout(startTizneReturnConversation, 620);
}
if (previewParams.get('story') === 'tizne-choice') {
  caveBellCollected = true;
  tizneResponse = null;
  setTimeout(showTizneChoice, 620);
}
if (tizneResponses[previewParams.get('tizne')]) {
  tizneResponse = previewParams.get('tizne');
  renderAlbum();
}
if (['open', 'valparaiso'].includes(previewParams.get('album'))) {
  setTimeout(() => {
    if (previewParams.get('album') === 'valparaiso') albumPageIndex = 99;
    openAlbum();
  }, 240);
}
if (previewParams.get('photoView') === 'open') {
  setTimeout(() => { photoMoment.hidden = false; }, 240);
}
if (previewParams.get('map') === 'open') {
  setTimeout(openWorldMap, 260);
}
if (previewParams.get('attack') === 'show') {
  setTimeout(() => {
    if (currentPlace === 'cave') launchSootProjectile();
  }, 900);
}
if (previewParams.get('attack') === 'mouth') {
  setTimeout(() => {
    if (currentPlace !== 'cave') return;
    seaLionAttackPhase = 'mouth-open';
    seaLionPhaseUntil = performance.now() + 2000;
    sootSeaLion.classList.remove('warning');
    sootSeaLion.classList.add('spitting');
  }, 500);
}
