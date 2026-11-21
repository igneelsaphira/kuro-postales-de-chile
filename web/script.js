const kuro = document.querySelector('#kuro');
const previewParams = new URLSearchParams(window.location.search);
const game = document.querySelector('.game');
const gameWorld = document.querySelector('#game-world');
// La física y la cámara usan estas dimensiones, independientemente de la escala en pantalla.
const stageWidth = gameWorld.clientWidth;
const stageHeight = gameWorld.clientHeight;
const camera = new GameCamera(stageWidth, parseFloat(getComputedStyle(gameWorld).height));
const useDomHouse = previewParams.get('houseRenderer') === 'dom';
const phaserRenderer = previewParams.get('renderer') === 'dom' ? null
  : createPhaserRenderer(document.querySelector('#phaser-world'), camera, worldWidthFor, readPlayerSprite);
const scene = document.querySelector('#scene');
const valdiviaBenches = {
  promenade: document.querySelector('.valdivia-bench'),
  island: document.querySelector('.island-bench')
};
const valdiviaCopo = document.querySelector('.valdivia-copo');
const valdiviaVendor = document.querySelector('.market-vendor');
const valdiviaPassersby = [document.querySelector('.valdivia-traveler'), document.querySelector('.valdivia-cat-tourist')];
const valdiviaCatTourist = document.querySelector('.valdivia-cat-tourist');
const catSvgNamespace = 'http://www.w3.org/2000/svg';
function catSvgElement(name, attributes) {
  const element = document.createElementNS(catSvgNamespace, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}
function catLeg(group, hipX, footX, footY, color) {
  const kneeX = Math.round(hipX + (footX - hipX) * .38);
  const ankleY = footY - 23;
  const leg = 'M ' + hipX + ' 471 C ' + kneeX + ' 516 ' + kneeX + ' 570 ' + footX + ' ' + ankleY;
  group.appendChild(catSvgElement('path', { d: leg, fill: 'none', stroke: '#3a2924', 'stroke-width': 99, 'stroke-linecap': 'round' }));
  group.appendChild(catSvgElement('path', { d: leg, fill: 'none', stroke: color, 'stroke-width': 84, 'stroke-linecap': 'round' }));
  group.appendChild(catSvgElement('path', { d: leg, fill: 'none', stroke: '#c79d73', 'stroke-width': 72, 'stroke-dasharray': '16 105', 'stroke-dashoffset': 14, opacity: .56 }));
  group.appendChild(catSvgElement('ellipse', { cx: footX + 15, cy: footY, rx: 46, ry: 25, fill: color, stroke: '#3a2924', 'stroke-width': 8 }));
}
function buildCatWalk() {
  const svg = catSvgElement('svg', { viewBox: '0 0 543 724', 'aria-hidden': 'true' });
  const defs = catSvgElement('defs', {});
  const clip = catSvgElement('clipPath', { id: 'valdivia-cat-upper-clip' });
  clip.appendChild(catSvgElement('rect', { x: 0, y: 0, width: 543, height: 512 }));
  defs.appendChild(clip);
  svg.appendChild(defs);
  const keyPoses = [
    [[445, 622], [205, 622], 0], [[399, 622], [255, 588], 3],
    [[340, 622], [331, 570], -3], [[275, 622], [401, 590], -1],
    [[205, 622], [445, 622], 0], [[255, 588], [399, 622], 3],
    [[331, 570], [340, 622], -3], [[401, 590], [275, 622], -1]
  ];
  const poses = keyPoses.flatMap((pose, index) => {
    const next = keyPoses[(index + 1) % keyPoses.length];
    return [0, 1 / 3, 2 / 3].map(t => [
      [Math.round(pose[0][0] + (next[0][0] - pose[0][0]) * t), Math.round(pose[0][1] + (next[0][1] - pose[0][1]) * t)],
      [Math.round(pose[1][0] + (next[1][0] - pose[1][0]) * t), Math.round(pose[1][1] + (next[1][1] - pose[1][1]) * t)],
      pose[2] + (next[2] - pose[2]) * t
    ]);
  });
  const frames = poses.map(([near, far]) => {
    const group = catSvgElement('g', {});
    group.style.display = 'none';
    catLeg(group, 261, far[0], far[1], '#cba47b');
    catLeg(group, 361, near[0], near[1], '#f2cf9e');
    svg.appendChild(group);
    return group;
  });
  const body = catSvgElement('g', {});
  body.appendChild(catSvgElement('image', {
    href: 'assets/valdivia-cat-tourist-walk-v3.png', x: 0, y: 0,
    width: 2172, height: 724, 'clip-path': 'url(#valdivia-cat-upper-clip)'
  }));
  svg.appendChild(body);
  valdiviaCatTourist.appendChild(svg);
  frames[0].style.display = '';
  return { frames, body, poses, index: 0 };
}
const catWalk = buildCatWalk();
function updateCatWalk() {
  if (currentPlace !== 'valdivia') return;
  const start = valdiviaCatTourist.parentElement.offsetWidth + 90;
  const distance = Math.max(0, start - parseFloat(getComputedStyle(valdiviaCatTourist).left));
  const index = Math.floor((distance % 72) / 3);
  if (index === catWalk.index) return;
  catWalk.frames[catWalk.index].style.display = 'none';
  catWalk.frames[index].style.display = '';
  catWalk.body.setAttribute('transform', 'translate(0 ' + catWalk.poses[index][2] + ')');
  catWalk.index = index;
}
function valdiviaVendorCenter() {
  return valdiviaVendor.parentElement.offsetLeft + valdiviaVendor.offsetLeft + valdiviaVendor.offsetWidth / 2;
}
function valdiviaBenchCenter(which) {
  const bench = valdiviaBenches[which];
  return bench.parentElement.offsetLeft + bench.offsetLeft + bench.offsetWidth / 2;
}
const dialogue = document.querySelector('#dialogue');
const dialogueName = document.querySelector('#dialogue-name');
const dialogueText = document.querySelector('#dialogue-text');
const interactionPrompt = document.querySelector('#interaction-prompt');
const promptAction = document.querySelector('#prompt-action');
const gameHud = document.querySelector('#game-hud');
const touchControls = document.querySelector('#touch-controls');
const controlsButton = document.querySelector('#show-controls');
const controlsGuide = document.querySelector('#controls-guide');
const bridgeControls = document.querySelector('#controls-bridge');
const doubleJumpControls = document.querySelector('#controls-double-jump');
const clawControls = document.querySelector('#controls-claw');
const locationCity = document.querySelector('#location-city');
const locationLabel = document.querySelector('#location-label');
const healthValue = document.querySelector('#health-value');
const fade = document.querySelector('#fade');
const travelAlbum = document.querySelector('#travel-album');
const albumEmpty = document.querySelector('#album-empty');
const whaleAlbumPage = document.querySelector('#whale-album-page');
const quintaPhotoPage = document.querySelector('#quinta-photo-page');
const valparaisoAlbumPage = document.querySelector('#valparaiso-album-page');
const valdiviaAlbumPage = document.querySelector('#valdivia-album-page');
const bridgeAlbumPage = document.querySelector('#bridge-album-page');
const valparaisoPostscript = document.querySelector('#valparaiso-postscript');
const albumPageNumber = document.querySelector('#album-page-number');
const albumPrev = document.querySelector('#album-prev');
const albumNext = document.querySelector('#album-next');
const albumClose = document.querySelector('#album-close');
const albumTurnSheet = document.querySelector('#album-turn-sheet');
const albumTurnReveal = document.querySelector('#album-turn-reveal');
const photoMoment = document.querySelector('#photo-moment');
const mailComposer = document.querySelector('#mail-composer');
const mailPaperPosition = mailComposer.querySelector('.mail-paper-position');
const mailPaper = mailComposer.querySelector('.mail-paper');
const mailCopy = mailComposer.querySelector('.mail-copy');
const mailPostscript = mailComposer.querySelector('.mail-postscript');
const mailAttachments = mailComposer.querySelector('.mail-attachments');
const mailPostcard = mailComposer.querySelector('.mail-attachment-postcard');
const mailPhoto = mailComposer.querySelector('.mail-attachment-photo');
const mailSend = mailComposer.querySelector('.mail-send');
const mailClose = mailComposer.querySelector('.mail-close');
const mailImprint = mailComposer.querySelector('.mail-imprint');
const mailFolds = mailComposer.querySelector('.mail-folds');
const letterSlot = document.querySelector('.letter-slot');
const shutterFlash = document.querySelector('#shutter-flash');
const worldMap = document.querySelector('#world-map');
const trainRide = document.querySelector('#train-ride');
const trainWheels = document.querySelector('#train-wheels');
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
const dogProjectile = document.querySelector('#dog-projectile');
const caveBell = document.querySelector('#cave-bell');
const bellAwakening = document.querySelector('#bell-awakening');
const caveClaw = document.querySelector('#cave-claw');
const dialogueChoices = document.querySelector('#dialogue-choices');
const dialogueChoiceButtons = [...dialogueChoices.querySelectorAll('[data-tizne-choice]')];
const dialogueHelp = dialogue.querySelector('.dialogue-keyboard-help');
const mapZoneNodes = [...worldMap.querySelectorAll('[data-map-zone]')];
const localTravelButtons = [...worldMap.querySelectorAll('[data-travel]')];
const keys = new Set();
const touchKeys = new Map();
const worldWidth = 2200;
const sceneWidthMultipliers = {
  street: 1.6875,
  house: 1,
  plaza: 1,
  quinta: 1,
  museum: 1,
  station: 1,
  valparaiso: 3.2875,
  valdivia: 4,
  bridge: 2.4,
  cave: 6
};
const valparaisoHillGroundProfile = [
  [0, 14.7],
  [0.05, 14.7],
  [0.1, 14.4],
  [0.15, 15.1],
  [0.2, 16.8],
  [0.25, 18.6],
  [0.3, 19.7],
  [0.35, 21.2],
  [0.4, 22.1],
  [0.45, 23.5],
  [0.5, 25.3],
  [0.55, 27.8],
  [0.6, 29.6],
  [0.65, 31.4],
  [0.7, 32.8],
  [0.75, 33.6],
  [0.8, 33.9],
  [0.85, 34],
  [0.9, 33.9],
  [0.95, 33.7],
  [1, 33.6],
];
let x = Math.min(430, stageWidth * 0.36);
let y = 0;
let velocityY = 0;
let grounded = true;
let jumpsUsed = 0;
let frame = 0;
let lastSpriteFrameAt = 0;
let lastTime = performance.now();
let bridgeDepth = 0;
let bridgeDirection = 'back';
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
let whalePostcardCollected = false;
let quintaPhotoCollected = false;
let bridgePostcardCollected = false;
let firstLetterSent = false;
let returnedFromValparaiso = false;
let grandmotherReplyRead = false;
let caveBellCollected = false;
let brumaBellReturned = false;
let brumaMet = false;
let tizneResponse = null;
let valdiviaTracksFound = false;
let valdiviaPassageFound = false;
let valdiviaBridgeCrossed = false;
let valdiviaFamilyHelped = false;
let copoFollowing = false;
let copoWorldX = null;
let copoChasing = false;
let copoFacing = 1;
let copoBenchSide = -1;
let vendorAttentionTarget = null;
let vendorFacing = 1;
let vendorShownFacing = 1;
let vendorTurnTarget = 1;
let vendorTurningUntil = 0;
let vendorTurnStartedAt = 0;
let sittingInChair = false;
let sittingOnBench = null;
let autoEscapingCave = false;
let albumPageIndex = 0;
let albumTurnFrame = null;
let albumOpenedFromItems = false;
let selectedMapZone = 'santiago';
let selectedLocalDestination = -1;
let mapOpenedFromMenu = false;
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
const sootHitLimit = 3;
let sootHitCount = 0;
let sootInvulnerableUntil = 0;
const hudHearts = Array.from({ length: sootHitLimit }, () => {
  const heart = document.createElement('span');
  heart.className = 'hud-heart';
  return heart;
});
document.querySelector('#health-hearts').append(...hudHearts);
let seaLionFacing = -1;
let goatX = 0;
let goatActive = false;
let goatChaseComplete = false;
let goatLastHitAt = 0;
let goatClawRecoilUntil = 0;
let goatClawRecoilDirection = -1;
let packActive = false;
let packChaseComplete = false;
let packStartedAt = 0;
let dogX = 0;
let dogLastHitAt = 0;
let dogRecoilUntil = 0;
let dogRecoilDirection = -1;
let dogRecoilSpeed = 235;
let birdX = 0;
let birdLastHitAt = 0;
let birdRecoilUntil = 0;
let birdClawRecoilUntil = 0;
let birdClawRecoilDirection = -1;
let nextDogShotAt = 0;
let dogSpittingUntil = 0;
let dogProjectileActive = false;
let dogProjectileX = 0;
let dogProjectileY = 0;
let dogProjectileVelocityX = 0;
let dogProjectileVelocityY = 0;
let dogProjectileBounces = 0;
let dogProjectileSpin = 0;
let dogProjectileDeflected = false;
let audioContext = null;
// Coordenadas en pantallas: cada terraza obliga a mirar hacia un lado distinto.
const bridgePathLayout = [
  [.35, .68, 0, .52, 'trail', 'river'],
  [.32, 1.37, .35, .73, 'clearing', 'river'],
  [.12, .48, .62, 1.06, 'detour', 'river'],
  [1.16, 1.53, .62, 1.37, 'trail', 'underpass'],
  [1.18, 2.18, 1.20, 1.58, 'clearing', 'underpass'],
  [1.84, 2.19, 1.48, 2.27, 'trail', 'underpass'],
  [1.28, 1.63, 1.48, 2.20, 'detour', 'underpass'],
  [.60, 2.18, 2.08, 2.47, 'clearing', 'mud'],
  [.25, .79, 2.12, 2.73, 'detour', 'mud'],
  [.44, .81, 2.38, 3.12, 'trail', 'mud'],
  [.43, 1.94, 2.96, 3.37, 'clearing', 'mud'],
  [.25, .62, 3.26, 3.65, 'detour', 'mud'],
  [1.60, 1.96, 3.28, 4.13, 'trail', 'reeds'],
  [.88, 1.23, 3.68, 3.88, 'island', 'reeds'],
  [.25, 1.95, 4.00, 4.38, 'clearing', 'reeds'],
  [.27, .63, 4.27, 5.07, 'trail', 'reeds'],
  [.27, 1.67, 4.92, 5.32, 'clearing', 'wetland'],
  [1.48, 2.16, 5.05, 5.37, 'detour', 'wetland'],
  [1.35, 1.74, 5.23, 5.96, 'trail', 'wetland'],
  [1.30, 1.80, 5.56, 6.22, 'clearing', 'wetland']
];
let bridgeWalkableMask = null;
const bridgeFootprintLayout = [
  [.50, .24], [.82, .53], [1.12, .55], [1.34, .91],
  [1.40, 1.30], [1.75, 1.40], [2.00, 1.78], [1.73, 2.26],
  [1.31, 2.27], [.87, 2.27], [.62, 2.60], [.62, 3.00],
  [1.00, 3.18], [1.44, 3.18], [1.77, 3.55], [1.77, 4.01],
  [1.34, 4.19], [.82, 4.19], [.45, 4.56], [.45, 4.94],
  [.83, 5.11], [1.27, 5.11], [1.55, 5.52], [1.55, 5.85],
  [.30, .83], [1.44, 1.76], [.42, 2.53], [1.05, 3.70]
];
const bridgePathElement = document.querySelector('.bridge-earth-path');
const bridgeMudHint = document.querySelector('#bridge-mud-hint');
const bridgeWaterGlintsElement = document.querySelector('.bridge-water-glints');
const bridgeWaterGlintLayout = [
  [.12, .15], [1.77, .27], [2.21, .49], [.96, .82], [.13, 1.13], [.86, 1.39],
  [2.27, 1.19], [1.05, 1.73], [.55, 1.88], [2.22, 2.08], [.15, 2.28],
  [1.02, 2.62], [2.20, 2.74], [.13, 2.98], [1.16, 3.18], [2.25, 3.33],
  [.24, 3.61], [.76, 3.78], [2.17, 3.95], [.11, 4.19], [1.19, 4.43],
  [2.16, 4.59], [.84, 4.74], [1.95, 4.95], [.12, 5.12], [.87, 5.34],
  [2.24, 5.45], [1.06, 5.57], [1.18, 5.49], [.76, 5.70], [1.08, 5.72],
  [2.05, 5.82], [1.17, 5.88], [.91, 6.04], [1.02, 6.15], [2.22, 6.13], [.55, 6.19]
];
const bridgeClues = [
  {
    left: .30, depth: .83,
    label: 'Examinar las pisadas',
    line: 'Bajo las vigas hay huellas que se desvían hacia el río. Quiero mirar un poco más.'
  },
  {
    left: 1.65, depth: 1.40,
    label: 'Mirar el barro',
    line: 'Ese sendero oscuro se ve blando. Quizá pueda rodearlo.'
  },
  {
    left: .42, depth: 2.53,
    label: 'Mirar el barro',
    line: 'El barro conserva marcas frescas y pequeños tallos mordidos.'
  }
];
const bridgeCluesSeen = new Set();
let bridgeMudSeconds = 0;
let bridgeMudLearned = false;
let bridgeMudRecoverUntil = 0;
let bridgeMudHintUntil = 0;
let bridgeMudReturn = null;
const bridgeMudSinkDuration = 1;
let bridgeLogPlaced = false;
let bridgeLogTouched = false;
let bridgeLogProgress = 0;
let bridgeLogReadyAt = 0;
let bridgePushPoseUntil = 0;
const bridgeLogPositions = [[.18, .16, 0], [.175, .14, -5], [.155, .11, -16], [.12, .055, -35], [.07, .018, -62], [0, 0, -90]];
function positionBridgeLog(log) {
  const segment = Math.min(bridgeLogPositions.length - 2, Math.floor(bridgeLogProgress * (bridgeLogPositions.length - 1)));
  const fraction = bridgeLogProgress * (bridgeLogPositions.length - 1) - segment;
  const [offsetX, offsetY, angle] = bridgeLogPositions[segment].map((start, index) =>
    start + (bridgeLogPositions[segment + 1][index] - start) * fraction);
  log.style.setProperty('--log-x', `${offsetX * stageHeight}px`);
  log.style.setProperty('--log-y', `${offsetY * stageHeight}px`);
  log.style.setProperty('--log-angle', `${angle}deg`);
}
function advanceBridgeLog(amount, fromTap = false) {
  if (bridgeLogPlaced || amount <= 0) return;
  const previousStep = Math.floor(bridgeLogProgress * 5);
  bridgeLogProgress = Math.min(1, bridgeLogProgress + amount);
  positionBridgeLog(bridgePathElement.querySelector('.bridge-crossing-log'));
  bridgePushPoseUntil = performance.now() + 250;
  if (fromTap || Math.floor(bridgeLogProgress * 5) > previousStep) playLogPushSound();
  if (bridgeLogProgress === 1) {
    bridgeLogPlaced = true;
    scene.classList.add('bridge-log-placed');
    saveAfterMilestone();
  }
}

function updateBridgeLogInteraction(interaction, time, dt, controlsEnabled) {
  if (interaction === 'bridge-log' && !bridgeLogTouched) {
    bridgeLogTouched = true;
    bridgeLogProgress = .10;
    bridgeLogReadyAt = time + 600;
    bridgePushPoseUntil = time + 500;
    positionBridgeLog(bridgePathElement.querySelector('.bridge-crossing-log'));
  }
  if (interaction === 'bridge-log' && bridgeLogTouched && time >= bridgeLogReadyAt && controlsEnabled && (isKeyHeld('e') || isKeyHeld('enter'))) {
    advanceBridgeLog(dt / 3.4);
  }
  kuro.classList.toggle('pushing-log', currentPlace === 'bridge' && (time < bridgePushPoseUntil ||
    (interaction === 'bridge-log' && time >= bridgeLogReadyAt && (isKeyHeld('e') || isKeyHeld('enter')))));
}

function bridgeTop() { return stageHeight * 6.05; }
function bridgeExitDepth() { return -stageHeight * .20; }
function bridgeInMud(centerX, depth) {
  return centerX >= stageWidth * 1.31 && centerX <= stageWidth * 1.60 &&
    depth >= stageHeight * 1.64 && depth <= stageHeight * 2.02;
}
function bridgeOnPath(nextX, nextDepth) {
  const centerX = nextX + 50;
  // The stone bridge continues below the earth path's mask.
  if (nextDepth <= stageHeight * .10) {
    return centerX >= stageWidth * .35 + 8 && centerX <= stageWidth * .76 - 8;
  }
  // Keep the visible entrance clear of tiny holes in the generated shore mask.
  if (nextDepth <= stageHeight * .57 &&
    centerX >= stageWidth * .40 && centerX <= stageWidth * .62) return true;
  if (nextDepth > stageHeight * .57 && nextDepth <= stageHeight * .98 &&
    centerX >= stageWidth * .38 && centerX <= stageWidth * .45) return true;
  if (bridgeMudLearned && bridgeInMud(centerX, nextDepth)) return false;
  const logCenterX = stageWidth * 1.05;
  const closeToLog = Math.abs(centerX - logCenterX) <= 20;
  const logCrossing = nextDepth >= stageHeight * 3.34 &&
    nextDepth <= stageHeight * 3.69 &&
    closeToLog;
  if (logCrossing) return bridgeLogPlaced;
  if (!bridgeWalkableMask) return false;
  const { cells, cols, rows, pixel, originDepth } = bridgeWalkableMask;
  const onLand = (px, depth) => {
    const col = Math.floor(px / pixel);
    const row = Math.floor((originDepth - depth) / pixel);
    return col >= 0 && row >= 0 && col < cols && row < rows && cells[row * cols + col] === 1;
  };
  // Keep the paws on the visible soil while letting the sprite overlap shore plants.
  return [-7, 0, 7].every(offsetX => onLand(centerX + offsetX, nextDepth));
}
function stepAlongBridgeShore(nextX) {
  if (bridgeOnPath(nextX, bridgeDepth)) {
    x = nextX;
    return;
  }
  // Follow small shoreline bends without making the player align to a pixel edge.
  for (const offset of [3, -3, 6, -6, 9, -9, 12, -12]) {
    const nextDepth = Math.max(bridgeExitDepth(), Math.min(bridgeTop(), bridgeDepth + offset));
    if (bridgeOnPath(x, nextDepth) && bridgeOnPath(nextX, nextDepth)) {
      x = nextX;
      bridgeDepth = nextDepth;
      return;
    }
  }
}

function updateBridgeMud(time, dt, controlsEnabled) {
  const sinkingInMud = currentPlace === 'bridge' && controlsEnabled && grounded && !bridgeMudLearned && !bridgeMudReturn && bridgeInMud(x + 50, bridgeDepth);
  scene.classList.toggle('bridge-mud-disturbed', sinkingInMud || time < bridgeMudRecoverUntil);
  bridgeMudHint.classList.toggle('is-visible', currentPlace === 'bridge' && time < bridgeMudHintUntil);
  if (sinkingInMud) {
    if (bridgeMudSeconds === 0) playMudSquelch();
    bridgeMudSeconds += dt;
    kuro.style.setProperty('--mud-sink', `${Math.min(20, bridgeMudSeconds / bridgeMudSinkDuration * 20)}px`);
    const mud = bridgePathElement.querySelector('.bridge-sinking-mud');
    mud.style.setProperty('--mud-contact-x', `${(x + 50 - stageWidth * 1.28) / (stageWidth * .35) * 100}%`);
    mud.style.setProperty('--mud-contact-y', `${(stageHeight * 2.08 - bridgeDepth) / (stageHeight * .50) * 100}%`);
    if (bridgeMudSeconds >= bridgeMudSinkDuration) {
      const returnAbove = bridgeDepth > stageHeight * 1.84;
      bridgeMudReturn = { from: bridgeDepth, to: stageHeight * (returnAbove ? 2.28 : 1.40), startedAt: time };
      x = stageWidth * 1.45 - 50;
      bridgeMudLearned = true;
      bridgeMudSeconds = 0;
      bridgeMudRecoverUntil = time + 600;
      bridgeMudHintUntil = time + 2400;
      scene.classList.add('bridge-mud-known');
      bridgeMudHint.textContent = '¡Barro blando! Mejor rodearlo.';
      bridgeMudHint.classList.add('is-visible');
      clearPlayerKeys();
    }
  } else {
    bridgeMudSeconds = 0;
    kuro.style.setProperty('--mud-sink', '0px');
  }
  if (bridgeMudReturn) {
    const progress = Math.min(1, (time - bridgeMudReturn.startedAt) / 420);
    const eased = 1 - (1 - progress) ** 3;
    bridgeDepth = bridgeMudReturn.from + (bridgeMudReturn.to - bridgeMudReturn.from) * eased;
    kuro.style.setProperty('--mud-sink', `${18 * (1 - progress) - 14 * Math.sin(Math.PI * progress)}px`);
    if (progress === 1) bridgeMudReturn = null;
  }
  if (currentPlace === 'bridge' && time < bridgeMudHintUntil) {
    bridgeMudHint.style.left = `${x + 50}px`;
    bridgeMudHint.style.bottom = `calc(4% + ${bridgeDepth + 80}px)`;
  }
}

function renderBridgePath() {
  const viewW = stageWidth, viewH = stageHeight;
  const glints = bridgeWaterGlintLayout.map(([left, depth], index) => {
    const glint = document.createElement('i');
    glint.className = 'bridge-water-glint';
    glint.style.left = `${left * viewW}px`;
    glint.style.bottom = `calc(4% + ${depth * viewH}px)`;
    glint.style.setProperty('--glint-scale', (.7 + (index * 7 % 9) / 18).toFixed(2));
    glint.style.setProperty('--glint-duration', `${3.2 + (index * 5 % 8) * .35}s`);
    glint.style.animationDelay = `${-index * .73}s`;
    return glint;
  });
  bridgeWaterGlintsElement.replaceChildren(...glints);
  const segments = bridgePathLayout.map(([left, right, low, high, kind, zone]) => {
    const segment = document.createElement('div');
    segment.className = `bridge-path-segment ${kind} zone-${zone}`;
    segment.style.left = `${left * viewW}px`;
    segment.style.width = `${(right - left) * viewW}px`;
    segment.style.bottom = `calc(4% + ${low * viewH}px)`;
    segment.style.height = `${(high - low) * viewH}px`;
    segment.style.backgroundPosition = `${-left * viewW}px ${high * viewH}px`;
    return segment;
  });
  const footprints = bridgeFootprintLayout.map(([left, depth], index) => {
    const print = document.createElement('i');
    print.className = `bridge-footprints ${index % 2 ? 'front' : 'hind'}${index >= 24 ? ' faint' : ''}`;
    print.style.left = `${left * viewW}px`;
    print.style.bottom = `calc(4% + ${depth * viewH}px)`;
    print.style.rotate = `${index % 2 ? -16 : 15}deg`;
    return print;
  });
  const mud = document.createElement('div');
  mud.className = 'bridge-sinking-mud';
  mud.style.left = `${viewW * 1.28}px`;
  mud.style.width = `${viewW * .35}px`;
  mud.style.bottom = `calc(4% + ${viewH * 1.58}px)`;
  mud.style.height = `${viewH * .50}px`;
  mud.replaceChildren(...[0, 1, 2].map(index => {
    const bubble = document.createElement('i');
    bubble.className = `bridge-mud-bubble bubble-${index + 1}`;
    return bubble;
  }));
  const log = document.createElement('div');
  log.className = 'bridge-crossing-log';
  log.style.left = `${viewW * 1.05 - viewH * .25}px`;
  log.style.bottom = `calc(4% + ${viewH * 3.457}px)`;
  log.style.width = `${viewH * .50}px`;
  log.style.height = `${viewH * .18}px`;
  positionBridgeLog(log);
  const postcard = document.createElement('div');
  postcard.className = 'bridge-secret-postcard';
  postcard.style.left = `${viewW * 1.05 - 18}px`;
  postcard.style.bottom = `calc(4% + ${viewH * 3.79}px)`;
  const refuge = document.createElement('div');
  refuge.className = 'bridge-coipo-refuge';
  refuge.setAttribute('role', 'img');
  refuge.setAttribute('aria-label', 'Madriguera de coipos entre juncos, junto al sendero');
  refuge.style.left = `${viewW * 1.42}px`;
  refuge.style.bottom = `calc(4% + ${viewH * 5.84}px)`;
  const family = document.createElement('div');
  family.className = 'bridge-coipo-family';
  family.setAttribute('aria-label', 'Una familia de coipos junto al refugio');
  family.style.left = `${viewW * 1.29}px`;
  family.style.bottom = `calc(4% + ${viewH * 5.64}px)`;
  const land = document.createElement('div');
  land.className = 'bridge-land';
  const ground = document.createElement('div');
  ground.className = 'bridge-ground';
  ground.replaceChildren(...segments);
  land.append(ground);
  // Draw only the exposed perimeter of the joined land; intersections stay open.
  const shore = document.createElement('canvas');
  shore.className = 'bridge-shore';
  const pixel = 3;
  const worldW = viewW * 2.4;
  const worldH = viewH * 6.5;
  shore.width = Math.ceil(worldW / pixel);
  shore.height = Math.ceil(worldH / pixel);
  const cols = shore.width, rows = shore.height;
  const cells = new Uint8Array(cols * rows);
  const ctx = shore.getContext('2d');
  for (let row = 0; row < rows; row++) {
    const depth = worldH * .96 - (row + .5) * pixel;
    for (let col = 0; col < cols; col++) {
      const px = (col + .5) * pixel;
      const sampleX = px + 9 * Math.sin(depth / 48 + px / 113) + 3 * Math.sin(depth / 19 - px / 67);
      const sampleDepth = depth + 7 * Math.sin(px / 54 + depth / 127);
      cells[row * cols + col] = bridgePathLayout.some(([l, r, lo, hi, kind]) => {
        const left = l * viewW, right = r * viewW;
        const low = lo * viewH, high = hi * viewH;
        if (sampleX < left || sampleX > right || sampleDepth < low || sampleDepth > high) return false;
        if (kind === 'island') {
          return ((sampleX - (left + right) / 2) / ((right - left) / 2)) ** 2 +
            ((sampleDepth - (low + high) / 2) / ((high - low) / 2)) ** 2 <= 1;
        }
        // Round the joined path's outside corners without changing its walkable layout.
        const radius = Math.min(38, (right - left) / 3, (high - low) / 2);
        const nearestX = Math.max(left + radius, Math.min(sampleX, right - radius));
        const nearestY = Math.max(low + radius, Math.min(sampleDepth, high - radius));
        return (sampleX - nearestX) ** 2 + (sampleDepth - nearestY) ** 2 <= radius ** 2;
      });
    }
  }
  // Carve the soil itself into a quiet, uneven shoreline, rather than adding a stripe.
  const originalCells = cells.slice();
  const originalSolid = (c, r) => c >= 0 && r >= 0 && c < cols && r < rows && originalCells[r * cols + c];
  const mask = document.createElement('canvas');
  mask.width = cols; mask.height = rows;
  const maskCtx = mask.getContext('2d');
  const maskPixels = maskCtx.createImageData(cols, rows);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const index = row * cols + col;
      if (!cells[index]) continue;
      const erosion = Math.max(2, Math.min(7, Math.floor(4.5 + 1.5 * Math.sin(col / 7.3 + row / 13.7) + 1.3 * Math.sin(row / 5.7 - col / 12.1))));
      for (let distance = 1; distance <= erosion; distance++) {
        if (!originalSolid(col - distance, row) || !originalSolid(col + distance, row) ||
          !originalSolid(col, row - distance) || !originalSolid(col, row + distance)) {
          cells[index] = 0;
          break;
        }
      }
      maskPixels.data[index * 4 + 3] = cells[index] ? 255 : 0;
    }
  }
  maskCtx.putImageData(maskPixels, 0, 0);
  ground.style.maskImage = `url(${mask.toDataURL()})`;
  bridgeWalkableMask = { cells, cols, rows, pixel, originDepth: worldH * .96 };
  const bankPlants = [];
  const planted = [];
  const bankNoise = (a, b) => { const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return n - Math.floor(n); };
  const solid = (col, row) => col >= 0 && row >= 0 && col < cols && row < rows && cells[row * cols + col];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (!solid(col, row)) continue;
      const edge = !solid(col - 1, row) || !solid(col + 1, row) || !solid(col, row - 1) || !solid(col, row + 1);
      if (!edge) continue;
      const seed = (col * 31 + row * 17) % 13;
      const exposedBottom = !solid(col, row + 1);
      // A broken, narrow contact edge keeps the soil texture visible.
      if (exposedBottom || seed < 5) {
        ctx.fillStyle = exposedBottom ? '#65503bbb' : '#78604577';
        ctx.fillRect(col, row, 1, 1);
      }
      const px = col * pixel, py = row * pixel;
      const patch = Math.sin(px / 79 + py / 137) + Math.cos(py / 91 - px / 163);
      const spacing = 85 + bankNoise(col, row) * 75;
      if (patch > -.3 && bankNoise(col + 7, row) < .12 &&
        !planted.some(([x, y]) => (x - px) ** 2 + (y - py) ** 2 < spacing ** 2)) {
        planted.push([px, py]);
        const count = 2 + Math.floor(bankNoise(col, row + 9) * 4);
        for (let tuft = 0; tuft < count; tuft++) {
          const variation = bankNoise(col + tuft * 11, row + 19);
          let rootX = px + (bankNoise(col + tuft, row + 31) - .5) * 56;
          let rootY = py + (bankNoise(col + 41, row + tuft) - .5) * 36;
          if (!solid(Math.floor(rootX / pixel), Math.floor(rootY / pixel))) {
            rootX = px; rootY = py;
          }
          const plant = document.createElement('i');
          plant.className = 'bridge-bank-plant';
          const size = 22 + variation * 29;
          plant.style.width = `${size * (.8 + bankNoise(col + tuft, row) * .35)}px`;
          plant.style.height = `${size}px`;
          plant.style.left = `${rootX - size / 2}px`;
          plant.style.top = `${rootY - size * .82}px`;
          plant.style.transformOrigin = '50% 82%';
          plant.style.transform = `rotate(${variation * 18 - 9}deg) scaleX(${tuft % 2 ? -1 : 1})`;
          plant.style.filter = `brightness(${.83 + variation * .15})`;
          bankPlants.push(plant);
        }
      }
    }
  }
  land.append(shore, ...bankPlants);
  bridgePathElement.replaceChildren(land, ...footprints, mud, log, postcard, refuge, family);
}

function toggleControlsGuide() {
  if (controlsGuide.open) {
    controlsGuide.close();
    return true;
  }
  if (gameHud.hidden || transitioning || gameMenu.open || mailComposer.open || !trainRide.hidden) return false;
  bridgeControls.hidden = currentPlace !== 'bridge';
  doubleJumpControls.hidden = !caveBellCollected;
  clawControls.hidden = currentPlace !== 'cave' || caveBellCollected;
  clearPlayerKeys();
  controlsGuide.showModal();
  return true;
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

function playLogPushSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  audioContext ||= new AudioContextClass();
  if (audioContext.state === 'suspended') audioContext.resume();
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(115, now);
  oscillator.frequency.exponentialRampToValueAtTime(65, now + .17);
  gain.gain.setValueAtTime(.0001, now);
  gain.gain.exponentialRampToValueAtTime(.09, now + .012);
  gain.gain.exponentialRampToValueAtTime(.0001, now + .22);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + .23);
}

function playMudSquelch() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  audioContext ||= new AudioContextClass();
  if (audioContext.state === 'suspended') audioContext.resume();
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(135, now);
  oscillator.frequency.exponentialRampToValueAtTime(58, now + .2);
  gain.gain.setValueAtTime(.0001, now);
  gain.gain.exponentialRampToValueAtTime(.045, now + .02);
  gain.gain.exponentialRampToValueAtTime(.0001, now + .24);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + .25);
}

function awakenBell() {
  const bellRect = caveBell.getBoundingClientRect();
  const worldRect = gameWorld.getBoundingClientRect();
  bellAwakening.style.left = `${(bellRect.left - worldRect.left + bellRect.width / 2) / camera.scale}px`;
  bellAwakening.style.top = `${(bellRect.top - worldRect.top + bellRect.height / 2) / camera.scale}px`;
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
    velocityY = currentPlace === 'bridge' ? 700 : 620;
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

function updateJump(dt) {
  if (grounded) return;
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

function collectCaveBell() {
  if (caveBellCollected) return;
  awakenBell();
  caveBellCollected = true;
  saveAfterMilestone();
  scene.classList.add('cave-bell-collected');
  game.classList.add('cave-return');
  caveClaw.hidden = true;
  clearSootDamage();
  startDialogue([
    ['Kuro', 'Está cubierto de hollín… pero todavía es un cascabel.'],
    ['Kuro', '¡Sonó! Siento las patas mucho más ligeras…'],
    ['Nuevo movimiento', 'Doble salto desbloqueado · Vuelve a saltar mientras estás en el aire.']
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
  goatX = Math.max(40, stageWidth * .24);
  goatActive = false;
  goatChaseComplete = false;
  goatLastHitAt = 0;
  goatClawRecoilUntil = 0;
  goatClawRecoilDirection = -1;
  sootGoat.classList.remove('active', 'claw-hit');
  sootGoat.style.left = `${goatX}px`;
  sootGoat.style.setProperty('--goat-y', '0px');
  setGridFrame(sootGoat, 0, 3, 2);
}

function updateGoatChase(time, dt) {
  if (currentPlace !== 'cave') {
    sootGoat.classList.remove('active', 'looking-left');
    return;
  }
  if (caveBellCollected) {
    goatActive = false;
    goatX = stageWidth * 3;
    sootGoat.classList.add('active');
    sootGoat.classList.toggle('looking-left', x + 50 < goatX + 99);
    sootGoat.style.left = `${goatX}px`;
    sootGoat.style.setProperty('--goat-y', '0px');
    return;
  }
  sootGoat.classList.remove('looking-left');

  const chaseStart = stageWidth * 2.62;
  const chaseEnd = stageWidth * 3.75;
  if (!goatActive && !goatChaseComplete && x >= chaseStart && x < chaseEnd) {
    goatActive = true;
    goatX = Math.max(35, x - stageWidth * .34);
    sootGoat.classList.add('active');
  }
  if (!goatActive) return;

  const controlsEnabled = dialogue.hidden && travelAlbum.hidden && photoMoment.hidden && worldMap.hidden && !autoEscapingCave;
  const goatIsClawRecoiling = time < goatClawRecoilUntil;
  if (controlsEnabled) {
    if (goatIsClawRecoiling) {
      goatX += goatClawRecoilDirection * 92 * dt;
    } else {
      const targetX = x - 46;
      const chaseSpeed = x > goatX ? 302 : 220;
      goatX += Math.max(-chaseSpeed * dt, Math.min(chaseSpeed * dt, targetX - goatX));
    }
  }
  const frameIndex = Math.floor(time / 105) % 6;
  const goatLift = frameIndex === 3 ? 18 : frameIndex === 4 ? 38 : frameIndex === 5 ? 14 : 0;
  setGridFrame(sootGoat, frameIndex, 3, 2);
  sootGoat.style.left = `${goatX}px`;
  sootGoat.style.setProperty('--goat-y', `${goatLift}px`);

  const goatDeltaFromKuro = goatX + 66 - (x + 50);
  const goatWithinClaw = facing > 0
    ? goatDeltaFromKuro >= -10 && goatDeltaFromKuro <= 124
    : goatDeltaFromKuro <= 10 && goatDeltaFromKuro >= -124;
  let goatWasClawed = false;
  if (controlsEnabled && time < clawUntil && !goatIsClawRecoiling && goatWithinClaw && y < 58) {
    goatWasClawed = true;
    goatClawRecoilDirection = -1;
    goatX -= 64;
    goatClawRecoilUntil = time + 5000;
    sootGoat.classList.add('claw-hit');
    setTimeout(() => sootGoat.classList.remove('claw-hit'), 230);
  }

  const touchesKuro = Math.abs(x + 45 - (goatX + 66)) < 58 && y < 54;
  if (!goatWasClawed && touchesKuro && time - goatLastHitAt > 1200) {
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

function resetPackChase() {
  dogX = stageWidth * .96;
  birdX = stageWidth * .60;
  packActive = false;
  packChaseComplete = false;
  packStartedAt = 0;
  dogLastHitAt = 0;
  dogRecoilUntil = 0;
  dogRecoilDirection = -1;
  dogRecoilSpeed = 235;
  birdLastHitAt = 0;
  birdRecoilUntil = 0;
  birdClawRecoilUntil = 0;
  birdClawRecoilDirection = -1;
  nextDogShotAt = 0;
  dogSpittingUntil = 0;
  resetDogProjectile();
  sootDog.classList.remove('chasing', 'spitting', 'claw-hit', 'passed');
  sootBird.classList.remove('chasing', 'claw-hit', 'passed');
  sootDog.style.left = `${dogX}px`;
  sootDog.style.removeProperty('bottom');
  sootDog.style.setProperty('--dog-y', '0px');
  sootDog.style.setProperty('--dog-facing', '1');
  sootBird.style.left = `${birdX}px`;
  sootBird.style.removeProperty('bottom');
  sootBird.style.setProperty('--bird-facing', '1');
  setGridFrame(sootDog, 0, 2, 2);
  setGridFrame(sootBird, 0, 2, 2);
}

function resetDogProjectile() {
  dogProjectileActive = false;
  dogProjectile.hidden = true;
  dogProjectileBounces = 0;
  dogProjectileDeflected = false;
}

function launchDogProjectile() {
  const caveFloor = stageHeight * .14;
  const dogFacing = x + 50 >= dogX + 83 ? 1 : -1;
  dogProjectileActive = true;
  dogProjectileX = dogX + (dogFacing > 0 ? 112 : 8);
  dogProjectileY = caveFloor + 68;
  dogProjectileVelocityX = dogFacing * 420;
  dogProjectileVelocityY = 95;
  dogProjectileBounces = 0;
  dogProjectileSpin = 0;
  dogProjectileDeflected = false;
  dogProjectile.hidden = false;
}

function updateDogProjectile(time, dt) {
  if (!dogProjectileActive) return;
  if (currentPlace !== 'cave' || caveBellCollected || autoEscapingCave) {
    resetDogProjectile();
    return;
  }

  const caveFloor = stageHeight * .14;
  dogProjectileVelocityY -= 650 * dt;
  dogProjectileX += dogProjectileVelocityX * dt;
  dogProjectileY += dogProjectileVelocityY * dt;
  dogProjectileSpin += 610 * dt * Math.sign(dogProjectileVelocityX || 1);

  const projectileCenterX = dogProjectileX + 22;
  const projectileCenterY = dogProjectileY + 22;
  const kuroCenterX = x + 50;
  const kuroFeetY = caveFloor + y;
  const deltaX = projectileCenterX - kuroCenterX;
  const withinSwipeHeight = projectileCenterY >= kuroFeetY + 4 && projectileCenterY <= kuroFeetY + 120;
  const inFrontOfKuro = facing > 0 ? deltaX >= -12 && deltaX <= 132 : deltaX <= 12 && deltaX >= -132;

  if (!dogProjectileDeflected && time < clawUntil && withinSwipeHeight && inFrontOfKuro) {
    dogProjectileDeflected = true;
    dogProjectileVelocityX = facing * 470;
    dogProjectileVelocityY = Math.max(270, Math.abs(dogProjectileVelocityY) * .55);
    dogProjectileBounces = 0;
  }

  const touchesKuro = Math.abs(deltaX) <= 48 && projectileCenterY >= kuroFeetY + 4 && projectileCenterY <= kuroFeetY + 108;
  if (!dogProjectileDeflected && touchesKuro) {
    resetDogProjectile();
    registerSootHit(time);
    return;
  }

  const touchesDog = dogProjectileDeflected && Math.abs(projectileCenterX - (dogX + 83)) <= 56 && projectileCenterY <= caveFloor + 128;
  if (touchesDog) {
    resetDogProjectile();
    dogRecoilUntil = time + 520;
    return;
  }

  if (dogProjectileY <= caveFloor) {
    if (dogProjectileBounces === 0) {
      dogProjectileY = caveFloor;
      dogProjectileVelocityY = 310;
      dogProjectileVelocityX *= .84;
      dogProjectileBounces = 1;
    } else {
      resetDogProjectile();
      return;
    }
  }

  if (dogProjectileX < -60 || dogProjectileX > stageWidth * 6 + 60) {
    resetDogProjectile();
    return;
  }
  dogProjectile.style.left = `${dogProjectileX}px`;
  dogProjectile.style.bottom = `${dogProjectileY}px`;
  dogProjectile.style.setProperty('--dog-soot-spin', `${dogProjectileSpin}deg`);
}

function updatePackChase(time, dt) {
  if (currentPlace !== 'cave') {
    sootDog.classList.remove('chasing');
    sootBird.classList.remove('chasing');
    return;
  }
  if (caveBellCollected) {
    if (packActive || packChaseComplete) resetPackChase();
    const restingDogEyeX = sootDog.offsetLeft + sootDog.offsetWidth * .87;
    const dogEyeOffset = Math.max(-2, Math.min(2, (x + 50 - restingDogEyeX) / 95 * 2));
    sootDog.style.setProperty('--dog-eye-x', `${dogEyeOffset.toFixed(1)}px`);
    return;
  }

  const chaseStart = stageWidth * .72;
  const chaseEnd = stageWidth * 2.15;
  if (!packActive && !packChaseComplete && x >= chaseStart && x < chaseEnd) {
    packActive = true;
    packStartedAt = time;
    nextDogShotAt = time + 1300;
    dogX = stageWidth * .96;
    birdX = stageWidth * .60;
    sootDog.classList.add('chasing');
    sootBird.classList.add('chasing');
  }
  if (!packActive) return;

  const controlsEnabled = dialogue.hidden && travelAlbum.hidden && photoMoment.hidden && worldMap.hidden && !autoEscapingCave;
  const dogIsSpitting = time < dogSpittingUntil;
  const dogIsRecoiling = time < dogRecoilUntil;
  const birdIsRecoiling = time < birdRecoilUntil;
  const birdIsClawRecoiling = time < birdClawRecoilUntil;
  if (controlsEnabled) {
    if (dogIsRecoiling) dogX += dogRecoilDirection * dogRecoilSpeed * dt;
    else if (!dogIsSpitting) {
      const dogTargetX = x - 48;
      const dogSpeed = dogTargetX > dogX ? 270 : 205;
      dogX += Math.max(-dogSpeed * dt, Math.min(dogSpeed * dt, dogTargetX - dogX));
    }

    const diveProgress = ((time - packStartedAt) % 2300) / 2300;
    const diveAmount = diveProgress < .48 ? 0 : Math.sin(Math.min(1, (diveProgress - .48) / .52) * Math.PI);
    const birdTargetX = x - 280 + diveAmount * 45;
    if (birdIsClawRecoiling) birdX += birdClawRecoilDirection * 105 * dt;
    else if (birdIsRecoiling) birdX -= 205 * dt;
    else {
      const birdSpeed = birdTargetX > birdX ? 292 : 235;
      birdX += Math.max(-birdSpeed * dt, Math.min(birdSpeed * dt, birdTargetX - birdX));
    }
  }

  const dogDistance = Math.abs(x + 50 - (dogX + 83));
  if (controlsEnabled && !dogProjectileActive && !dogIsSpitting && !dogIsRecoiling && time >= nextDogShotAt && dogDistance >= 135 && dogDistance <= 560) {
    dogSpittingUntil = time + 270;
    nextDogShotAt = time + 2350;
    sootDog.classList.add('spitting');
    launchDogProjectile();
  }

  const currentlySpitting = time < dogSpittingUntil;
  sootDog.classList.toggle('spitting', currentlySpitting);
  const dogFrame = Math.floor(time / 110) % 6;
  const dogLift = dogFrame === 3 ? 24 : dogFrame === 4 ? 38 : dogFrame === 5 ? 10 : 0;
  if (currentlySpitting) setGridFrame(sootDog, 2, 2, 2);
  else setGridFrame(sootDog, dogFrame, 3, 2);
  sootDog.style.left = `${dogX}px`;
  sootDog.style.setProperty('--dog-y', `${dogLift}px`);
  sootDog.style.setProperty('--dog-facing', x >= dogX ? '1' : '-1');

  const dogDeltaFromKuro = dogX + 83 - (x + 50);
  const dogWithinClaw = facing > 0
    ? dogDeltaFromKuro >= -12 && dogDeltaFromKuro <= 126
    : dogDeltaFromKuro <= 12 && dogDeltaFromKuro >= -126;
  let dogWasClawed = false;
  if (controlsEnabled && time < clawUntil && !dogIsRecoiling && dogWithinClaw && y < 58) {
    dogWasClawed = true;
    dogRecoilDirection = -1;
    dogRecoilSpeed = 110;
    dogX -= 68;
    dogRecoilUntil = time + 5000;
    dogSpittingUntil = 0;
    nextDogShotAt = Math.max(nextDogShotAt, time + 950);
    sootDog.classList.remove('spitting');
    sootDog.classList.add('claw-hit');
    setTimeout(() => sootDog.classList.remove('claw-hit'), 230);
  }

  const caveFloor = stageHeight * .14;
  const diveProgress = ((time - packStartedAt) % 2300) / 2300;
  const diveAmount = diveProgress < .48 ? 0 : Math.sin(Math.min(1, (diveProgress - .48) / .52) * Math.PI);
  const perchedBirdBottom = stageHeight * .148 + 63;
  const flyingBirdBottom = caveFloor + 142 - diveAmount * 94 + Math.sin(time / 190) * 5 + (birdIsClawRecoiling ? 24 : birdIsRecoiling ? 34 : 0);
  const takeoffProgress = Math.min(1, (time - packStartedAt) / 420);
  const takeoffEase = 1 - Math.pow(1 - takeoffProgress, 3);
  const birdBottom = perchedBirdBottom + (flyingBirdBottom - perchedBirdBottom) * takeoffEase;
  setGridFrame(sootBird, Math.floor(time / 145) % 4, 2, 2);
  sootBird.style.left = `${birdX}px`;
  sootBird.style.bottom = `${birdBottom}px`;
  sootBird.style.setProperty('--bird-facing', x >= birdX ? '1' : '-1');

  const dogTouchesKuro = Math.abs(x + 50 - (dogX + 83)) < 76 && y < 52;
  if (!dogWasClawed && dogTouchesKuro && time - dogLastHitAt > 1200) {
    dogLastHitAt = time;
    dogRecoilDirection = dogX < x ? -1 : 1;
    dogRecoilSpeed = 235;
    dogRecoilUntil = time + 460;
    registerSootHit(time);
  }
  const birdCenterY = birdBottom + 50;
  const kuroFeetY = caveFloor + y;
  const birdDeltaFromKuro = birdX + 75 - (x + 50);
  const birdWithinClawX = facing > 0
    ? birdDeltaFromKuro >= -12 && birdDeltaFromKuro <= 132
    : birdDeltaFromKuro <= 12 && birdDeltaFromKuro >= -132;
  const birdWithinClawY = birdCenterY >= kuroFeetY + 18 && birdCenterY <= kuroFeetY + 142;
  let birdWasClawed = false;
  if (controlsEnabled && time < clawUntil && !birdIsClawRecoiling && birdWithinClawX && birdWithinClawY) {
    birdWasClawed = true;
    birdClawRecoilDirection = -1;
    birdX -= 72;
    birdClawRecoilUntil = time + 5000;
    sootBird.classList.add('claw-hit');
    setTimeout(() => sootBird.classList.remove('claw-hit'), 230);
  }
  const birdTouchesKuro = Math.abs(x + 50 - (birdX + 75)) < 70 && birdCenterY >= kuroFeetY + 24 && birdCenterY <= kuroFeetY + 112;
  if (!birdWasClawed && birdTouchesKuro && time - birdLastHitAt > 1200) {
    birdLastHitAt = time;
    birdRecoilUntil = time + 520;
    registerSootHit(time);
  }

  if (x >= chaseEnd) {
    packActive = false;
    packChaseComplete = true;
    sootDog.classList.remove('chasing', 'spitting');
    sootBird.classList.remove('chasing');
    sootDog.classList.add('passed');
    sootBird.classList.add('passed');
    resetDogProjectile();
  }
}

function launchSootProjectile() {
  const seaLionX = stageWidth * 6 * 0.775;
  const caveFloor = stageHeight * 0.14;
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

function updateHudHealth(remaining) {
  hudHearts.forEach((heart, index) => heart.toggleAttribute('data-empty', index >= remaining));
  const value = `${remaining}/${sootHitLimit}`;
  if (healthValue.textContent !== value) healthValue.textContent = value;
}

function clearSootDamage() {
  sootHitCount = 0;
  updateSootLevel();
  updateHudHealth(sootHitLimit);
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
  updateHudHealth(sootHitLimit - sootHitCount);
  if (sootHitCount < sootHitLimit) return;
  sootHitCount = 0;
  updateSootLevel();
  x = 185;
  camera.jumpTo(0, 0, worldWidthFor(currentPlace));
  renderCamera();
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
  const seaLionX = stageWidth * 6 * 0.775;
  const seaLionCenterX = seaLionX + 68;
  const revealedSeaLionCenterX = seaLionX + 87.5;
  sootSeaLion.classList.toggle('looking-left', currentPlace === 'cave' && caveBellCollected && x + 50 < revealedSeaLionCenterX);
  seaLionFacing = x + 50 < seaLionCenterX ? -1 : 1;
  sootSeaLion.style.setProperty('--sea-lion-facing', seaLionFacing);
  const kuroIsClose = Math.abs(x + 50 - seaLionCenterX) <= stageWidth * 0.82;

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
  const caveFloor = stageHeight * 0.14;
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

  if (sootProjectileX < -40 || sootProjectileX > stageWidth * 6 + 40) {
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
  valdivia: ['Sur verde', 'Valdivia', 'Disponible · Costanera', '🚂', 'La lluvia, el río y un nuevo vecino esperan a Kuro en la costanera.'],
  santiago: ['Zona central', 'Santiago', '', '★', ''],
  cordillera: ['Destino final', 'Cordillera', 'Bloqueado · completa las demás zonas', '🔒', 'La gran subida final se abrirá después de conocer el resto de Chile.'],
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
  ['Tizne', 'Volviste… y tienes el cascabel.', 'neutral'],
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
  },
  'Doña Bruma': {
    neutral: 'assets/dona-bruma-dialogue-frames-v1.png'
  },
  Copo: {
    neutral: 'assets/copo-dialogue-v2.png'
  }
};
const npcPortraits = {
  Mota: portraitSheets.Mota.neutral,
  Tizne: portraitSheets.Tizne.neutral,
  'Doña Bruma': portraitSheets['Doña Bruma'].neutral,
  Copo: portraitSheets.Copo.neutral
};

const portraitEmotionState = {
  Kuro: 'neutral',
  Mota: 'neutral',
  Tizne: 'neutral',
  'Doña Bruma': 'neutral'
};

function portraitEmotion(character, speaker, speakerEmotion) {
  if (character === speaker && portraitEmotionState[character] !== undefined) {
    portraitEmotionState[character] = speakerEmotion || 'neutral';
  }
  return portraitEmotionState[character] || 'neutral';
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
  else if (speaker === 'Doña Bruma') dialogueName.classList.add('bruma-speaker');
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

function startDialogue(lines, onComplete = null, initialPortraitEmotions = null) {
  hideDialogueChoices();
  Object.assign(portraitEmotionState, {
    Kuro: 'neutral',
    Mota: 'neutral',
    Tizne: 'neutral',
    'Doña Bruma': 'neutral'
  }, initialPortraitEmotions || {});
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
    if (selected && focus) button.focus();
  });
}

function showTizneChoice() {
  clearInterval(typingTimer);
  dialogue.hidden = false;
  dialogueLines = [['Tizne', '', 'remorseful'], ['Kuro', '', 'annoyed']];
  dialogueOnComplete = null;
  portraitEmotionState.Kuro = 'annoyed';
  portraitEmotionState.Tizne = 'remorseful';
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
  saveAfterMilestone();
  scene.classList.add('valparaiso-complete');
  renderAlbum();
  startDialogue([
    ['Kuro', response.line, 'annoyed'],
    ['Tizne', response.reply, 'remorseful'],
    ['Tizne', 'El cascabel pertenece a Doña Bruma. Guiaba a los gatitos del barrio cuando bajaba la neblina.', 'remorseful'],
    ['Kuro', brumaBellReturned ? 'Ya se lo devolví. Ella me contó por qué era importante.' : 'Entonces debería devolvérselo.', 'annoyed'],
    ['Álbum de Viaje', 'Nueva postal: Al volver de la Cueva del Chivato.']
  ], null, { Kuro: 'annoyed', Tizne: 'remorseful' });
}

function handleDialogueKeyDown(event, pressedKey) {
  if (!dialogueChoiceActive) {
    if (pressedKey === 'escape') closeDialogue();
    else if (!event.repeat && (pressedKey === 'e' || pressedKey === 'enter')) advanceDialogue();
    return;
  }

  if (pressedKey === 'escape') closeDialogue();
  else if (!event.repeat) {
    if (pressedKey === 'arrowup' || pressedKey === 'w') selectTizneChoice(selectedTizneChoice - 1, true);
    else if (pressedKey === 'arrowdown' || pressedKey === 's') selectTizneChoice(selectedTizneChoice + 1, true);
    else if (['1', '2', '3'].includes(pressedKey)) confirmTizneChoice(dialogueChoiceButtons[Number(pressedKey) - 1]?.dataset.tizneChoice);
    else if (pressedKey === 'e' || pressedKey === 'enter' || event.code === 'Space') confirmTizneChoice();
  }
  event.preventDefault();
}

dialogueChoiceButtons.forEach((button, index) => {
  button.addEventListener('pointerenter', () => selectTizneChoice(index));
  button.addEventListener('click', () => confirmTizneChoice(button.dataset.tizneChoice));
});

function startTizneReturnConversation() {
  startDialogue(brumaBellReturned ? [
    ['Tizne', 'Volviste… ¿encontraste el cascabel?', 'neutral'],
    ['Kuro', 'Sí. Ya se lo devolví a Doña Bruma. Ella me contó a quién pertenecía.', 'annoyed'],
    ['Tizne', 'Pensé que si te decía la verdad, no ibas a ayudarme.', 'remorseful'],
    ['Kuro', 'Entonces no era de tu familia.', 'annoyed'],
    ['Tizne', 'No. Un coleccionista paga bien por cosas antiguas. Yo… necesitaba una salida.', 'remorseful']
  ] : tizneReturnConversation, showTizneChoice);
}

function talkToBruma() {
  if (brumaBellReturned) {
    startDialogue([
      ['Doña Bruma', 'Cuánta nostalgia… Cuando vuelva la neblina, podré hacerlo sonar otra vez.'],
      ['Kuro', 'Todavía siento su impulso en mis patitas.']
    ]);
  } else if (caveBellCollected) {
    const reunion = brumaMet ? [
      ['Doña Bruma', 'Volviste… Ese cascabel que llevas, ¿lo encontraste en la cueva?'],
      ['Kuro', 'Sí. Perdón por llevármelo. Vine a devolvérselo.'],
      ['Doña Bruma', 'Lo creía perdido. Solía hacerlo sonar para que los gatitos encontraran el camino entre la neblina.'],
      ['Doña Bruma', '¿Cómo te llamas, pequeño viajero?'],
      ['Kuro', 'Kuro.'],
      ['Doña Bruma', 'Gracias, Kuro. El cascabel vuelve conmigo, pero el impulso que te dio se quedará contigo.']
    ] : [
      ['Doña Bruma', 'Espera… Ese cascabel que llevas, ¿dónde lo encontraste?'],
      ['Kuro', 'En la cueva. Perdón, no sabía que era suyo. Se lo devuelvo.'],
      ['Doña Bruma', 'Gracias. Soy Bruma. Solía hacerlo sonar para que los gatitos encontraran el camino entre la neblina.'],
      ['Kuro', 'Yo soy Kuro. Me ayudó a salir de allí.'],
      ['Doña Bruma', 'Me alegra. El cascabel vuelve conmigo, pero el impulso que te dio se quedará contigo.']
    ];
    startDialogue(reunion, () => {
      brumaMet = true;
      brumaBellReturned = true;
      saveAfterMilestone();
      dialogue.hidden = true;
    });
  } else {
    startDialogue([
      ['Doña Bruma', 'Soy Bruma. Antes guiaba a los gatitos de estos cerros con el sonido de mi cascabel.'],
      ['Doña Bruma', 'Se perdió en la cueva, más arriba. Si entras, ve con cuidado.'],
      ['Kuro', 'Si lo encuentro, se lo traeré.']
    ], () => {
      brumaMet = true;
      saveAfterMilestone();
      dialogue.hidden = true;
    });
  }
}

function albumProgress() {
  return { whalePostcardCollected, quintaPhotoCollected, tizneResponse, bridgePostcardCollected, valdiviaFamilyHelped };
}

function unlockedAlbumPages(progress = albumProgress()) {
  const pages = [];
  if (progress.whalePostcardCollected) pages.push({ element: whaleAlbumPage, number: 'Santiago · 01' });
  if (progress.quintaPhotoCollected) pages.push({ element: quintaPhotoPage, number: 'Santiago · 02' });
  if (progress.tizneResponse) pages.push({ element: valparaisoAlbumPage, number: 'Valparaíso · 01' });
  if (progress.bridgePostcardCollected) pages.push({ element: bridgeAlbumPage, number: 'Valdivia · ★' });
  if (progress.valdiviaFamilyHelped) pages.push({ element: valdiviaAlbumPage, number: 'Valdivia · 01' });
  return pages;
}

function renderAlbum(focusPage = null) {
  const pages = unlockedAlbumPages();
  if (focusPage) {
    const focusedIndex = pages.findIndex(({ element }) => element === focusPage);
    if (focusedIndex !== -1) albumPageIndex = focusedIndex;
  }
  albumPageIndex = Math.max(0, Math.min(albumPageIndex, pages.length - 1));
  albumEmpty.hidden = pages.length > 0;
  whaleAlbumPage.hidden = true;
  quintaPhotoPage.hidden = true;
  valparaisoAlbumPage.hidden = true;
  valdiviaAlbumPage.hidden = true;
  bridgeAlbumPage.hidden = true;
  if (tizneResponse) valparaisoPostscript.textContent = tizneResponses[tizneResponse].postscript;
  albumPrev.hidden = pages.length < 2;
  albumNext.hidden = pages.length < 2;
  if (pages.length) {
    pages[albumPageIndex].element.hidden = false;
    albumPageNumber.textContent = `${pages[albumPageIndex].number} · ${albumPageIndex + 1}/${pages.length}`;
  } else {
    albumPageNumber.textContent = '';
  }
}

function copyAlbumLeaf(page, side) {
  const leaf = document.createElement('div');
  leaf.className = 'album-leaf-content';
  leaf.dataset.side = side;
  const content = page.querySelector(side === 'left' ? '.album-photo-frame' : '.album-caption').cloneNode(true);
  content.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
  leaf.append(content);
  return leaf;
}

function changeAlbumPage(direction) {
  const pages = unlockedAlbumPages();
  if (pages.length < 2 || albumTurnFrame !== null) return;
  const nextPageIndex = (albumPageIndex + direction + pages.length) % pages.length;
  const showNextPage = () => {
    albumPageIndex = nextPageIndex;
    renderAlbum();
  };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    showNextPage();
    return;
  }

  const sourceSide = direction > 0 ? 'right' : 'left';
  const destinationSide = direction > 0 ? 'left' : 'right';
  const outgoingPage = pages[albumPageIndex].element;
  const arrivingPage = pages[nextPageIndex].element;
  const front = copyAlbumLeaf(outgoingPage, sourceSide);
  const back = copyAlbumLeaf(arrivingPage, destinationSide);
  albumTurnReveal.dataset.side = sourceSide;
  albumTurnReveal.replaceChildren(copyAlbumLeaf(arrivingPage, sourceSide));
  albumTurnReveal.hidden = false;
  albumTurnSheet.hidden = false;

  const width = albumTurnSheet.offsetWidth;
  const stripCount = 24;
  const step = width / stripCount;
  const fragment = document.createDocumentFragment();
  const strips = Array.from({ length: stripCount }, (_, index) => {
    const strip = document.createElement('div');
    strip.className = 'album-turn-strip';
    strip.style.width = `${step + .65}px`;
    strip.style.setProperty('--leaf-width', `${width}px`);
    const frontOffset = direction > 0 ? index * step : width - (index + 1) * step;
    for (const [face, template, offset] of [
      ['front', front, frontOffset], ['back', back, width - frontOffset - step]
    ]) {
      const wrapper = document.createElement('div');
      wrapper.className = `album-turn-face album-turn-${face}`;
      wrapper.style.setProperty('--leaf-offset', `${offset}px`);
      wrapper.append(template.cloneNode(true));
      strip.append(wrapper);
    }
    fragment.append(strip);
    return strip;
  });
  albumTurnSheet.replaceChildren(fragment);

  // The arc runs from the fixed spine to the free edge without stretching the sheet.
  const start = performance.now();
  const duration = 640;
  function drawTurn(time) {
    const progress = Math.min(1, Math.max(0, (time - start) / duration));
    const sweep = Math.PI * progress ** 2 * (3 - 2 * progress);
    const bend = Math.sin(Math.PI * progress) * 1.9;
    const edgeLift = Math.sin(Math.PI * progress) * Math.min(13, width * .045);
    let x = 0;
    let depth = 0;
    strips.forEach((strip, index) => {
      const alongPage = (index + .5) / stripCount;
      const angle = Math.min(Math.PI, Math.max(0, sweep + bend * (alongPage - .34)));
      const nextX = x + step * Math.cos(angle);
      const nextDepth = depth + step * Math.sin(angle);
      const anchorX = direction > 0 ? x : -nextX;
      const anchorDepth = direction > 0 ? depth : nextDepth;
      const nearLift = -edgeLift * (index / stripCount) ** 1.5;
      const farLift = -edgeLift * ((index + 1) / stripCount) ** 1.5;
      const anchorLift = direction > 0 ? nearLift : farLift;
      const slope = Math.atan(direction * (farLift - nearLift) / step);
      strip.style.transform = `translate3d(${anchorX}px, ${anchorLift}px, ${anchorDepth}px) rotateY(${-direction * angle}rad) skewY(${slope}rad)`;
      strip.style.setProperty('--leaf-shadow', Math.sin(angle) * .21);
      x = nextX;
      depth = nextDepth;
    });
    if (progress < 1) {
      albumTurnFrame = requestAnimationFrame(drawTurn);
    } else {
      showNextPage();
      clearAlbumTurn();
    }
  }
  drawTurn(start);
}

function clearAlbumTurn() {
  cancelAnimationFrame(albumTurnFrame);
  albumTurnFrame = null;
  albumTurnSheet.hidden = true;
  albumTurnReveal.hidden = true;
  albumTurnSheet.replaceChildren();
  albumTurnReveal.replaceChildren();
}

function openAlbum(focusPage = null) {
  clearPlayerKeys();
  renderAlbum(focusPage);
  travelAlbum.hidden = false;
  albumClose.focus();
}

function closeAlbum() {
  clearAlbumTurn();
  travelAlbum.hidden = true;
  if (albumOpenedFromItems) {
    albumOpenedFromItems = false;
    gameMenu.showModal();
    openAlbumFromItems.focus();
  } else game.focus();
}

function handleAlbumKeyDown(event, pressedKey) {
  if (pressedKey === 'arrowleft' || pressedKey === 'arrowright') {
    event.preventDefault();
    if (!event.repeat) changeAlbumPage(pressedKey === 'arrowleft' ? -1 : 1);
  } else if (!event.repeat && (pressedKey === 'escape' || pressedKey === 'e' ||
    (pressedKey === 'enter' && !travelAlbum.contains(event.target)))) {
    closeAlbum();
  }
}

function takeQuintaPhoto() {
  clearPlayerKeys();
  quintaPhotoCollected = true;
  saveAfterMilestone();
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

function alignFirstLetter() {
  if (!mailComposer.open) return;
  const bounds = game.getBoundingClientRect();
  const layout = getComputedStyle(document.body);
  const availableTop = parseFloat(layout.paddingTop) + 8;
  const availableBottom = document.documentElement.clientHeight - parseFloat(layout.paddingBottom) - 8;
  const top = Math.max(availableTop, Math.min(bounds.top, availableBottom - 248));
  const height = Math.min(Math.max(bounds.height, 352), availableBottom - top);
  Object.assign(mailComposer.style, {
    left: `${bounds.left}px`,
    top: `${top}px`,
    width: `${bounds.width}px`,
    height: `${height}px`
  });
  const paper = mailPaperPosition.getBoundingClientRect();
  const slot = letterSlot.getBoundingClientRect();
  mailPaper.style.setProperty('--mail-x', `${slot.left + slot.width / 2 - (paper.left + paper.width / 2)}px`);
  mailPaper.style.setProperty('--mail-y', `${slot.top + slot.height / 2 - (paper.top + paper.height / 2)}px`);
  mailPaper.style.setProperty('--mail-scale', Math.min(.36, slot.width * .9 / paper.width));
}

function openFirstLetter() {
  const keepsakes = [
    whalePostcardCollected && 'una postal de la ballena',
    quintaPhotoCollected && 'una foto de Quinta Normal'
  ].filter(Boolean);
  mailPostscript.textContent = keepsakes.length ? `P. D. Te mando ${keepsakes.join(' y ')}.` : '';
  mailPostscript.hidden = !keepsakes.length;
  mailPostcard.hidden = !whalePostcardCollected;
  mailPhoto.hidden = !quintaPhotoCollected;
  mailAttachments.hidden = !keepsakes.length;
  clearPlayerKeys();
  mailComposer.showModal();
  alignFirstLetter();
  mailSend.focus();
}

function closeFirstLetter() {
  mailComposer.close();
  mailPaper.classList.remove('is-stamped', 'is-mailing');
  mailFolds.replaceChildren();
  mailClose.hidden = false;
  game.focus();
}

mailClose.addEventListener('click', closeFirstLetter);
mailComposer.addEventListener('cancel', event => {
  event.preventDefault();
  if (!mailPaper.classList.contains('is-stamped')) closeFirstLetter();
});
mailSend.addEventListener('click', () => {
  if (mailPaper.classList.contains('is-stamped')) return;
  mailClose.hidden = true;
  mailPaper.classList.add('is-stamped');
});
mailPaper.addEventListener('animationend', event => {
  if (event.target === mailImprint && event.animationName === 'mail-stamp') {
    for (let index = 0; index < 3; index++) {
      const flap = document.createElement('div');
      flap.className = 'mail-flap';
      const front = document.createElement('div');
      front.className = 'mail-fold-face';
      front.append(mailCopy.cloneNode(true));
      flap.append(front);
      if (index !== 1) {
        const back = document.createElement('div');
        back.className = 'mail-fold-face mail-fold-back';
        flap.append(back);
      }
      mailFolds.append(flap);
    }
    alignFirstLetter();
    mailPaper.classList.add('is-mailing');
  }
  if (event.target === mailPaper && event.animationName === 'mail-flight') {
    firstLetterSent = true;
    scene.classList.add('letter-sent');
    saveAfterMilestone();
    closeFirstLetter();
    startDialogue([['Estafeta Gatuna', 'Carta enviada a la abuelita.']]);
  }
});

function fitGameViewport() {
  const bounds = game.getBoundingClientRect();
  camera.resize(bounds.width, bounds.height, worldWidthFor(currentPlace), x + 50);
  gameWorld.style.setProperty('--camera-width', `${camera.viewWidth}px`);
  gameWorld.style.setProperty('--world-scale', camera.scale);
  game.style.setProperty('--view-width', `${bounds.width}px`);
  game.style.setProperty('--hud-bottom', `${gameHud.getBoundingClientRect().bottom}px`);
  renderCamera();
  alignFirstLetter();
}

function updateMapDetails(zoneId) {
  worldMap.dataset.zone = zoneId;
  const [stamp, title, status, icon, description] = mapZoneDetails[zoneId];
  const isSantiago = zoneId === 'santiago';
  const canTravel = !mapOpenedFromMenu || Boolean(activeSave);
  mapZoneStamp.textContent = stamp;
  mapZoneTitle.textContent = title;
  santiagoMapStatus.textContent = isSantiago
    ? !canTravel ? 'Barrio Yungay, Quinta Normal y Estación Mapocho' : firstLetterSent
      ? 'Recorrido completado · carta enviada'
      : 'Recorrido completado · carta pendiente'
    : status;
  localMapNodes.hidden = !isSantiago || !canTravel;
  nextDestination.hidden = !isSantiago || !canTravel;
  mapZoneMessage.hidden = isSantiago;
  mapZoneIcon.textContent = icon;
  mapZoneDescription.textContent = description;
  mapZoneTravel.hidden = !canTravel || !['valparaiso', 'valdivia'].includes(zoneId);
  mapZoneTravel.textContent = zoneId === 'valdivia' ? 'Viajar a Valdivia' : 'Viajar a Estación Puerto';
  const nextZone = tizneResponse ? 'valdivia' : 'valparaiso';
  nextDestination.querySelector('strong').textContent = nextZone === 'valdivia' ? 'Valdivia' : 'Valparaíso';
  nextDestination.querySelector('small').textContent = nextZone === 'valdivia' ? 'El sur ya te espera' : 'El tren ya está listo';
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
    if (selected && focusNode) node.focus();
  });
  updateMapDetails(zoneId);
}

function moveMapSelection(direction) {
  const current = mapZoneNodes.find((node) => node.dataset.mapZone === selectedMapZone);
  if (!current) return;
  const isGrid = getComputedStyle(current.parentElement).display === 'grid';
  const mapX = (node) => isGrid ? node.offsetLeft : Number(node.dataset.mapX);
  const mapY = (node) => isGrid ? node.offsetTop : Number(node.dataset.mapY);
  const currentX = mapX(current);
  const currentY = mapY(current);
  const candidates = mapZoneNodes
    .filter((node) => node !== current)
    .map((node) => {
      const dx = mapX(node) - currentX;
      const dy = mapY(node) - currentY;
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
    if (selected) button.focus();
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

let trainRideArtwork;

function preloadTrainImages(paths) {
  return Promise.allSettled(paths.map(path => {
    const image = new Image();
    image.src = path;
    return image.decode?.();
  }));
}

function prepareTrainRide() {
  trainRideArtwork ??= preloadTrainImages([
    'assets/kuro-vagon-mapochovalpo-v1.webp',
    'assets/kuro-paisaje-tren-v1.webp',
    'assets/kuro-lomas-costa-tren-v1.webp',
    'assets/kuro-cerros-antes-del-puerto-v1.webp',
    'assets/kuro-costanera-antes-de-estacion-v1.webp',
    'assets/kuro-poste-ferroviario-v1.webp'
  ]).then(results => {
    if (results.some(result => result.status === 'rejected')) trainRideArtwork = null;
  });
}

async function rideByTrain(destination) {
  if (!trainRide.hidden || transitioning) return;
  const returning = destination === 'station';
  prepareTrainRide();
  clearPlayerKeys();
  trainRide.classList.toggle('is-returning', returning);
  trainRide.setAttribute('aria-label', `Kuro mira por la ventana del tren a ${returning ? 'Santiago' : 'Valparaíso'}`);
  trainRide.hidden = false;
  updateHudLocation();
  trainWheels.currentTime = 0;
  trainWheels.play().catch(() => {});

  const destinationReady = new Promise(resolve => {
    const timeout = setTimeout(resolve, 8000);
    const images = returning
      ? ['assets/estacion-mapocho-unificada-v1.png', 'assets/estafeta-gatuna-frontal-v2.png']
      : ['assets/valparaiso-continuo-pixel-v1.png', 'assets/valparaiso-cerro-cueva-pixel-v1.png'];
    preloadTrainImages(images).then(() => {
      clearTimeout(timeout);
      resolve();
    });
  });
  await Promise.all([destinationReady, new Promise(resolve => setTimeout(resolve, 4430))]);
  trainRide.classList.add('is-arriving');
  await new Promise(resolve => setTimeout(resolve, 1000));

  trainRide.classList.add('is-leaving');
  changeLocation(destination, returning ? 'from-route' : 'from-map', null, () => {
    trainRide.hidden = true;
    trainRide.classList.remove('is-arriving', 'is-leaving', 'is-returning');
    updateHudLocation();
    trainWheels.pause();
  });
}

function confirmMapSelection() {
  if (mapOpenedFromMenu && !activeSave) return;
  if (selectedLocalDestination >= 0) {
    localTravelButtons[selectedLocalDestination].click();
    return;
  }
  if (selectedMapZone === 'santiago') localTravelButtons[0].click();
  else if (selectedMapZone === 'valparaiso' || selectedMapZone === 'valdivia') mapZoneTravel.click();
  else {
    const selectedNode = mapZoneNodes.find((node) => node.dataset.mapZone === selectedMapZone);
    selectedNode?.classList.remove('map-denied');
    void selectedNode?.offsetWidth;
    selectedNode?.classList.add('map-denied');
  }
}

function openWorldMap(fromMenu = false) {
  clearPlayerKeys();
  mapOpenedFromMenu = fromMenu;
  worldMap.classList.toggle('opened-from-menu', fromMenu);
  worldMapClose.setAttribute('aria-label', fromMenu ? 'Volver al Cuaderno de viaje' : 'Cerrar mapa');
  worldMap.querySelector('.world-map-help').textContent = fromMenu && !activeSave
    ? 'Flechas o toca un destino para explorarlo · Esc volver'
    : 'WASD / flechas mover · E / Enter confirmar · toca un nodo · Esc cerrar';
  selectMapZone('santiago');
  worldMap.hidden = false;
  if (fromMenu) worldMapClose.focus();
}

function closeWorldMap(returnToMenu = true) {
  selectedLocalDestination = -1;
  localMapNodes.classList.remove('keyboard-active');
  localTravelButtons.forEach((button) => button.classList.remove('keyboard-selected'));
  worldMap.hidden = true;
  const showTravelMenu = mapOpenedFromMenu && returnToMenu;
  mapOpenedFromMenu = false;
  if (showTravelMenu) {
    gameMenu.showModal();
    openMapFromMenu.focus();
  }
}

const mapDirectionsByKey = new Map([
  ['arrowleft', 'left'], ['a', 'left'],
  ['arrowright', 'right'], ['d', 'right'],
  ['arrowup', 'up'], ['w', 'up'],
  ['arrowdown', 'down'], ['s', 'down']
]);

function handleWorldMapKeyDown(event, pressedKey) {
  if (pressedKey === 'escape') {
    event.preventDefault();
    closeWorldMap();
    return;
  }
  const direction = mapDirectionsByKey.get(pressedKey);
  if (direction && !event.repeat) {
    event.preventDefault();
    if (selectedLocalDestination >= 0) moveLocalMapSelection(direction);
    else moveMapSelection(direction);
  }
  if (!event.repeat && (pressedKey === 'e' || pressedKey === 'enter' || event.code === 'Space')) {
    event.preventDefault();
    confirmMapSelection();
  }
}

albumPrev.addEventListener('click', () => changeAlbumPage(-1));
albumNext.addEventListener('click', () => changeAlbumPage(1));
albumClose.addEventListener('click', closeAlbum);
worldMapClose.addEventListener('click', () => closeWorldMap());
nextDestination.addEventListener('click', () => selectMapZone(tizneResponse ? 'valdivia' : 'valparaiso', true));
mapZoneTravel.addEventListener('click', () => {
  if (mapOpenedFromMenu && !activeSave) return;
  const destination = selectedMapZone;
  closeWorldMap(false);
  game.focus();
  if (currentPlace === 'station' && destination === 'valparaiso') rideByTrain('valparaiso');
  else if (destination === 'valparaiso' || destination === 'valdivia') changeLocation(destination, 'from-map');
});
mapZoneNodes.forEach((node) => {
  node.addEventListener('click', () => selectMapZone(node.dataset.mapZone));
});
worldMap.querySelectorAll('[data-travel]').forEach((button) => {
  button.addEventListener('click', () => {
    if (mapOpenedFromMenu && !activeSave) return;
    const destination = button.dataset.travel;
    closeWorldMap(false);
    game.focus();
    if (destination === 'santiago') {
      if (currentPlace === 'valparaiso') rideByTrain('station');
      else if (currentPlace === 'valdivia') changeLocation('station', 'from-route');
      else changeLocation('street');
    }
  });
});

function currentInteraction() {
  if (!grounded || transitioning || autoEscapingCave) return null;
  if (sittingInChair) return 'leave-chair';
  if (sittingOnBench) return 'leave-bench';
  if (currentPlace === 'street' && x >= stageWidth * 0.07 && x <= stageWidth * 0.22) return 'enter-house';
  const motaX = stageWidth * 0.523;
  if (currentPlace === 'street' && x >= motaX - 180 && x <= motaX + 155) return 'talk-mota';
  if (currentPlace === 'street' && x >= stageWidth * 1.32 && x <= stageWidth * 1.49) return 'enter-museum';
  if (currentPlace === 'street' && x >= stageWidth * 1.12 && x <= stageWidth * 1.27) return quintaPhotoCollected ? 'view-mirador' : 'take-photo';
  if (currentPlace === 'house' && x <= stageWidth * 0.25) return 'exit-house';
  if (currentPlace === 'house' && x >= stageWidth * 0.27 && x <= stageWidth * 0.39) return 'sit-chair';
  if (currentPlace === 'house' && x >= stageWidth * 0.40 && x <= stageWidth * 0.58) return 'look-window';
  if (currentPlace === 'house' && x >= stageWidth * 0.67) return 'open-album';
  if (currentPlace === 'plaza' && x <= 180) return 'return-street';
  if (currentPlace === 'quinta' && x <= 145) return 'return-plaza';
  if (currentPlace === 'quinta' && x >= stageWidth * 0.38 && x <= stageWidth * 0.57) return 'enter-museum';
  if (currentPlace === 'quinta' && x >= stageWidth * 0.72 && x <= stageWidth - 115) return quintaPhotoCollected ? 'view-mirador' : 'take-photo';
  if (currentPlace === 'museum' && x <= 75) return 'exit-museum';
  if (currentPlace === 'museum' && !whalePostcardCollected && x >= stageWidth - 300) return 'collect-postcard';
  if (currentPlace === 'station' && x >= stageWidth * 0.2 && x <= stageWidth * 0.5) return 'use-estafeta';
  if (currentPlace === 'station' && x >= stageWidth * 0.58 && x <= stageWidth - 125) return 'take-train';
  if (currentPlace === 'valparaiso' && x <= 145) return 'take-return-train';
  if (currentPlace === 'valdivia' && x <= 145) return 'take-return-train';
  if (currentPlace === 'valdivia' && Math.abs(x + 50 - valdiviaBenchCenter('promenade')) < 68) return 'sit-bench-promenade';
  if (currentPlace === 'valdivia' && Math.abs(x + 50 - valdiviaBenchCenter('island')) < 68) return 'sit-bench-island';
  if (currentPlace === 'valdivia' && valdiviaBridgeCrossed &&
    x >= stageWidth * 2.94 && x <= stageWidth * 3.04) return 'return-bridge';
  if (currentPlace === 'valdivia' && x >= stageWidth * 2.2 && x <= stageWidth * 2.52) return 'inspect-tracks';
  if (currentPlace === 'valdivia' && x >= stageWidth * 2.72 && x <= stageWidth * 3.05) return 'inspect-passage';
  if (currentPlace === 'bridge' && bridgeDepth >= bridgeTop() - 24) return 'cross-bridge';
  if (currentPlace === 'bridge' && !bridgeLogPlaced &&
    Math.abs(x + 50 - stageWidth * 1.05) < 85 &&
    bridgeDepth > stageHeight * 3.20 && bridgeDepth < stageHeight * 3.40) return 'bridge-log';
  if (currentPlace === 'bridge' && !bridgePostcardCollected && bridgeLogPlaced &&
    Math.abs(x + 50 - stageWidth * 1.05) < 55 &&
    bridgeDepth > stageHeight * 3.68 && bridgeDepth < stageHeight * 3.90) return 'bridge-postcard';
  if (currentPlace === 'bridge' &&
    Math.abs(x + 50 - stageWidth * 1.52) < 135 &&
    bridgeDepth > stageHeight * 5.46 && bridgeDepth < stageHeight * 5.80) return 'help-family';
  if (currentPlace === 'bridge') {
    const clueIndex = bridgeClues.findIndex(({ left, depth }, index) => !bridgeCluesSeen.has(index) &&
      Math.abs(x + 50 - left * stageWidth) < 58 &&
      Math.abs(bridgeDepth - depth * stageHeight) < 54);
    if (clueIndex !== -1) return `bridge-clue-${clueIndex}`;
  }
  if (currentPlace === 'valdivia' && x >= stageWidth * 1.80 && x <= stageWidth * 2.03) return 'look-river';
  if (currentPlace === 'valdivia' && Math.abs(x + 50 - (valdiviaCopo.offsetLeft + valdiviaCopo.offsetWidth / 2)) < 85) return 'talk-copo';
  if (currentPlace === 'valparaiso' && x >= stageWidth * 1.24 && x <= stageWidth * 1.56) return 'talk-tizne';
  if (currentPlace === 'valparaiso' && x >= stageWidth * 2.60 && x <= stageWidth * 2.90) return 'talk-bruma';
  const bellCenterX = stageWidth * 6 * 0.944 + 15;
  if (currentPlace === 'cave' && !caveBellCollected && Math.abs(x + 45 - bellCenterX) <= 115) return 'collect-bell';
  return null;
}

function sitOnValdiviaBench(bench) {
  clearPlayerKeys();
  sittingOnBench = bench;
  const benchCenter = valdiviaBenchCenter(bench);
  copoBenchSide = (copoWorldX ?? valdiviaCopo.offsetLeft) + 36 < benchCenter ? -1 : 1;
  x = benchCenter - 50;
  frame = 0;
}

function handleSeatedKeyDown(event, pressedKey) {
  if (event.repeat) return;
  const standUp = ['escape', 'e', 'enter'].includes(pressedKey);
  if (sittingInChair) {
    if (standUp) {
      sittingInChair = false;
      x = stageWidth * 0.395;
      frame = 0;
    }
    return;
  }

  const stepRight = pressedKey === 'arrowright' || pressedKey === 'd';
  const stepLeft = pressedKey === 'arrowleft' || pressedKey === 'a';
  if (!standUp && !stepRight && !stepLeft) return;
  const bench = sittingOnBench;
  const exitOffset = stepRight ? 100 : stepLeft ? -100 : bench === 'island' ? 100 : -100;
  x = valdiviaBenchCenter(bench) - 50 + exitOffset;
  sittingOnBench = null;
  frame = 0;
  event.preventDefault();
}

const sceneInteractions = {
  // Barrio Yungay y Quinta Normal
  'enter-house': { label: 'Entrar a casa', perform: () => changeLocation('house') },
  'exit-house': { label: 'Salir a Barrio Yungay', perform: () => changeLocation('street') },
  'open-album': { label: 'Ver Álbum de Viaje', perform: openAlbum },
  'look-window': {
    label: 'Mirar por la ventana',
    perform() {
      scene.classList.add('window-gazing');
      startDialogue([['Kuro', 'Qué bonito está el jacarandá hoy.']]);
    }
  },
  'sit-chair': {
    label: 'Sentarse a leer',
    perform() {
      clearPlayerKeys();
      sittingInChair = true;
      x = stageWidth * 0.34;
      facing = 1;
      frame = 0;
    }
  },
  'leave-chair': { label: 'Levantarse' },
  'return-street': { label: 'Volver a Barrio Yungay', perform: () => changeLocation('street', 'at-plaza') },
  'return-plaza': { label: 'Volver a Plaza Yungay', perform: () => changeLocation('street', 'from-quinta') },
  'talk-mota': {
    label: 'Hablar con Mota',
    perform() {
      if (motaConversationComplete) startDialogue([['Mota', 'La sombra sigue buena, Kuro. Cuando vuelvas, me cuentas del viaje.']]);
      else startDialogue(motaConversation);
    }
  },
  'enter-museum': { label: 'Entrar al museo', perform: () => changeLocation('museum') },
  'exit-museum': { label: 'Salir a Quinta Normal', perform: () => changeLocation('street', 'from-museum') },
  'collect-postcard': {
    label: 'Revisar vitrina',
    perform() {
      whalePostcardCollected = true;
      saveAfterMilestone();
      scene.classList.add('postcard-collected');
      startDialogue([
        ['Álbum de Viaje', 'Postal: La ballena de Quinta Normal'],
        ['Álbum de Viaje', 'Algunas criaturas recorren océanos enteros. Kuro se pregunta cuántos lugares podría conocer él.']
      ]);
    }
  },
  'take-photo': { label: 'Sacar una foto', perform: takeQuintaPhoto },
  'view-mirador': {
    label: 'Mirar el paisaje',
    perform() {
      startDialogue([['Kuro', 'Desde aquí todo se ve distinto. Me alegra haber guardado este momento.']]);
    }
  },

  // Estación Mapocho y trenes
  'use-estafeta': {
    get label() {
      if (firstLetterSent && returnedFromValparaiso && tizneResponse) {
        return grandmotherReplyRead ? 'Releer carta de la abuelita' : 'Leer carta de la abuelita';
      }
      return firstLetterSent ? 'Revisar Estafeta' : 'Enviar carta a la abuelita';
    },
    perform() {
      if (firstLetterSent && returnedFromValparaiso && tizneResponse) {
        grandmotherReplyRead = true;
        saveAfterMilestone();
        startDialogue([
          ['Estafeta Gatuna', '¡Llegó una carta para Kuro! Es de tu abuelita.'],
          ['Abuelita', '¡Kuro, mi niño! Me llegó tu primera carta. Me alegró saber que llegaste bien a Mapocho.'],
          ['Abuelita', 'Cuando visites otro lugar, mándame otra, ¿sí? Así puedo imaginar por dónde andan tus patitas… y saber que estás bien.'],
          ['Kuro', 'Le mandaré una desde el próximo lugar.']
        ]);
      } else if (firstLetterSent) {
        startDialogue([['Estafeta Gatuna', 'Tu carta para la abuelita ya va en camino.']]);
      } else {
        openFirstLetter();
      }
    }
  },
  'take-train': { label: 'Tomar el tren', perform: openWorldMap },
  'take-return-train': { label: 'Tomar el tren a Santiago', perform: openWorldMap },

  // Valparaíso y Cueva del Chivato
  'talk-tizne': {
    label: 'Hablar con Tizne',
    perform() {
      if (caveBellCollected && !tizneResponse) startTizneReturnConversation();
      else if (tizneResponse) startDialogue([['Tizne', tizneResponses[tizneResponse].followUp, 'remorseful']]);
      else if (tizneConversationComplete) startDialogue([['Tizne', 'No tienes que decidir ahora. Los cerros no se irán a ninguna parte.']]);
      else startDialogue(tizneConversation);
    }
  },
  'talk-bruma': {
    get label() {
      return caveBellCollected && !brumaBellReturned ? 'Devolver el cascabel' : 'Hablar con Doña Bruma';
    },
    perform: talkToBruma
  },
  'collect-bell': { label: 'Recoger el cascabel', perform: collectCaveBell },

  // Valdivia y Puente Pedro de Valdivia
  'sit-bench-promenade': { label: 'Sentarse junto al río', perform: () => sitOnValdiviaBench('promenade') },
  'sit-bench-island': { label: 'Sentarse junto al arrayán', perform: () => sitOnValdiviaBench('island') },
  'leave-bench': { label: 'Levantarse' },
  'talk-copo': {
    label: 'Hablar con Copo',
    perform() {
      startDialogue([
        ['Copo', valdiviaFamilyHelped ? '¡La familia ya tiene dónde refugiarse! Gracias por ayudarme, Kuro.' : 'Hola, soy Copo. ¿De dónde vienes?'],
        ['Kuro', valdiviaFamilyHelped ? 'Me alegra haber seguido esas huellitas.' : 'Vengo de Santiago. ¿Me acompañas a conocer la feria?'],
        ['Copo', valdiviaFamilyHelped ? 'Cuando llueva, estarán protegidos bajo los juncos.' : 'Claro. Hay unas huellas raras por ahí y todos bromean con que son mías.']
      ], () => startCopoFollowing());
    }
  },
  'look-river': {
    label: 'Mirar el río',
    perform() {
      startDialogue([['Kuro', 'Desde este muelle se ve hasta la otra orilla. Me pregunto qué habrá más allá.']]);
    }
  },
  'inspect-tracks': {
    get label() {
      return valdiviaTracksFound ? 'Mirar las huellas' : 'Investigar huellitas';
    },
    perform() {
      startCopoFollowing(true);
      valdiviaTracksFound = true;
      saveAfterMilestone();
      startDialogue([
        ['Kuro', 'Son huellitas de barro… van desde los puestos hacia el puente.'],
        ['Copo', '¡Te dije que no eran mías! Mi gorro no deja huellas.'],
        ['Kuro', 'Sigámoslas. Alguien pequeño pasó por aquí.']
      ]);
    }
  },
  'inspect-passage': {
    get label() {
      return valdiviaPassageFound ? 'Entrar a la subida' : 'Investigar bajo el puente';
    },
    perform() {
      if (!valdiviaTracksFound) {
        startDialogue([['Kuro', 'Hay una subida oculta bajo el puente. Antes quiero ver adónde llevan esas huellas de la feria.']]);
        return;
      }
      if (valdiviaPassageFound) {
        changeLocation('bridge');
        return;
      }
      valdiviaPassageFound = true;
      saveAfterMilestone();
      scene.classList.add('valdivia-passage-found');
      startDialogue([
        ['Copo', 'Mira, las huellas siguen por aquí. Hay plataformas para subir por el puente.'],
        ['Kuro', 'Voy a subir saltando. Isla Teja nos espera arriba.']
      ], () => changeLocation('bridge'));
    }
  },
  'return-bridge': { label: 'Volver al puente', perform: () => changeLocation('bridge', 'from-island') },
  'cross-bridge': {
    label: 'Continuar a Isla Teja',
    perform() {
      valdiviaBridgeCrossed = true;
      changeLocation('valdivia', 'at-island');
    }
  },
  'bridge-log': {
    get label() {
      return `Mantén E para empujar · ${Math.round(bridgeLogProgress * 100)}%`;
    },
    perform() {
      if (bridgeLogTouched && performance.now() >= bridgeLogReadyAt) advanceBridgeLog(.065, true);
    }
  },
  'bridge-postcard': {
    label: 'Recoger la postal',
    perform() {
      bridgePostcardCollected = true;
      saveAfterMilestone();
      scene.classList.add('bridge-postcard-collected');
      openAlbum(bridgeAlbumPage);
    }
  },
  ...Object.fromEntries(bridgeClues.map(({ label, line }, index) => [
    `bridge-clue-${index}`,
    {
      label,
      perform() {
        bridgeCluesSeen.add(index);
        startDialogue([['Kuro', line]]);
      }
    }
  ])),
  'help-family': {
    get label() {
      return valdiviaFamilyHelped ? 'Visitar a los coipos' : 'Ayudar a los coipos';
    },
    perform() {
      if (valdiviaFamilyHelped) {
        startDialogue([['Copo', 'Ahora tienen un rincón seco. Qué bueno que seguimos las huellas.']]);
        return;
      }
      valdiviaFamilyHelped = true;
      saveAfterMilestone();
      scene.classList.add('valdivia-family-helped');
      renderAlbum();
      startDialogue([
        ['Kuro', '¡Eran coipos de verdad! Los pequeños están temblando bajo la lluvia.'],
        ['Copo', 'Hay juncos y ramas secas junto al jardín. Podemos cubrir la entrada de su refugio.'],
        ['Kuro', 'Listo. Ya tienen un lugar calentito donde quedarse.'],
        ['Copo', 'Mi gorro les manda saludos.'],
        ['Álbum de Viaje', 'Nueva postal: Un refugio junto al río.']
      ]);
    }
  }
};

function updateInteractionPrompt(interaction, time) {
  promptAction.textContent = sceneInteractions[interaction]?.label ?? '';
  interactionPrompt.classList.toggle('edge-left', interaction === 'exit-museum');
  interactionPrompt.classList.toggle('object-right', interaction === 'collect-postcard');
  interactionPrompt.classList.toggle('chair-action', interaction === 'leave-chair');
  interactionPrompt.classList.toggle('talk-mota', interaction === 'talk-mota');
  interactionPrompt.classList.toggle('quinta-action', ['enter-museum', 'take-photo', 'view-mirador'].includes(interaction));
  interactionPrompt.classList.toggle('mirador-action', ['take-photo', 'view-mirador'].includes(interaction));
  interactionPrompt.classList.toggle('station-action', ['use-estafeta', 'take-train'].includes(interaction));
  interactionPrompt.classList.toggle('train-action', interaction === 'take-train');
  interactionPrompt.hidden = !interaction || !dialogue.hidden || (interaction === 'bridge-log' && time < bridgeLogReadyAt);
}

function startCopoFollowing(appearBesideKuro = false) {
  if (copoFollowing) return;
  copoFollowing = true;
  saveAfterMilestone();
  scene.classList.add('copo-following');
  copoWorldX = appearBesideKuro ? Math.max(10, x - 65) : valdiviaCopo.offsetLeft;
  copoChasing = false;
  copoFacing = Math.sign(x + 50 - (copoWorldX + 36)) || 1;
  valdiviaCopo.style.left = `${copoWorldX}px`;
}

function updateCopoFollower(dt) {
  if (!copoFollowing || (currentPlace !== 'valdivia' && currentPlace !== 'bridge')) return;
  const worldWidth = stageWidth * (currentPlace === 'bridge' ? 2.4 : 4);
  if (copoWorldX === null) copoWorldX = Math.max(10, x - 65);
  if (sittingOnBench && currentPlace === 'valdivia') {
    const benchCenter = valdiviaBenchCenter(sittingOnBench);
    const target = Math.max(10, Math.min(worldWidth - 82, benchCenter + copoBenchSide * 120 - 36));
    const gap = target - copoWorldX;
    const step = Math.min(Math.abs(gap), 430 * dt);
    copoWorldX += Math.sign(gap) * step;
    copoChasing = false;
    valdiviaCopo.style.left = `${copoWorldX}px`;
    copoFacing = step > 0.5 ? Math.sign(gap) : -copoBenchSide;
    valdiviaCopo.style.setProperty('--copo-facing', copoFacing);
    valdiviaCopo.classList.toggle('walking', step > 0.5);
    return;
  }
  const gap = x + 50 - (copoWorldX + 36);
  const distance = Math.abs(gap);
  if (distance > 145) copoChasing = true;
  if (distance <= 92) copoChasing = false;
  const step = copoChasing ? Math.min(Math.max(0, distance - 92), 430 * dt) : 0;
  if (step > 0.5) copoWorldX = Math.max(10, Math.min(worldWidth - 82, copoWorldX + Math.sign(gap) * step));
  if (step > 0.5) copoFacing = Math.sign(gap);
  valdiviaCopo.style.setProperty('--copo-facing', copoFacing);
  valdiviaCopo.style.left = `${copoWorldX}px`;
  valdiviaCopo.classList.toggle('walking', step > 0.5);
  if (currentPlace === 'bridge') valdiviaCopo.style.setProperty('--copo-depth', `${bridgeDepth + y}px`);
}

function updateValdiviaVendor(time) {
  if (currentPlace !== 'valdivia') return;
  const center = valdiviaVendorCenter();
  const nearby = [
    { id: 'kuro', center: x + 50 },
    { id: 'copo', center: (copoWorldX ?? valdiviaCopo.offsetLeft) + valdiviaCopo.offsetWidth / 2 }
  ];
  valdiviaPassersby.forEach((passerby, index) => {
    const passerbyCenter = passerby.offsetLeft + passerby.offsetWidth / 2;
    if (Math.abs(passerbyCenter - center) < 270 && Number(getComputedStyle(passerby).opacity) > .5) {
      nearby.push({ id: `passerby-${index}`, center: passerbyCenter });
    }
  });
  const candidates = nearby.map(person => ({ ...person, distance: Math.abs(person.center - center) }))
    .filter(person => person.distance < 230)
    .sort((a, b) => a.distance - b.distance);
  const current = candidates.find(person => person.id === vendorAttentionTarget);
  const target = current && current.distance < (candidates[0]?.distance ?? Infinity) + 45 ? current : candidates[0];
  vendorAttentionTarget = target?.id ?? null;
  if (target) {
    if (target.center < center - 18) vendorFacing = 1;
    else if (target.center > center + 18) vendorFacing = -1;
  } else vendorFacing = 1;
  if (vendorTurningUntil && time >= vendorTurningUntil) {
    vendorShownFacing = vendorTurnTarget;
    vendorTurningUntil = 0;
  }
  if (!vendorTurningUntil && vendorFacing !== vendorShownFacing) {
    vendorTurnTarget = vendorFacing;
    vendorTurnStartedAt = time;
    vendorTurningUntil = time + 420;
  }
  const turnProgress = vendorTurningUntil ? (time - vendorTurnStartedAt) / 420 : 1;
  valdiviaVendor.classList.toggle('turning-quarter', vendorTurningUntil > time && (turnProgress < 1 / 3 || turnProgress >= 2 / 3));
  valdiviaVendor.classList.toggle('turning-front', vendorTurningUntil > time && turnProgress >= 1 / 3 && turnProgress < 2 / 3);
  valdiviaVendor.style.setProperty('--turn-facing', turnProgress < 1 / 3 ? vendorShownFacing : vendorTurnTarget);
  valdiviaVendor.style.setProperty('--vendor-facing', vendorShownFacing);
}

const sceneEntryPoints = {
  street: {
    default: { x: width => width * 0.14 },
    'from-quinta': { x: () => worldWidthFor('street') - 150 },
    'from-station': { x: () => worldWidthFor('street') - 150 },
    'from-museum': { x: width => width * 1.29 },
    'at-museum': { x: width => width * 1.40 },
    'at-quinta': { x: width => width * 1.20 },
    'at-mota': { x: width => width * 0.36 },
    'at-plaza': { x: width => width * 0.86 },
    'at-neighborhood': { x: width => width * 0.46 },
    'at-seam': { x: width => width * 0.90 }
  },
  house: {
    default: { x: () => 175 },
    'at-chair': { x: width => width * 0.34 }
  },
  plaza: {
    default: { x: () => 120 },
    'from-quinta': { x: width => width - 150 },
    'at-mota': { x: width => width * 0.35 }
  },
  quinta: {
    default: { x: () => 120 },
    'from-museum': { x: width => width * 0.5 },
    'at-mirador': { x: width => width * 0.76 }
  },
  museum: {
    default: { x: () => 170 }
  },
  station: {
    default: { x: () => 120 },
    'at-estafeta': { x: width => width * 0.23 },
    'at-train': { x: width => width * 0.58 },
    'from-route': { x: width => width - 150 }
  },
  valparaiso: {
    default: { x: () => 160 },
    'at-train': { x: () => 95 },
    'from-map': { x: width => width * 0.24 },
    'at-tizne': { x: width => width * 1.34 },
    'at-hills': { x: width => width * 1.60 },
    'at-lower-hills': { x: width => width * 2.07 },
    'at-mid-hills': { x: width => width * 2.44 },
    'at-bruma': { x: width => width * 2.62 },
    'at-cave': { x: width => width * 3.12 },
    'at-connector': { x: width => width * 0.82 },
    'at-station-seam': { x: width => width * 0.56 },
    'at-plaza-seam': { x: width => width * 1.12 }
  },
  valdivia: {
    default: { x: width => width * 0.22 },
    'at-coipo': { x: () => valdiviaCopo.offsetLeft + valdiviaCopo.offsetWidth / 2 - 110 },
    'at-pier': { x: width => width * 1.83 },
    'at-market': { x: width => width * 2.32 },
    'at-vendor': { x: () => valdiviaVendorCenter() - 125 },
    'at-passage': { x: width => width * 2.82 },
    'at-island': { x: width => width * 3.63 }
  },
  bridge: {
    default: { x: width => width * .42 - 50, depthInScreens: .16 },
    'at-log': { x: width => width * 1.05 - 50, depthInScreens: 3.28 },
    'at-mud': { x: width => width * 1.45 - 50, depthInScreens: 2.06 },
    'at-refuge': { x: width => width * 1.56 - 50, depthInScreens: 5.61 },
    'from-island': { x: width => width * 1.54 - 50, depthInScreens: 5.98 }
  },
  cave: {
    default: { x: () => 185 },
    'at-goat': { x: width => width * (caveBellCollected ? 3.08 : 2.72) },
    'at-sea-lion': { x: width => width * 4.65 },
    'at-dog': { x: width => width * 1.05 },
    'at-middle': { x: width => width * 3.75 },
    'at-bird': { x: width => width * .54 },
    'at-bell': { x: width => width * 5.67 }
  }
};

function getEntryPosition(place, entry, checkpoint) {
  const points = Object.hasOwn(sceneEntryPoints, place) ? sceneEntryPoints[place] : sceneEntryPoints.street;
  const point = Object.hasOwn(points, entry) ? points[entry] : points.default;
  const hasSavedHorizontal = Number.isFinite(checkpoint?.horizontal);
  let depth = 0;
  if (place === 'bridge') {
    depth = Number.isFinite(checkpoint?.depth)
      ? Math.max(bridgeExitDepth(), Math.min(bridgeTop(), checkpoint.depth * stageHeight))
      : point.depthInScreens * stageHeight;
  }
  return {
    x: hasSavedHorizontal ? Math.max(10, checkpoint.horizontal * stageWidth - 50) : point.x(stageWidth),
    facing: hasSavedHorizontal ? (checkpoint.facing === -1 ? -1 : 1) : null,
    bridgeDepth: depth,
    bridgeDirection: entry === 'from-island' ? 'front' : 'back'
  };
}

const streetCameraEntries = new Set(['at-neighborhood', 'at-seam', 'at-plaza', 'at-mota', 'at-quinta', 'at-museum', 'from-museum']);
const valparaisoCameraEntries = new Set([
  'at-tizne', 'at-hills', 'at-lower-hills', 'at-mid-hills', 'at-bruma', 'at-cave', 'at-connector', 'at-station-seam', 'at-plaza-seam'
]);
const caveCameraEntries = new Set(['at-goat', 'at-sea-lion', 'at-dog', 'at-middle', 'at-bird', 'at-bell']);

function initialCameraX(place, entry, playerX) {
  const viewWidth = camera.viewWidth;
  if (entry === 'from-quinta' || entry === 'from-station') return worldWidthFor(place) - viewWidth;
  const framedEntry = (place === 'street' && streetCameraEntries.has(entry))
    || (place === 'valparaiso' && valparaisoCameraEntries.has(entry))
    || (place === 'cave' && caveCameraEntries.has(entry));
  if (framedEntry || viewWidth < stageWidth - 1 || playerX + 100 > viewWidth) {
    return playerX - viewWidth * .45;
  }
  return 0;
}

function bridgeCameraTarget(sceneHeight) {
  const feetFromTop = sceneHeight * .96 - bridgeDepth - y;
  return Math.max(0, Math.min(sceneHeight - stageHeight, feetFromTop - stageHeight * .68));
}

function setEntryCamera(place, entry, checkpoint) {
  const hasSavedHorizontal = Number.isFinite(checkpoint?.horizontal);
  const scrollX = hasSavedHorizontal
    ? x - camera.viewWidth * .5
    : initialCameraX(place, entry, x);
  let scrollY = 0;
  if (place === 'bridge') {
    const sceneHeight = scene.offsetHeight;
    scrollY = hasSavedHorizontal || entry !== 'default'
      ? bridgeCameraTarget(sceneHeight)
      : sceneHeight - stageHeight;
  }
  camera.jumpTo(scrollX, scrollY, worldWidthFor(place));
}

function updateSceneRenderer() {
  phaserRenderer?.setLocation(useDomHouse && currentPlace === 'house' ? null : currentPlace);
}

function changeLocation(nextLocation, entry = 'default', checkpoint = null, onArrival = null) {
  if (transitioning) return;
  const justReturnedFromValparaiso = currentPlace === 'valparaiso' && (nextLocation === 'station' || nextLocation === 'street') && tizneResponse && !returnedFromValparaiso;
  if (justReturnedFromValparaiso) returnedFromValparaiso = true;
  transitioning = true;
  fade.classList.add('active');
  setTimeout(() => {
    currentPlace = nextLocation;
    sittingInChair = entry === 'at-chair';
    sittingOnBench = null;
    const inside = currentPlace === 'house';
    const atStreet = currentPlace === 'street';
    const atPlaza = currentPlace === 'plaza';
    const atQuinta = currentPlace === 'quinta';
    const atMuseum = currentPlace === 'museum';
    const atStation = currentPlace === 'station';
    const atValparaiso = currentPlace === 'valparaiso';
    const atValdivia = currentPlace === 'valdivia';
    const atBridge = currentPlace === 'bridge';
    const atCave = currentPlace === 'cave';
    scene.classList.toggle('inside', inside);
    scene.classList.toggle('street', atStreet);
    scene.classList.toggle('plaza', atPlaza);
    scene.classList.toggle('quinta', atQuinta);
    scene.classList.toggle('museum', atMuseum);
    scene.classList.toggle('station', atStation);
    scene.classList.toggle('valparaiso', atValparaiso);
    scene.classList.toggle('valdivia', atValdivia);
    scene.classList.toggle('bridge', atBridge);
    scene.classList.toggle('copo-following', copoFollowing);
    scene.classList.toggle('valdivia-passage-found', valdiviaPassageFound);
    scene.classList.toggle('valdivia-family-helped', valdiviaFamilyHelped);
    scene.classList.toggle('cave', atCave);
    scene.classList.toggle('cave-bell-collected', caveBellCollected);
    game.classList.toggle('cave-active', atCave);
    game.classList.toggle('cave-return', atCave && caveBellCollected);
    caveClaw.hidden = !atCave || caveBellCollected;
    if (!atCave) {
      clearSootDamage();
      resetSootProjectile();
    }
    if (atCave) {
      resetGoatChase();
      resetPackChase();
    }
    const position = getEntryPosition(currentPlace, entry, checkpoint);
    x = position.x;
    if (position.facing !== null) {
      facing = position.facing;
      kuro.style.setProperty('--facing', facing);
    }
    if (atValdivia || atBridge) {
      copoWorldX = copoFollowing ? Math.max(10, x - 65) : null;
      copoChasing = false;
      valdiviaCopo.style.left = copoFollowing ? `${copoWorldX}px` : '';
      if (copoFollowing) {
        copoFacing = Math.sign(x + 50 - (copoWorldX + 36)) || 1;
        valdiviaCopo.style.setProperty('--copo-facing', copoFacing);
      }
      valdiviaCopo.classList.remove('walking');
    }
    y = 0;
    velocityY = 0;
    grounded = true;
    jumpsUsed = 0;
    bridgeDepth = position.bridgeDepth;
    bridgeDirection = position.bridgeDirection;
    autoEscapingCave = false;
    setEntryCamera(currentPlace, entry, checkpoint);
    if (atBridge) renderBridgePath();
    if (atStation || atValparaiso) prepareTrainRide();
    dialogue.hidden = true;
    scene.classList.remove('window-gazing');
    renderCamera();
    updateSceneRenderer();
    updateHudLocation();
    requestAnimationFrame(() => {
      fade.classList.remove('active');
      transitioning = false;
      if (justReturnedFromValparaiso || (nextLocation === 'valdivia' && entry === 'at-island' && valdiviaBridgeCrossed)) {
        saveAfterMilestone();
      }
      onArrival?.();
    });
  }, 180);
}

function isKeyHeld(key) {
  if (keys.has(key)) return true;
  for (const touchKey of touchKeys.values()) {
    if (touchKey === key) return true;
  }
  return false;
}

function clearPlayerKeys() {
  keys.clear();
  touchKeys.clear();
}

function handlePlayerKeyDown(event, pressedKey, pointerId) {
  if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown'].includes(pressedKey)) event.preventDefault();
  if (pressedKey === 'f' && !event.repeat) {
    triggerClaw();
    event.preventDefault();
  }
  if (pointerId === undefined) keys.add(pressedKey);
  else touchKeys.set(pointerId, pressedKey);
  if (event.code === 'Space' && !event.repeat) {
    attemptJump();
    event.preventDefault();
  }
  if ((pressedKey === 'e' || pressedKey === 'enter') && !event.repeat) {
    sceneInteractions[currentInteraction()]?.perform?.();
  }
}

function handlePlayerKeyUp(event) {
  keys.delete(event.key.toLowerCase());
  if (event.code === 'Space') releaseJump();
}

function releaseJump() {
  if (!isKeyHeld(' ') && velocityY > 180) velocityY = 180;
}

function routeGameKeyDown(event, pointerId) {
  const pressedKey = event.key.toLowerCase();
  if (pressedKey === 'h' && !event.altKey && !event.ctrlKey && !event.metaKey && !event.isComposing) {
    if (!event.repeat && toggleControlsGuide()) event.preventDefault();
    return;
  }
  if (controlsGuide.open) return;
  if (!trainRide.hidden) {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(event.key)) event.preventDefault();
    return;
  }
  const onControl = event.target === pauseGame || event.target === controlsButton
    || (event.target instanceof Node && touchControls.contains(event.target));
  if (gameMenu.open || (onControl && ['Enter', ' '].includes(event.key))) return;
  if (mailComposer.open) {
    if (pressedKey === 'e' && !event.repeat) {
      event.preventDefault();
      mailSend.click();
    }
    return;
  }
  // El mapa puede abrirse desde la pausa mientras Kuro está sentado.
  if (!worldMap.hidden) return handleWorldMapKeyDown(event, pressedKey);
  if (sittingInChair || sittingOnBench) return handleSeatedKeyDown(event, pressedKey);
  if (!photoMoment.hidden) {
    if ((pressedKey === 'escape' || pressedKey === 'e' || pressedKey === 'enter') && !event.repeat) closePhotoMoment();
    return;
  }
  if (!travelAlbum.hidden) return handleAlbumKeyDown(event, pressedKey);
  if (!dialogue.hidden) return handleDialogueKeyDown(event, pressedKey);
  if (pressedKey === 'escape' && !event.repeat && activeSave) {
    event.preventDefault();
    openPauseMenu();
    return;
  }
  handlePlayerKeyDown(event, pressedKey, pointerId);
}

addEventListener('keydown', routeGameKeyDown);
addEventListener('keyup', handlePlayerKeyUp);
addEventListener('blur', clearPlayerKeys);

function pressTouchKey(event, button, pointerId) {
  routeGameKeyDown({
    key: button.dataset.touchKey,
    code: button.dataset.touchCode,
    target: game,
    preventDefault: () => event.preventDefault()
  }, pointerId);
}

function releaseTouchKey(pointerId) {
  const key = touchKeys.get(pointerId);
  touchKeys.delete(pointerId);
  if (key === ' ') releaseJump();
}

touchControls.addEventListener('pointerdown', (event) => {
  const button = event.target.closest('[data-touch-key]');
  if (!button || event.button !== 0) return;
  event.preventDefault();
  button.setPointerCapture(event.pointerId);
  pressTouchKey(event, button, event.pointerId);
});

for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
  touchControls.addEventListener(type, (event) => releaseTouchKey(event.pointerId));
}

touchControls.addEventListener('click', (event) => {
  const button = event.target.closest('[data-touch-key]');
  if (!button || event.detail !== 0) return;
  const pointerId = Symbol();
  pressTouchKey(event, button, pointerId);
  setTimeout(() => releaseTouchKey(pointerId), 110);
});

function worldWidthFor(place) {
  return Object.hasOwn(sceneWidthMultipliers, place)
    ? stageWidth * sceneWidthMultipliers[place]
    : worldWidth;
}

function updateCaveTransition(controlsEnabled) {
  if (!controlsEnabled || transitioning) return;
  if (currentPlace === 'valparaiso' && x >= worldWidthFor(currentPlace) - 110) {
    changeLocation('cave');
  } else if (currentPlace === 'cave' && x <= 12) {
    if (caveBellCollected) {
      changeLocation('valparaiso', 'at-cave');
    } else {
      startDialogue([['Kuro', '¡Ay, no! ¡Qué miedooo!']]);
      setTimeout(() => {
        if (currentPlace !== 'cave') return;
        closeDialogue();
        autoEscapingCave = true;
        facing = -1;
        kuro.style.setProperty('--facing', facing);
      }, 720);
    }
  }
}

function updateKuroMovement(time, dt) {
  if (sittingInChair) x = stageWidth * 0.34;
  if (sittingOnBench) x = valdiviaBenchCenter(sittingOnBench) - 50;

  const controlsEnabled = dialogue.hidden && travelAlbum.hidden && photoMoment.hidden && worldMap.hidden &&
    !sittingInChair && !sittingOnBench && !autoEscapingCave;
  const moveRight = isKeyHeld('arrowright') || isKeyHeld('d');
  const moveLeft = isKeyHeld('arrowleft') || isKeyHeld('a');
  const moveUp = isKeyHeld('arrowup') || isKeyHeld('w');
  const moveDown = isKeyHeld('arrowdown') || isKeyHeld('s');
  const onBridge = currentPlace === 'bridge';
  const moving = autoEscapingCave || (controlsEnabled && (moveRight || moveLeft || (onBridge && (moveUp || moveDown))));
  const sprinting = isKeyHeld('shift');
  const speed = (sprinting ? 370 : 240) * (onBridge && bridgeInMud(x + 50, bridgeDepth) ? .18 : 1);
  const bridgeHorizontal = Number(moveRight) - Number(moveLeft);
  const bridgeVertical = Number(moveUp) - Number(moveDown);
  const bridgeMoveScale = onBridge && bridgeHorizontal && bridgeVertical ? 1 / Math.hypot(1, .86) : 1;

  if (autoEscapingCave) {
    x = Math.max(10, x - 520 * dt);
    if (x <= 12) {
      autoEscapingCave = false;
      changeLocation('valparaiso', 'at-cave');
    }
  }

  if (controlsEnabled && !(onBridge && bridgeMudReturn)) {
    if (moveRight) {
      const maxX = worldWidthFor(currentPlace) - 110;
      const nextX = Math.min(maxX, x + speed * bridgeMoveScale * dt);
      if (onBridge) {
        stepAlongBridgeShore(nextX);
        bridgeDirection = 'side';
      } else x = nextX;
      facing = 1;
      kuro.style.setProperty('--facing', facing);
      if (!transitioning && (currentPlace === 'street' || currentPlace === 'quinta') && x >= maxX) {
        changeLocation('station');
      }
    }
    if (moveLeft) {
      const nextX = Math.max(10, x - speed * bridgeMoveScale * dt);
      if (onBridge) {
        stepAlongBridgeShore(nextX);
        bridgeDirection = 'side';
      } else x = nextX;
      facing = -1;
      kuro.style.setProperty('--facing', facing);
      if (!transitioning && currentPlace === 'station' && x <= 10) {
        changeLocation('street', 'from-station');
      }
    }
    if (onBridge) {
      if (bridgeVertical > 0) {
        const nextDepth = Math.min(bridgeTop(), bridgeDepth + speed * .86 * bridgeMoveScale * dt);
        if (bridgeOnPath(x, nextDepth)) bridgeDepth = nextDepth;
        bridgeDirection = 'back';
      } else if (bridgeVertical < 0) {
        const nextDepth = Math.max(bridgeExitDepth(), bridgeDepth - speed * .86 * bridgeMoveScale * dt);
        if (bridgeOnPath(x, nextDepth)) bridgeDepth = nextDepth;
        bridgeDirection = 'front';
      }
      if (bridgeHorizontal && bridgeVertical) bridgeDirection = bridgeVertical > 0 ? 'diagonal-back' : 'diagonal-front';
    }
  }
  if (onBridge && controlsEnabled && !transitioning && bridgeDepth <= bridgeExitDepth()) {
    clearPlayerKeys();
    changeLocation('valdivia', 'at-passage');
  }

  updateBridgeMud(time, dt, controlsEnabled);
  updateCaveTransition(controlsEnabled);
  updateJump(dt);
  return { controlsEnabled, moving, sprinting };
}

function updateValparaisoGround() {
  if (currentPlace !== 'valparaiso') return;
  const panoramaWidth = stageWidth * 1.6875;
  const hillsStart = stageWidth * 1.60;
  const plazaRiseStart = stageWidth * 1.50;
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

function renderKuroPosition(time) {
  kuro.classList.toggle('swiping', time < clawUntil);
  kuro.style.left = `${x}px`;
  kuro.style.setProperty('--jump-y', `${y}px`);
  kuro.style.setProperty('--bridge-depth', `${bridgeDepth}px`);
}

function renderCamera() {
  scene.style.transform = `translate(${-camera.x}px, ${-camera.y}px)`;
  if (currentPlace === 'cave') game.style.setProperty('--cave-light-x', `${x - camera.x + 50}px`);
}

function updateCamera(dt, moving) {
  camera.followHorizontal(dt, worldWidthFor(currentPlace), x, moving ? facing : 0);
  if (currentPlace === 'bridge') {
    const desiredCameraY = bridgeCameraTarget(scene.offsetHeight);
    camera.y += (desiredCameraY - camera.y) * Math.min(1, 6 * dt);
  }
  renderCamera();
}

function readPlayerSprite() {
  let pose = 'idle';
  if (sittingInChair) pose = 'reading';
  else if (!grounded) pose = 'jumping';
  else if (kuro.classList.contains('running')) pose = 'running';
  else if (!dialogue.hidden) pose = 'interact';
  return { centerX: x + 50, jump: sittingInChair ? 0 : y, facing, frame, pose };
}

function updateKuroAnimation(time, moving, sprinting) {
  kuro.classList.toggle('jumping', !grounded);
  kuro.classList.toggle('back-facing', currentPlace === 'bridge' && bridgeDirection === 'back');
  kuro.classList.toggle('front-facing', currentPlace === 'bridge' && bridgeDirection === 'front');
  kuro.classList.toggle('diagonal-back', currentPlace === 'bridge' && bridgeDirection === 'diagonal-back');
  kuro.classList.toggle('diagonal-front', currentPlace === 'bridge' && bridgeDirection === 'diagonal-front');
  kuro.classList.toggle('running', grounded && moving);
  kuro.classList.toggle('interact', grounded && !moving && !dialogue.hidden);
  kuro.classList.toggle('chair-reading', sittingInChair);
  kuro.classList.toggle('bench-sitting', Boolean(sittingOnBench));

  if (!grounded) {
    // Una sola secuencia por salto: impulso, subida, caída y aterrizaje.
    if (velocityY > 360) frame = 0;
    else if (velocityY > 0) frame = 1;
    else if (velocityY > -360) frame = 2;
    else frame = 3;
    kuro.style.backgroundPositionX = `${-frame * 100}px`;
  } else {
    const frameDelay = sittingInChair ? 700 : moving ? (sprinting ? 75 : 115) : 420;
    if (time - lastSpriteFrameAt > frameDelay) {
      frame = (frame + 1) % 4;
      kuro.style.backgroundPositionX = `${-frame * 100}px`;
      lastSpriteFrameAt = time;
    }
  }
  if (currentPlace === 'bridge' && bridgeDirection !== 'side') kuro.style.backgroundPositionX = '';
}

function loop(time) {
  const dt = Math.min((time - lastTime) / 1000, 0.033);
  lastTime = time;
  if (gameMenu.open || controlsGuide.open || mailComposer.open || !trainRide.hidden || (mapOpenedFromMenu && !activeSave)) {
    requestAnimationFrame(loop);
    return;
  }
  const { controlsEnabled, moving, sprinting } = updateKuroMovement(time, dt);
  updateValparaisoGround();
  updateGoatChase(time, dt);
  updatePackChase(time, dt);
  updateDogProjectile(time, dt);
  updateSeaLionAttack(time, dt);
  // Los golpes pueden cambiar la posición antes de dibujar a Kuro.
  renderKuroPosition(time);

  updateCopoFollower(dt);
  updateCatWalk();
  updateValdiviaVendor(time);
  const interaction = currentInteraction();
  updateBridgeLogInteraction(interaction, time, dt, controlsEnabled);
  updateInteractionPrompt(interaction, time);

  updateCamera(dt, moving);
  updateKuroAnimation(time, moving, sprinting);
  updateHudLocation();
  requestAnimationFrame(loop);
}

const gameMenu = document.querySelector('#game-menu');
const gameMenuHeading = document.querySelector('#game-menu-heading');
const gameMenuSubtitle = document.querySelector('#game-menu-subtitle');
const menuStatus = document.querySelector('#game-menu-status');
const menuKeys = document.querySelector('#game-menu-keys');
const mainMenu = document.querySelector('#main-menu');
const continueMenu = document.querySelector('#continue-menu');
const activeSaveMenu = document.querySelector('#active-save-menu');
const travelMapMenu = document.querySelector('#travel-map-menu');
const travelItemsMenu = document.querySelector('#travel-items-menu');
const travelMenuTabs = document.querySelector('#travel-menu-tabs');
const travelTabButtons = [...travelMenuTabs.querySelectorAll('[data-travel-tab]')];
const travelMenuBack = document.querySelector('#travel-menu-back');
const openMapFromMenu = document.querySelector('#open-map-from-menu');
const inventorySaveRow = document.querySelector('#inventory-save-row');
const inventorySave = document.querySelector('#inventory-save');
const inventoryBell = document.querySelector('#inventory-bell');
const inventoryBellDescription = document.querySelector('#inventory-bell-description');
const inventoryEmpty = document.querySelector('#inventory-empty');
const inventoryNotebook = document.querySelector('#inventory-notebook');
const inventoryNotebookDescription = document.querySelector('#inventory-notebook-description');
const openAlbumFromItems = document.querySelector('#open-album-from-items');
const savedGamesList = document.querySelector('#saved-games');
const travelSavesSummary = document.querySelector('#travel-saves-summary');
const emptySavedGames = document.querySelector('#empty-saved-games');
const newGameForm = document.querySelector('#new-game-form');
const saveName = document.querySelector('#save-name');
const pauseMenu = document.querySelector('#pause-menu');
const exitConfirmMenu = document.querySelector('#exit-confirm-menu');
const exitDoneMenu = document.querySelector('#exit-done-menu');
const saveAndCloseGame = document.querySelector('#save-and-close-game');
const pauseGame = document.querySelector('#pause-game');
const continueGame = document.querySelector('#continue-game');
const newGame = document.querySelector('#new-game');
const openGameMenu = document.querySelector('#open-game-menu');
const openTravelFromPause = document.querySelector('#open-travel-from-pause');
const resumeGame = document.querySelector('#resume-game');
const travelMenuTitle = 'Cuaderno de viaje';
const savePrefix = 'kuro-save-v1-';
const locationNames = {
  street: 'Barrio Yungay',
  house: 'Casa de Kuro',
  plaza: 'Plaza Yungay',
  quinta: 'Quinta Normal',
  museum: 'Museo · Sala de la Ballena',
  station: 'Estación Mapocho',
  valparaiso: 'Valparaíso',
  valdivia: 'Valdivia · Costanera',
  bridge: 'Puente Pedro de Valdivia',
  cave: 'Cueva del Chivato'
};
const hudLocations = {
  // Los límites de cada panorámica están en anchos de pantalla, de derecha a izquierda.
  street: {
    city: 'Santiago',
    areas: [
      { from: 1.08, name: 'Quinta Normal' },
      { from: 0.70, name: 'Plaza Yungay' }
    ]
  },
  house: { city: 'Santiago' },
  plaza: { city: 'Santiago' },
  quinta: { city: 'Santiago' },
  museum: { city: 'Santiago' },
  station: { city: 'Santiago' },
  valparaiso: {
    city: 'Valparaíso',
    name: 'Estación Puerto',
    areas: [
      { from: 1.60, name: 'Cerros' },
      { from: 1.05, name: 'Plaza Sotomayor' },
      { from: 0.40, name: 'Paseo del puerto' }
    ]
  },
  valdivia: {
    city: 'Valdivia',
    name: 'Costanera',
    areas: [
      { from: 3, name: 'Isla Teja' },
      { from: 2, name: 'Feria Fluvial' }
    ]
  },
  bridge: { city: 'Valdivia' },
  cave: { city: 'Valparaíso' }
};

function updateHudLocation() {
  if (gameHud.hidden) return;
  let city;
  let place;
  if (!trainRide.hidden) {
    city = 'En viaje';
    place = trainRide.classList.contains('is-returning') ? 'Tren a Santiago' : 'Tren a Valparaíso';
  } else {
    const location = hudLocations[currentPlace];
    const area = location?.areas?.find(({ from }) => x + 50 >= stageWidth * from);
    city = location?.city ?? 'Chile';
    place = area?.name ?? location?.name ?? locationNames[currentPlace] ?? '';
  }
  if (locationCity.textContent !== city) locationCity.textContent = city;
  if (locationLabel.textContent !== place) locationLabel.textContent = place;
}

const saveDateFormat = new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' });
let activeSave = null;

function readLegacyProgress() {
  const legacyKeys = {
    whalePostcardCollected: ['kuro-whale-postcard', 'collected'],
    quintaPhotoCollected: ['kuro-quinta-photo', 'collected'],
    bridgePostcardCollected: ['kuro-bridge-postcard-v1', 'collected'],
    firstLetterSent: ['kuro-first-letter', 'sent'],
    returnedFromValparaiso: ['kuro-returned-from-valparaiso', 'yes'],
    grandmotherReplyRead: ['kuro-grandmother-reply', 'read'],
    caveBellCollected: ['kuro-cave-bell', 'collected'],
    brumaBellReturned: ['kuro-bruma-bell-returned', 'returned'],
    brumaMet: ['kuro-bruma-met', 'met'],
    valdiviaTracksFound: ['kuro-valdivia-tracks-v1', 'found'],
    valdiviaPassageFound: ['kuro-valdivia-passage-v1', 'found'],
    valdiviaBridgeCrossed: ['kuro-valdivia-bridge-v1', 'crossed'],
    valdiviaFamilyHelped: ['kuro-valdivia-family-v1', 'helped'],
    copoFollowing: ['kuro-valdivia-copo-following-v1', 'yes']
  };
  const progress = Object.fromEntries(Object.entries(legacyKeys).map(([name, [key, value]]) =>
    [name, localStorage.getItem(key) === value]));
  progress.tizneResponse = localStorage.getItem('kuro-tizne-response');
  return progress;
}

function applySavedProgress(progress) {
  ({
    whalePostcardCollected = false, quintaPhotoCollected = false, bridgePostcardCollected = false,
    firstLetterSent = false, returnedFromValparaiso = false, grandmotherReplyRead = false,
    caveBellCollected = false, brumaBellReturned = false, brumaMet = false, tizneResponse = null,
    valdiviaTracksFound = false, valdiviaPassageFound = false, valdiviaBridgeCrossed = false,
    valdiviaFamilyHelped = false, copoFollowing = valdiviaTracksFound, motaConversationComplete = false,
    tizneConversationComplete = false, bridgeLogProgress = 0, bridgeMudLearned = false
  } = progress);
  copoFollowing ||= valdiviaTracksFound;
  bridgeLogProgress = Math.min(1, Math.max(0, Number(bridgeLogProgress) || 0));
  bridgeLogTouched = bridgeLogProgress > 0;
  bridgeLogPlaced = bridgeLogProgress === 1;
  scene.classList.toggle('bridge-log-placed', bridgeLogPlaced);
  scene.classList.toggle('postcard-collected', whalePostcardCollected);
  scene.classList.toggle('quinta-photo-collected', quintaPhotoCollected);
  scene.classList.toggle('bridge-postcard-collected', bridgePostcardCollected);
  scene.classList.toggle('letter-sent', firstLetterSent);
  scene.classList.toggle('valparaiso-complete', Boolean(tizneResponse));
  renderAlbum();
}

function writeSave(save) {
  localStorage.setItem(savePrefix + save.slot, JSON.stringify(save));
}

function listSaves() {
  const saves = [];
  let nextSlot = 1;
  for (const key of Object.keys(localStorage)) {
    if (!key.startsWith(savePrefix)) continue;
    const slot = Number(key.slice(savePrefix.length));
    if (!Number.isSafeInteger(slot) || slot < 1) continue;
    nextSlot = Math.max(nextSlot, slot + 1);
    try {
      const save = JSON.parse(localStorage.getItem(key));
      if (save?.slot === slot && typeof save.name === 'string' &&
          Object.hasOwn(locationNames, save.checkpoint?.place) && save.progress) {
        saves.push(save);
      }
    } catch {
      // Conserva la ranura si el navegador no puede leer su contenido.
    }
  }
  if (localStorage.getItem(savePrefix + '1') === null) {
    const progress = readLegacyProgress();
    if (Object.values(progress).some(Boolean)) {
      const legacySave = { slot: 1, name: '', savedAt: null, checkpoint: { place: 'street' }, progress };
      writeSave(legacySave);
      saves.push(legacySave);
      nextSlot = Math.max(nextSlot, 2);
    }
  }
  saves.sort((a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0) || a.slot - b.slot);
  return { saves, nextSlot };
}

function saveCurrentGame() {
  const save = {
    ...activeSave,
    savedAt: Date.now(),
    checkpoint: {
      place: currentPlace,
      horizontal: (x + 50) / stageWidth,
      depth: (bridgeMudReturn?.to ?? bridgeDepth) / stageHeight,
      facing
    },
    progress: {
      whalePostcardCollected, quintaPhotoCollected, bridgePostcardCollected, firstLetterSent,
      returnedFromValparaiso, grandmotherReplyRead, caveBellCollected, brumaBellReturned, brumaMet,
      tizneResponse, valdiviaTracksFound, valdiviaPassageFound, valdiviaBridgeCrossed, valdiviaFamilyHelped,
      copoFollowing, motaConversationComplete, tizneConversationComplete, bridgeLogProgress, bridgeMudLearned
    }
  };
  try {
    writeSave(save);
    activeSave = save;
    return true;
  } catch {
    return false;
  }
}

function saveAfterMilestone() {
  if (activeSave) saveCurrentGame();
}

function showMenu(view, title) {
  for (const panel of [mainMenu, continueMenu, newGameForm, pauseMenu, activeSaveMenu, travelMapMenu, travelItemsMenu, exitConfirmMenu, exitDoneMenu]) {
    panel.hidden = panel !== view;
  }
  travelMenuTabs.hidden = true;
  travelMenuBack.hidden = true;
  gameMenu.dataset.mode = view === pauseMenu ? 'pause' : 'title';
  gameMenuHeading.textContent = title;
  gameMenuSubtitle.hidden = view !== mainMenu;
  menuStatus.textContent = '';
  menuKeys.textContent = view === exitDoneMenu ? '' : view === mainMenu
    ? '↑ ↓ Elegir · Enter Aceptar' : '↑ ↓ Elegir · Enter Aceptar · Esc Volver';
}

function showMainMenu() {
  showMenu(mainMenu, 'Kuro');
  try {
    const { saves } = listSaves();
    continueGame.disabled = saves.length === 0;
  } catch {
    continueGame.disabled = true;
    menuStatus.textContent = 'El navegador no permite leer las partidas guardadas.';
  }
  (continueGame.disabled ? newGame : continueGame).focus();
}

function startSavedGame(save) {
  activeSave = save;
  applySavedProgress(save.progress);
  if (save.checkpoint.horizontal !== undefined || save.checkpoint.place !== 'street') {
    changeLocation(save.checkpoint.place, 'default', save.checkpoint);
  } else {
    updateSceneRenderer();
  }
  gameMenu.close();
  gameHud.hidden = false;
  updateHudLocation();
  pauseGame.hidden = false;
  game.focus();
}

function showPauseMenu() {
  showMenu(pauseMenu, 'Partida en pausa');
  resumeGame.focus();
}

function openPauseMenu() {
  if (!activeSave || transitioning || gameMenu.open || !trainRide.hidden) return;
  clearPlayerKeys();
  showPauseMenu();
  gameMenu.showModal();
}

function resumePlaying() {
  gameMenu.close();
  game.focus();
}

function saveDisplayName(save) {
  return save.name ? `Partida ${save.slot} · ${save.name}` : `Partida ${save.slot}`;
}

function describeSave(save) {
  const date = Number.isFinite(save.savedAt) ? saveDateFormat.format(save.savedAt) : 'Progreso anterior';
  return `${locationNames[save.checkpoint.place]} · ${date}`;
}

function renderSaveList(list, saves, activate = null) {
  list.replaceChildren();
  saves.forEach((save, index) => {
    const row = document.createElement('li');
    const card = document.createElement(activate ? 'button' : 'div');
    const title = document.createElement('strong');
    const details = document.createElement('span');
    title.textContent = saveDisplayName(save);
    details.textContent = describeSave(save);
    card.className = 'save-card';
    if (activate) {
      card.type = 'button';
      card.classList.toggle('latest-save', index === 0);
      card.addEventListener('click', () => activate(save));
    }
    card.append(title, details);
    row.append(card);
    list.append(row);
  });
}

function showSavedGamesMenu() {
  showMenu(continueMenu, 'Continuar partida');
  savedGamesList.replaceChildren();
  try {
    const { saves } = listSaves();
    renderSaveList(savedGamesList, saves, startSavedGame);
    if (!saves.length) menuStatus.textContent = 'Aún no hay partidas guardadas.';
  } catch {
    menuStatus.textContent = 'No se pudieron cargar las partidas.';
  }
  (savedGamesList.querySelector('button') ?? continueMenu.querySelector('button:not([hidden])')).focus();
}

function showTravelSaves() {
  showMenu(activeSaveMenu, travelMenuTitle);
  travelSavesSummary.replaceChildren();
  emptySavedGames.hidden = true;
  try {
    const saves = activeSave ? [activeSave] : listSaves().saves;
    renderSaveList(travelSavesSummary, saves);
    emptySavedGames.hidden = saves.length > 0;
  } catch {
    menuStatus.textContent = 'No se pudo leer el progreso guardado.';
  }
}

function showNewGameMenu() {
  showMenu(newGameForm, 'Nueva partida');
  saveName.value = '';
  try {
    saveName.placeholder = `Partida ${listSaves().nextSlot}`;
  } catch {
    saveName.placeholder = '';
  }
  saveName.focus();
}

function showGameHub() {
  selectTravelTab('saves');
}

function drawInventory(progress) {
  const hasBell = Boolean(progress?.caveBellCollected);
  inventoryBell.hidden = !hasBell;
  inventoryBell.open = false;
  inventoryNotebook.hidden = !progress;
  inventoryNotebook.open = false;
  openAlbumFromItems.hidden = !activeSave;
  inventoryEmpty.hidden = Boolean(progress);
  if (progress) {
    const memories = unlockedAlbumPages(progress).length;
    inventoryNotebookDescription.textContent = memories
      ? `Fotos y postales reunidas en esta partida: ${memories}.`
      : 'Todavía no tiene fotos ni postales.';
  }
  inventoryBellDescription.textContent = progress?.brumaBellReturned
    ? 'Devuelto a Doña Bruma. Kuro conserva el doble salto.'
    : 'Encontrado en la Cueva del Chivato. Permite saltar otra vez en el aire.';
}

function showInventory() {
  showMenu(travelItemsMenu, travelMenuTitle);
  inventorySaveRow.hidden = true;
  if (activeSave) {
    drawInventory({ ...albumProgress(), caveBellCollected, brumaBellReturned });
    return;
  }
  drawInventory();
  try {
    const { saves } = listSaves();
    inventorySave.replaceChildren();
    for (const save of saves) {
      const option = new Option(saveDisplayName(save), String(save.slot));
      inventorySave.append(option);
    }
    inventorySaveRow.hidden = saves.length === 0;
    inventoryEmpty.textContent = 'Aún no hay partidas guardadas.';
    drawInventory(saves[0]?.progress);
  } catch {
    menuStatus.textContent = 'No se pudo leer el inventario.';
  }
}

function selectTravelTab(tab) {
  if (tab === 'map') showMenu(travelMapMenu, travelMenuTitle);
  else if (tab === 'items') showInventory();
  else showTravelSaves();

  travelTabButtons.forEach(button => {
    const selected = button.dataset.travelTab === tab;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  travelMenuBack.textContent = activeSave ? 'Volver a la pausa' : 'Volver al menú principal';
  travelMenuBack.hidden = false;
  travelMenuTabs.hidden = false;
  menuKeys.textContent = '← → Pestañas · ↑ ↓ Elegir · Enter Aceptar · Esc Volver';
  travelTabButtons.find(button => button.dataset.travelTab === tab).focus();
}

function goBackInMenu() {
  const fromCuaderno = !travelMenuTabs.hidden;
  const fromNewGame = !newGameForm.hidden;
  if (activeSave && fromCuaderno) {
    showPauseMenu();
    openTravelFromPause.focus();
    return;
  }
  showMainMenu();
  if (fromCuaderno) openGameMenu.focus();
  else if (fromNewGame) newGame.focus();
}

function exitGame(saveBeforeExit) {
  if (saveBeforeExit && !saveCurrentGame()) {
    menuStatus.textContent = 'No se pudo guardar la partida.';
    return;
  }
  phaserRenderer?.setLocation(null);
  gameHud.hidden = true;
  showMenu(exitDoneMenu, 'Sesión terminada');
  if (saveBeforeExit) menuStatus.textContent = 'Partida guardada.';
  document.querySelector('#restart-after-exit').focus();
  window.close();
}

function confirmGameExit() {
  if (!activeSave) {
    exitGame(false);
    return;
  }
  showMenu(exitConfirmMenu, 'Salir del juego');
  document.querySelector('#exit-save-name').textContent = `¿Guardar los últimos cambios en ${saveDisplayName(activeSave)}?`;
  saveAndCloseGame.focus();
}

continueGame.addEventListener('click', showSavedGamesMenu);
openGameMenu.addEventListener('click', showGameHub);
newGame.addEventListener('click', showNewGameMenu);
openTravelFromPause.addEventListener('click', showGameHub);
travelTabButtons.forEach(button => button.addEventListener('click', () => selectTravelTab(button.dataset.travelTab)));
openMapFromMenu.addEventListener('click', () => {
  gameMenu.close();
  openWorldMap(true);
});
openAlbumFromItems.addEventListener('click', () => {
  if (!activeSave) return;
  albumOpenedFromItems = true;
  gameMenu.close();
  openAlbum();
});
inventorySave.addEventListener('change', () => {
  try {
    const { saves } = listSaves();
    drawInventory(saves.find(save => save.slot === Number(inventorySave.value))?.progress);
  } catch {
    drawInventory();
    menuStatus.textContent = 'No se pudo leer el inventario.';
  }
});

newGameForm.addEventListener('submit', (event) => {
  event.preventDefault();
  try {
    const { nextSlot } = listSaves();
    const save = {
      slot: nextSlot,
      name: saveName.value.trim(),
      savedAt: Date.now(),
      checkpoint: { place: 'street' },
      progress: {}
    };
    writeSave(save);
    startSavedGame(save);
  } catch {
    menuStatus.textContent = 'No se pudo crear la partida. Revisa si el navegador permite guardar datos.';
  }
});

gameMenu.querySelectorAll('[data-menu-back]').forEach(button => button.addEventListener('click', goBackInMenu));
gameMenu.querySelectorAll('[data-game-exit]').forEach(button => button.addEventListener('click', confirmGameExit));
saveAndCloseGame.addEventListener('click', () => exitGame(true));
document.querySelector('#close-without-saving').addEventListener('click', () => exitGame(false));
document.querySelector('#cancel-game-exit').addEventListener('click', showPauseMenu);
document.querySelector('#restart-after-exit').addEventListener('click', () => window.location.reload());
controlsButton.addEventListener('click', toggleControlsGuide);
controlsGuide.addEventListener('close', () => {
  if (document.activeElement === controlsButton) game.focus({ preventScroll: true });
});
pauseGame.addEventListener('click', openPauseMenu);
resumeGame.addEventListener('click', resumePlaying);
function saveFromMenu() {
  menuStatus.textContent = saveCurrentGame() ? 'Partida guardada.' : 'No se pudo guardar la partida.';
}
document.querySelector('#save-game').addEventListener('click', saveFromMenu);
document.querySelector('#save-and-exit').addEventListener('click', () => {
  if (!saveCurrentGame()) {
    menuStatus.textContent = 'No se pudo guardar la partida.';
    return;
  }
  window.location.reload();
});
function handleGameMenuKeyDown(event) {
  if (event.altKey || event.ctrlKey || event.metaKey || event.defaultPrevented) return;
  const tabIndex = travelTabButtons.indexOf(event.target);
  if (tabIndex !== -1 && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
    event.preventDefault();
    let next = tabIndex + (event.key === 'ArrowLeft' ? -1 : 1);
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = travelTabButtons.length - 1;
    const tab = travelTabButtons[(next + travelTabButtons.length) % travelTabButtons.length];
    selectTravelTab(tab.dataset.travelTab);
    return;
  }
  if (!['ArrowUp', 'ArrowDown'].includes(event.key) || event.target.matches('input, select, textarea')) return;
  const currentPanel = gameMenu.querySelector('.game-menu-view:not([hidden])');
  const controls = [...currentPanel.querySelectorAll('button, input, select, summary')].filter(control =>
    !control.disabled && control.getClientRects().length &&
    (control.matches('summary') || !control.closest('details:not([open])')));
  if (!travelMenuTabs.hidden) {
    controls.unshift(travelMenuTabs.querySelector('[aria-selected="true"]'));
    controls.push(travelMenuBack);
  }
  if (!controls.length) return;
  event.preventDefault();
  const delta = event.key === 'ArrowDown' ? 1 : -1;
  const current = controls.indexOf(event.target);
  const next = current === -1 ? (delta === 1 ? 0 : controls.length - 1) : current + delta;
  controls[(next + controls.length) % controls.length].focus();
}

gameMenu.addEventListener('keydown', handleGameMenuKeyDown);
gameMenu.addEventListener('cancel', (event) => {
  event.preventDefault();
  if (!exitDoneMenu.hidden) return;
  if (!exitConfirmMenu.hidden) showPauseMenu();
  else if (activeSave && !pauseMenu.hidden) resumePlaying();
  else if (mainMenu.hidden) goBackInMenu();
});

const viewportObserver = new ResizeObserver(fitGameViewport);
viewportObserver.observe(game);
viewportObserver.observe(gameHud);
addEventListener('resize', fitGameViewport);
addEventListener('scroll', fitGameViewport);
fitGameViewport();

updateHudHealth(sootHitLimit);
requestAnimationFrame(loop);

const requestedPreviewPlace = previewParams.get('preview');
const previewPlace = requestedPreviewPlace === 'sotomayor' ? 'valparaiso' : ['plaza', 'quinta'].includes(requestedPreviewPlace) ? 'street' : requestedPreviewPlace;
const hasPreviewPlace = Object.hasOwn(locationNames, previewPlace);
const standalonePreviewOptions = ['postcard', 'photo', 'bell', 'jump', 'story', 'tizne', 'album', 'photoView', 'map', 'attack'];

if (hasPreviewPlace || standalonePreviewOptions.some(option => previewParams.has(option))) {
  // Las vistas de desarrollo usan el progreso anterior sin modificar partidas.
  try {
    applySavedProgress(readLegacyProgress());
  } catch {
    applySavedProgress({});
  }
  gameHud.hidden = false;
  if (!hasPreviewPlace) updateSceneRenderer();
  updateHudLocation();
} else {
  if (window.location.hash === '#menu') {
    window.history.replaceState(null, '', window.location.href.split('#')[0]);
    showGameHub();
  } else {
    showMainMenu();
  }
  gameMenu.showModal();
}

if (hasPreviewPlace) {
  const previewSpot = previewParams.get('at');
  const previewEntry = requestedPreviewPlace === 'quinta'
    ? 'at-quinta'
    : previewPlace === 'house' && previewParams.get('chair') === 'sit'
      ? 'at-chair'
    : previewPlace === 'street' && ['neighborhood', 'seam', 'plaza', 'mota', 'quinta', 'museum'].includes(previewSpot)
      ? `at-${previewSpot}`
    : previewPlace === 'station' && ['estafeta', 'train'].includes(previewSpot)
      ? `at-${previewSpot}`
    : previewPlace === 'valparaiso' && ['train', 'tizne', 'hills', 'lower-hills', 'mid-hills', 'bruma', 'cave', 'connector', 'station-seam', 'plaza-seam'].includes(previewSpot)
      ? `at-${previewSpot}`
    : previewPlace === 'valdivia' && ['coipo', 'pier', 'market', 'vendor', 'passage', 'island'].includes(previewSpot)
      ? `at-${previewSpot}`
    : previewPlace === 'cave' && ['goat', 'sea-lion', 'dog', 'middle', 'bird', 'bell'].includes(previewSpot)
      ? `at-${previewSpot}`
    : previewPlace === 'bridge' && ['log', 'mud', 'refuge'].includes(previewSpot)
      ? `at-${previewSpot}`
      : 'default';
  if (previewPlace === 'valdivia' && previewEntry === 'at-island') valdiviaBridgeCrossed = true;
  requestAnimationFrame(() => changeLocation(previewPlace, previewEntry));
}
if (previewParams.get('postcard') === 'collected') whalePostcardCollected = true;
if (previewParams.get('photo') === 'collected') quintaPhotoCollected = true;
if (previewPlace === 'station' && previewParams.get('letter') === 'unsent') firstLetterSent = false;
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
