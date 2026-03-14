/* ============================================
   LES CHRONIQUES DU ROYAUME — SCRIPT V3
   ============================================ */

// ─── ÉLÉMENTS DOM ───────────────────────────
const intro = document.getElementById("intro");
const doorLeft = document.getElementById("doorLeft");
const doorRight = document.getElementById("doorRight");
const enterBtn = document.getElementById("enterBtn");
const loadingOverlay = document.getElementById("loadingOverlay");
const progressBar = document.getElementById("progressBar");
const loadingStatus = document.getElementById("loading-status");
const site = document.getElementById("site");
const ambiance = document.getElementById("ambiance");
const volumeControl = document.getElementById("volumeControl");
const muteToggle = document.getElementById("muteToggle");

let catalogueData = [];

// ─── MESSAGES DE CHARGEMENT ─────────────────
const loadingText = [
    "Lecture des parchemins anciens...",
    "Inspection des archives royales...",
    "Préparation du catalogue...",
    "Ouverture imminente des portes..."
];

// ─── PARTICULES ─────────────────────────────
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function createParticle() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: -(Math.random() * 0.6 + 0.2),
        opacity: Math.random() * 0.6 + 0.1,
        life: 0,
        maxLife: Math.random() * 200 + 100,
        color: Math.random() > 0.7 ? '#e8c96a' : '#c6a84a'
    };
}

for (let i = 0; i < 80; i++) particles.push(createParticle());

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
        p.life++;
        p.x += p.speedX;
        p.y += p.speedY;

        const progress = p.life / p.maxLife;
        const opacity = progress < 0.1 ? progress * 10 * p.opacity :
            progress > 0.8 ? (1 - progress) * 5 * p.opacity : p.opacity;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, opacity);
        ctx.fill();
        ctx.globalAlpha = 1;

        if (p.life >= p.maxLife || p.y < -10) particles[i] = createParticle();
    });

    requestAnimationFrame(animateParticles);
}
animateParticles();

// ─── BOUTON ENTRER ───────────────────────────
enterBtn.addEventListener("click", () => {
    enterBtn.style.opacity = "0";
    enterBtn.style.transform = "scale(0.9)";
    enterBtn.style.transition = "all 0.4s";
    enterBtn.style.pointerEvents = "none";

    loadingOverlay.classList.add("visible");
    loadingOverlay.style.display = "block";
    setTimeout(() => loadingOverlay.style.opacity = "1", 50);

    startLoading();
});

// ─── BARRE DE CHARGEMENT ────────────────────
function startLoading() {
    let progress = 0;
    let textIndex = 0;

    const interval = setInterval(() => {
        progress += Math.random() * 4 + 2;
        if (progress > 100) progress = 100;

        progressBar.style.width = progress + "%";

        const step = Math.floor(progress / 25);
        if (step > textIndex && textIndex < loadingText.length) {
            loadingStatus.textContent = loadingText[textIndex];
            textIndex++;
        }

        if (progress >= 100) {
            clearInterval(interval);
            loadingStatus.textContent = "Bienvenue dans le Royaume...";

            setTimeout(() => {
                doorLeft.classList.add("open-left");
                doorRight.classList.add("open-right");
            }, 300);

            setTimeout(() => {
                intro.style.display = "none";
                site.classList.remove("hidden");
                initAudio();
                loadCatalogue();
            }, 2400);
        }
    }, 60);
}

// ─── AUDIO ───────────────────────────────────
function initAudio() {
    const saved = localStorage.getItem("royalVolume");
    const vol = saved !== null ? parseFloat(saved) : 0.3;

    ambiance.volume = vol;
    volumeControl.value = vol;

    ambiance.play().catch(() => {
        // Autoplay bloqué, l'utilisateur devra interagir
    });
}

volumeControl.addEventListener("input", () => {
    ambiance.volume = volumeControl.value;
    localStorage.setItem("royalVolume", volumeControl.value);
    muteToggle.textContent = ambiance.volume > 0 ? "🔊" : "🔇";
});

muteToggle.addEventListener("click", () => {
    if (ambiance.volume > 0) {
        ambiance.volume = 0;
        volumeControl.value = 0;
        muteToggle.textContent = "🔇";
    } else {
        const vol = parseFloat(localStorage.getItem("royalVolume")) || 0.3;
        ambiance.volume = vol;
        volumeControl.value = vol;
        muteToggle.textContent = "🔊";
    }
});

// ─── CATALOGUE (modifie ici directement) ─────
const CATALOGUE = [
    {
        "nom": "Comment traduire cet amour ?",
        "description": "Ju Ho-jin est un interprète polyglotte talentueux. Par la force des choses, il devient le traducteur attitré d'une célèbre actrice, Cha Mu-hee. Le tandem s'embarque pour le tournage d'une émission internationale qui doit les mener en Corée du Sud, en Italie, au Canada ou encore au Japon… L'objectif ? Démontrer que l'amour transcende les barrières de la langue et de la culture. Or, Ho-jin et Mu-hee ne sauraient être plus opposés dans leurs personnalités comme leurs convictions... Leurs différences rendent leur périple houleux et provoquent de nombreuses frictions au sein de leur duo ! En laissant à chacun la chance de se dévoiler, parviendront-ils à se comprendre ?",
        "note": 3,
        "categorie": "Série",
        "date": "2026-02-22",
        "image": "assets/Commenttraduirecetamour.png",
        "lien": "https://1fichier.com/?xjiyjk371w621z5y98m4"
    },
    {
        "nom": "The Substance",
        "description": "The Substance, ou La Substance au Québec, est un drame de body horror franco-américano-britannique coproduit, écrit et réalisé par Coralie Fargeat, sorti en 2024. Le film met en scène Elisabeth Sparkle, présentatrice vedette d'une émission d'aérobic, licenciée par son patron le jour de ses cinquante ans à cause de son âge. Le moral au plus bas, elle reçoit une proposition inattendue, celle d'un mystérieux laboratoire lui proposant une substance miraculeuse.",
        "note": 3,
        "categorie": "Film",
        "date": "2026-02-22",
        "image": "https://www.avoir-alire.com/IMG/jpg/120x160-the-substance-mosaic-date-hd.b0728b3f-afdd-4493-97d7-9b29e9849b80.jpg",
        "lien": "https://1fichier.com/?ecbjtugi9jxal7ftz5t2"
    },
    {
        "nom": "Captain America : Le Soldat de l'hiver",
        "description": "Captain America : Le Soldat de l'hiver est un film de super-héros américain réalisé par Anthony et Joe Russo, sorti en 2014. Il est la neuvième production de l'univers cinématographique Marvel. Steve Rogers vit désormais à Washington, D.C., où il s'efforce de s'adapter au monde moderne.",
        "note": 4,
        "categorie": "Film",
        "date": "2026-02-22",
        "image": "https://fr.web.img5.acsta.net/c_310_420/pictures/14/01/31/17/06/486036.jpg",
        "lien": "https://1fichier.com/?ecbjtugi9jxal7ftz5t2"
    },
    {
        "nom": "Tetris",
        "description": "Henk Rogers, développeur et promoteur de jeux vidéo, voit pour la première fois le jeu Tetris à un salon professionnel en 1988. Il prend alors tous les risques pour lui et sa famille en se rendant en URSS pour négocier les droits de publication afin de commercialiser le jeu dans le monde entier.",
        "note": 4,
        "categorie": "Film",
        "date": "2026-02-22",
        "image": "https://fr.web.img4.acsta.net/pictures/23/03/03/09/57/3773062.jpg",
        "lien": "https://1fichier.com/?334d567ap8hrbjg7nq10"
    },
    {
        "nom": "Assoiffés (Tracy Wolff)",
        "description": "Cela fait maintenant 10 ans que des portails apparaissent dans le monde, ouvrant des passages vers des donjons et des univers parallèles. Ces individus, connus sous le nom de Chasseurs, sont chargés de combattre des monstres mortels pour protéger l'humanité d'une extinction certaine.",
        "note": 5,
        "categorie": "Livre",
        "date": "2026-02-22",
        "image": "assets/Assoiffés(TracyWolff).jpg",
        "tomes": [
            { "label": "Tome 2", "lien": "livre/Assoiffes_T2_Foudroyes_-_Tracy_Wolff.pdf", "zip": "livre/Assoiffés T2 Foudroyés - Tracy Wolff.zip" },
            { "label": "Tome 3", "lien": "livre/Assoiffes_T3_Convoites_-_Tracy_Wolff.pdf", "zip": "livre/Assoiffés T3 Convoités - Tracy Wolff.zip" }
        ]
    },
    {
        "nom": "Solo Leveling",
        "description": "Sung Jinwoo, un chasseur notoirement faible de classe E, se bat désespérément pour survivre. Un mystérieux programme appelé Système le sélectionne comme joueur unique, lui octroyant une compétence extrêmement rare : celle de monter en puissance à chaque victoire.",
        "note": 5,
        "categorie": "Livre",
        "date": "2026-02-22",
        "image": "assets/sololeveling.jpg",
        "tomes": [
            { "label": "Tome 0", "lien": "livre/Solo Leveling - Tome 0.pdf", "zip": "livre/Solo Leveling - Tome 0.zip" },
            { "label": "Tome 1", "lien": "livre/Solo Leveling - Tome 1.pdf", "zip": "livre/Solo Leveling - Tome 1.zip" },
            { "label": "Tome 3", "lien": "livre/Solo Leveling - Tome 3.pdf", "zip": "livre/Solo Leveling - Tome 3.zip" }
        ]
    },
    {
        "nom": "Le royaume des ombres : Tenebräe tome 3",
        "description": "La meute est au bord de la rupture, et l'hostilité à mon égard se ravive. Pour honorer ma dette envers les Nychtans, je dois percer les secrets du monstre qui vit en moi. Mais tandis que je découvre enfin des réponses et que la confiance avec mes compagnons commence à se reconstruire, tout bascule à nouveau.",
        "note": 4,
        "categorie": "Livre",
        "date": "2026-02-22",
        "image": "assets/LeroyaumedesombresTenebräetome3.jpg",
        "tomes": [
            { "label": "Tome 3", "lien": "livre/Le-royaume-des-ombres Tenebräe.pdf", "zip": "livre/Le-royaume-des-ombres Tenebräe.zip" }
        ]
    },
    {
        "nom": "Girl in pieces - Kathleen Glasgow",
        "description": "Girl in pieces est le portrait profondément émouvant d'une adolescente dans un monde qui ne lui doit rien et lui a tant pris, et du chemin qu'elle entreprend pour se réparer.",
        "note": 4,
        "categorie": "Livre",
        "date": "2026-02-22",
        "image": "assets/Girlinpieces-KathleenGlasgow.jpg",
        "lien": "livre/Girl-in-pieces-Kathleen-Glasgow.pdf",
        "zip": "livre/Girl-in-pieces-Kathleen-Glasgow.zip"
    },
    {
        "nom": "Mon combat",
        "description": "Mein Kampf est un livre rédigé par Adolf Hitler entre 1924 et 1925. L'ouvrage contient des éléments autobiographiques et l'histoire des débuts du NSDAP. L'auteur expose la conception du monde du national-socialisme, avec ses composantes hégémoniques, belliqueuses, racistes et antisémites.",
        "note": 0,
        "categorie": "Livre",
        "date": "2026-02-22",
        "image": "assets/Mein_Kampf.jpg",
        "lien": "livre/Mon_Combat_Mein_Kampf_-_Adolf_Hitler.pdf",
        "zip": "livre/Mon_Combat_Mein_Kampf_-_Adolf_Hitler.zip"
    },
    {
        "nom": "Harry Potter",
        "description": "Harry Potter est une série littéraire de low fantasy écrite par l'auteure britannique J. K. Rowling, dont la suite romanesque s'est achevée en 2007. Une pièce de théâtre, considérée comme la huitième histoire officielle, a été jouée et publiée en 2016.",
        "note": 5,
        "categorie": "Livre",
        "date": "2026-02-22",
        "image": "assets/HarryPotter.jpg",
        "tomes": [
            { "label": "Tome 1", "lien": "livre/harry-potter-1-lecole-des-sorciers.pdf", "zip": "livre/harry-potter-1-lecole-des-sorciers.zip" },
            { "label": "Tome 2", "lien": "livre/harry-potter-2-la-chambre-des-secrets.pdf", "zip": "livre/harry-potter-2-la-chambre-des-secrets.zip" },
            { "label": "Tome 3", "lien": "livre/harry-potter-3-le-prisonnier-dazkaban.pdf", "zip": "livre/harry-potter-3-le-prisonnier-dAzkaban.zip" },
            { "label": "Tome 4", "lien": "livre/harry-potter-4-la-coupe-de-feu.pdf", "zip": "livre/harry-potter-4-la-coupe-de-feu.zip" },
            { "label": "Tome 5", "lien": "livre/harry-potter-5-lordre-du-phoenix.pdf", "zip": "livre/harry-potter-5-lordre-du-phoenix.zip" },
            { "label": "Tome 6", "lien": "livre/harry-potter-6-le-prince-de-sang-mecc82lecc81.pdf", "zip": "livre/harry-potter-6-le-prince-de-sang.zip" },
            { "label": "Tome 7", "lien": "livre/harry-potter-7-les-reliques-de-la-mort.pdf", "zip": "livre/harry-potter-7-les-reliques-de-la-mort.zip" },
            { "label": "Tome 7/2", "lien": "livre/J.K.Rowling-Harry-Potter-et-l-enfant-maudit-Parties-1-et-21476458495304.pdf", "zip": "livre/J.K.Rowling-Harry-Potter-et-l-enfant-maudit-Parties-1-et-21476458495304.zip" }
        ]
    },
    {
        "nom": "Robert Jordan — La Roue du Temps",
        "description": "La Roue du temps est une série de romans de fantasy écrits par l'écrivain américain Robert Jordan. Le premier volume est paru en 1990. L'auteur est décédé en 2007 sans avoir achevé la série, mais il a laissé assez de notes pour qu'un autre écrivain puisse terminer son œuvre.",
        "note": 3,
        "categorie": "Livre",
        "date": "2026-02-22",
        "image": "assets/La_Roue_Du_Temps_Nouveau_Robert_Jordan.jpg",
        "tomes": [
            { "label": "Bonus", "lien": "livre/Le_sentier_des_dagues_Robert_Jordan_La_roue_du_temps_8a_Robert_Jordan_La_RENDEZ-VOUS_AILLEURS_2008-01-10_FLEUVE_EDITIONS.pdf", "zip": "livre/Le_sentier_des_dagues_Robert_Jordan_La_roue_du_temps_8a_Robert_Jordan_La_RENDEZ-VOUS_AILLEURS_2008-01-10_FLEUVE_EDITIONS.zip" },
            { "label": "Tome 0", "lien": "livre/T0_-_La_Roue_Du_Temps_-_Nouveau_-_Robert_Jordan_-_La_Roue_Du_Temp.pdf", "zip": "livre/T0_-_La_Roue_Du_Temps_-_Nouveau_-_Robert_Jordan_-_La_Roue_Du_Temp.zip" },
            { "label": "Tome 1", "lien": "livre/T1_-_La_Roue_Du_Temps_-_La_Roue_-_Robert_Jordan_-_La_Roue_Du_Temp.pdf", "zip": "livre/T1_-_La_Roue_Du_Temps_-_La_Roue_-_Robert_Jordan_-_La_Roue_Du_Temp.zip" },
            { "label": "Tome 3", "lien": "livre/T3_-_La_Roue_Du_Temps_-_Le_Cor_-_Robert_Jordan_-_La_Roue_Du_Temp.pdf", "zip": "livre/T3_-_La_Roue_Du_Temps_-_Le_Cor_-_Robert_Jordan_-_La_Roue_Du_Temp.zip" },
            { "label": "Tome 4", "lien": "livre/T4_-_La_Roue_Du_Temps_-_La_Bann_-_Robert_Jordan_-_La_Roue_Du_Temp.pdf", "zip": "livre/T4_-_La_Roue_Du_Temps_-_La_Bann_-_Robert_Jordan_-_La_Roue_Du_Temp.zip" },
            { "label": "Tome 5", "lien": "livre/T5_-_La_Roue_Du_Temps_-_Le_Drag_-_Robert_Jordan_-_La_Roue_Du_Temp.pdf", "zip": "livre/T5_-_La_Roue_Du_Temps_-_Le_Drag_-_Robert_Jordan_-_La_Roue_Du_Temp.zip" },
            { "label": "Tome 6", "lien": "livre/T6_-_La_Roue_Du_Temps_-_Le_Jeu_-_Robert_Jordan_-_La_Roue_Du_Temp.pdf", "zip": "livre/T6_-_La_Roue_Du_Temps_-_Le_Jeu_-_Robert_Jordan_-_La_Roue_Du_Temp.zip" },
            { "label": "Tome 7", "lien": "livre/T7_-_La_Roue_Du_Temps_-_La_Mont_-_Robert_Jordan_-_La_Roue_Du_Temp.pdf", "zip": "livre/T7_-_La_Roue_Du_Temps_-_La_Mont_-_Robert_Jordan_-_La_Roue_Du_Temp.zip" },
            { "label": "Tome 8", "lien": "livre/T8_-_La_Roue_du_Temps_-_Tourmen_-_Robert_Jordan_-_La_Roue_Du_Temp.pdf", "zip": "livre/T8_-_La_Roue_du_Temps_-_Tourmen_-_Robert_Jordan_-_La_Roue_Du_Temp.zip" },
            { "label": "Tome 9", "lien": "livre/T9_-_La_Roue_Du_Temps_-_Etincel_-_Robert_Jordan_-_La_Roue_Du_Temp.pdf", "zip": "livre/T9_-_La_Roue_Du_Temps_-_Etincel_-_Robert_Jordan_-_La_Roue_Du_Temp.zip" },
            { "label": "Tome 10", "lien": "livre/T10_-_La_Roue_Du_Temps_-_Les_Fe_-_Robert_Jordan_-_La_Roue_Du_Temp.pdf", "zip": "livre/T10_-_La_Roue_Du_Temps_-_Les_Fe_-_Robert_Jordan_-_La_Roue_Du_Temp.zip" }
        ]
    },
    {
        "nom": "Loups du zodiaque",
        "description": "En tant que paria à moitié humaine de la meute du Cancer, j'ai été battue et maltraitée toute ma vie. Acquérir ma forme de louve et trouver mon partenaire destiné est ma seule chance de changer de meute et d'espérer une vie meilleure.",
        "note": 5,
        "categorie": "Livre",
        "date": "2026-02-22",
        "image": "assets/Loupsduzodiaque.jpg",
        "tomes": [
            { "label": "Tome 1", "lien": "livre/Loups.Du.Zodiaque.T1.Touche.Par.La.Lune.2022.Elizabeth.Briggs_1.pdf", "zip": "livre/Loups.Du.Zodiaque.T1.Touche.Par.La.Lune.2022.Elizabeth.Briggs_1.zip" },
            { "label": "Tome 2", "lien": "livre/Loups.Du.Zodiaque.T2.Rejete.Par.Les.Etoiles.2022.Elizabeth.Briggs_1.pdf", "zip": "livre/Loups.Du.Zodiaque.T2.Rejete.Par.Les.Etoiles.2022.Elizabeth.Briggs_1.zip" },
            { "label": "Tome 3", "lien": "livre/Loups.Du.Zodiaque.T3.Dfie.Par.Le.Soleil.2022.Elizabeth.Briggs_1.pdf", "zip": "livre/Loups.Du.Zodiaque.T3.Dfie.Par.Le.Soleil.2022.Elizabeth.Briggs_1.zip" },
            { "label": "Tome 4", "lien": "livre/Loups.Du.Zodiaque.T4.Guide.Par.Le.Zodiaque.2022.Elizabeth.Briggs_1.pdf", "zip": "livre/Loups.Du.Zodiaque.T4.Guide.Par.Le.Zodiaque.2022.Elizabeth.Briggs_1.zip" }
        ]
    },
    {
        "nom": "Anna Briac : le baiser des ombres",
        "description": "Ils m'ont trahie. Abandonnée. J'ai été torturée. Et la dette que j'ai contractée pour survivre risque de me coûter bien plus cher que prévu... Tenebräe est une série de romance fantasy avec des métamorphes sombres et protecteurs, et une louve aux pouvoirs mystérieux qui n'a pas à choisir entre ses compagnons.",
        "note": 4,
        "categorie": "Livre",
        "date": "2026-02-22",
        "image": "assets/AnnaBriaclebaiserdesombres.jpg",
        "lien": "livre/Le-baiser-des-ombres-Anna-Briac-Tenebrae_-2_-2024-Anna-Briac.pdf",
        "zip": "livre/Anna Briac le baiser des ombres.zip"
    },
    {
        "nom": "BeamNG",
        "description": "BeamNG.drive est un jeu de simulation de véhicules en temps réel développé et édité par la startup BeamNG et qui fonctionne sous Microsoft Windows et de manière expérimentale sous Linux. ",
        "note": 5,
        "categorie": "Jeu",
        "date": "2026-03-03",
        "image": "assets/BeamNG.png",
        "lien": "https://multiup.io/9c987cb2801737e8ea230d07f266bd7b"
    },
    {
        "nom": "Lethal Company",
        "description": "Lethal Company est un jeu vidéo d'horreur indépendant coopératif actuellement en accès anticipé depuis le 23 octobre 2023 sur Windows. Il est développé et auto-édité par un seul développeur, Zeekerss.",
        "note": 5,
        "categorie": "Jeu",
        "date": "2026-03-03",
        "image": "assets/LethalCompany.png",
        "lien": "https://multiup.io/38f4f208178ee57898addfc650923b4e"
    },
    {
        "nom": "RV There Yet?",
        "description": "Traduit de l'anglais-RV There Yet? est un jeu vidéo d'aventure coopératif développé et édité par le studio suédois Nuggets Entertainment. Sorti le 21 octobre 2025, il a rapidement rencontré un vif succès sur la plateforme Steam.",
        "note": 5,
        "categorie": "Jeu",
        "date": "2026-03-03",
        "image": "assets/RVThereYet.png",
        "lien": "https://multiup.io/4fcbcd7b7e1517ef8bc59b2bcae09d44"
    },
    {
        "nom": "Poppy Playtime",
        "description": "Poppy Playtime est un jeu vidéo de type survival horror développé et publié par le développeur indépendant américain Mob Entertainment.",
        "note": 4,
        "categorie": "Jeu",
        "date": "2026-03-03",
        "image": "assets/PoppyPlaytime.jpg",
        "lien": "https://multiup.io/55ec5613070f8b1be8fbb240dbb0f253"
    },
    {
        "nom": "Resident Evil 2",
        "description": "Resident Evil 2 est un jeu vidéo d'horreur en vue à la troisième personne développé et édité par Capcom, sorti le 25 janvier 2019 sur Microsoft Windows, PlayStation 4 et Xbox One. La 4K, les 60 images par seconde et le HDR sont compatibles sur Microsoft Windows et sur les consoles Xbox One X et PS4 Pro.",
        "note": 5,
        "categorie": "Jeu",
        "date": "2026-03-05",
        "image": "assets/ResidentEvil2.png",
        "lien": "https://multiup.io/669c144364c6563474220e27ad970013"
    },
    {
        "nom": "Pokémon Violet",
        "description": "ROM Pokemon Violet avec emulateur Ryujinx. Le fichier Randomizer-X contient un dossier romfs a placer ici : Faire clic droit sur le jeu dans Ryujinx → Ouvrir le dossier des mods, puis creer un dossier Randomizer et placer le dossier romfs dedans. Ensuite, lancer le jeu.",
        "note": 2,
        "categorie": "Jeu",
        "date": "2026-03-12",
        "image": "assets/PokémonViolet.jpg",
        "lien": "https://multiup.io/51297fccc2a698de6cab6703af00bd44"
    },
    {
        "nom": "Pico Park 2",
        "description": "Traduit de l'anglais-Pico Park 2 est un jeu indépendant d'action-puzzle multijoueur coopératif développé par le développeur japonais TECOPARK. Il est sorti sur Nintendo Switch le 27 août 2024, avec une sortie sur Microsoft Windows, Xbox One et Xbox Series X/S le 12 septembre. C'est la suite de Pico Park.",
        "note": 5,
        "categorie": "Jeu",
        "date": "2026-03-12",
        "image": "assets/PicoPark2.jpg",
        "lien": "https://multiup.io/f98ba1278ed0a6a81d699d602fd63143"
    },
    {
        "nom": "Pico Park",
        "description": "Traduit de l'anglais-Pico Park est un jeu indépendant d'action-puzzle coopératif multijoueur développé par le studio japonais TECOPARK. Initialement sorti sur Microsoft Windows en 2016 via la plateforme de distribution de jeux vidéo Steam, il proposait un mode multijoueur local.",
        "note": 4,
        "categorie": "Jeu",
        "date": "2026-03-12",
        "image": "assets/PicoPark.jpg",
        "lien": "https://multiup.io/c67e2f9d5a6f995b878484cb09ac2ab2"
    },
    {
        "nom": "R.E.P.O.",
        "description": "R.E.P.O. est un jeu vidéo survival horror coopératif en ligne développé et publié par le studio suédois Semiwork pour Windows. Il est sorti en accès anticipé le 26 février 2025 sur Steam. Il est développé dans le moteur de jeu Unity en utilisant Photon pour la mise en réseau.",
        "note": 5,
        "categorie": "Jeu",
        "date": "2026-03-12",
        "image": "assets/R.E.P.O.png",
        "lien": "https://multiup.io/0bb1b4797f0a5571b6ead5ae2c7205c0"
    },
    {
        "nom": "War Machine",
        "description": "Alors que des soldats se préparent pour rejoindre un corps d'élite de l'armée, ils doivent interrompre leur entraînement pour survivre face à une menace inimaginable.",
        "note": 3,
        "categorie": "Film",
        "date": "2026-03-13",
        "image": "assets/WarMachine.jpg",
        "lien": "https://1fichier.com/?izwhmzysu0jgze7mbyfk"
    },
    {
        "nom": "Captain America: Civil War",
        "description": "Steve Rogers est désormais à la tête des Avengers, dont la mission est de protéger l'humanité. À la suite d'une de leurs interventions qui a causé d'importants dégâts collatéraux, le gouvernement décide de mettre en place un organisme de commandement et de supervision.",
        "note": 4,
        "categorie": "Film",
        "date": "2026-03-13",
        "image": "assets/CaptainAmericaCivilWar.jpg",
        "lien": "https://1fichier.com/?g7kjiq887tyw1e90l8yq"
    },
    {
        "nom": "Banlieusards 3",
        "description": "Alors que Noumouké franchit une étape dans sa carrière musicale, l'influence de la rue risque de le faire basculer de manière irréversible. Demba construit une nouvelle vie avec Djenaba mais ses décisions le rattrapent. Soulaymaan développe sa carrière d'avocat, mais son engagement auprès des habitants de son quartier est questionné. Les choix que feront les trois frères vont déterminer leur avenir personnel et celui de toute la famille.",
        "note": 3,
        "categorie": "Film",
        "date": "2026-03-13",
        "image": "assets/Banlieusards3.jpg",
        "lien": "https://1fichier.com/?chjbeoz0nhy9beyd1il5"
    },
    {
        "nom": "Resident Evil 6",
        "description": "Resident Evil 6, connu au Japon sous le titre Biohazard 6, est un jeu vidéo de tir à la troisième personne développé et édité par Capcom. Le jeu est sorti le 2 octobre 2012 sur PlayStation 3 et Xbox 360, en mars 2013 sur PC et le 29 mars 2016 sur PlayStation 4 et Xbox One.",
        "note": 4,
        "categorie": "Jeu",
        "date": "2026-03-14",
        "image": "assets/ResidentEvil6.jpg",
        "lien": "https://multiup.io/download/0099e9d467a8ba5d7c9947e80b125661/Resident_Evil_6_.rar"
    },
    {
        "nom": "Thank Goodness You're Here!",
        "description": "Thank Goodness You're Here! est un jeu de claqueforme comique et absurde au cœur du nord de l'Angleterre, dans l'étrange ville de Barnsworth. En tant que commercial itinérant, visitez les lieux et rencontrez ses habitants, impatients de vous confier des tâches plus loufoques les unes que les autres… ",
        "note": 5,
        "categorie": "Jeu",
        "date": "2026-03-14",
        "image": "assets/ThankGoodnessYou'reHere!.jpg",
        "lien": "https://multiup.io/b5709758907a714812883363e1607e9a"
    }
];
// ─── CHARGEMENT CATALOGUE ────────────────────
function loadCatalogue() {
    catalogueData = CATALOGUE;
    sortByDate(catalogueData);
    displayCatalogue(catalogueData);
    updateStats(catalogueData.length, catalogueData.length);
    initStats();
}

function sortByDate(arr) {
    arr.sort((a, b) => {
        const da = a.date ? new Date(a.date) : new Date(0);
        const db = b.date ? new Date(b.date) : new Date(0);
        return db - da;
    });
}

// ─── AFFICHAGE CATALOGUE ────────────────────
function displayCatalogue(data) {
    const container = document.getElementById("catalogue");
    container.innerHTML = "";

    if (data.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📜</span>
                <p>Aucune Chronique trouvée dans les Archives...</p>
            </div>
        `;
        return;
    }

    data.forEach((item, index) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.style.animationDelay = (index * 0.07) + "s";

        const badge = item.note === 5
            ? `<div class="badge">👑 Chef-d'œuvre</div>`
            : "";

        // Image
        const imageHTML = item.image
            ? `<div class="card-image">
                   <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.nom)}" loading="lazy">
               </div>`
            : `<div class="card-image">
                   <div class="card-image-placeholder">
                       ${getCatIcon(item.categorie)}
                   </div>
               </div>`;

        // Étoiles
        const stars = Array.from({ length: 5 }, (_, i) =>
            `<span class="star">${i < item.note ? "⭐" : "☆"}</span>`
        ).join("");

        // Date formatée
        const dateStr = item.date
            ? new Date(item.date).toLocaleDateString("fr-FR", { year: "numeric", month: "long" })
            : "";

        const isLivre = item.categorie === "Livre";
        const hasTomes = item.tomes && item.tomes.length > 0;
        let btnHTML = "";

        if (isLivre) {
            if (hasTomes) {
                // Store tomes as JSON in data attribute to avoid index mismatch
                const tomesJson = escapeHtml(JSON.stringify(item.tomes));
                const nomEsc = escapeHtml(item.nom);
                btnHTML = `<div class="book-actions">
                    <button class="card-btn book-btn-read" data-tomes='${tomesJson}' data-nom='${nomEsc}' onclick="openReaderModalFromBtn(this)"><span>📖 Lire</span></button>
                    <button class="card-btn book-btn-dl" data-tomes='${tomesJson}' data-nom='${nomEsc}' onclick="openDownloadModalFromBtn(this)"><span>⬇️ Télécharger</span></button>
                </div>`;
            } else {
                const lienEsc = escapeHtml(item.lien);
                const nomEsc = escapeHtml(item.nom);
                const zipEsc = item.zip ? escapeHtml(item.zip) : "";
                btnHTML = `<div class="book-actions">
                    <button class="card-btn book-btn-read" onclick="openReader('${lienEsc}', '${nomEsc}')"><span>📖 Lire</span></button>
                    <button class="card-btn book-btn-dl" onclick="downloadDirect('${lienEsc}', '${nomEsc}', '${zipEsc}')"><span>⬇️ Télécharger</span></button>
                </div>`;
            }
        } else {
            if (hasTomes) {
                btnHTML = item.tomes.map(t => `<button class="card-btn" style="margin-bottom:6px" onclick="window.open('${escapeHtml(t.lien)}', '_blank')"><span>📖 ${escapeHtml(t.label)}</span></button>`).join("");
            } else {
                btnHTML = `<button class="card-btn" onclick="window.open('${escapeHtml(item.lien)}', '_blank')"><span>📖 Consulter l'Archive</span></button>`;
            }
        }

        card.innerHTML = `
    ${badge}
    ${imageHTML}
    <div class="card-body">
        <div class="card-top">
            <span class="card-cat">${getCatIcon(item.categorie)} ${escapeHtml(item.categorie)}</span>
            ${dateStr ? `<span class="card-date">${dateStr}</span>` : ""}
        </div>
        <h3 class="card-title">${escapeHtml(item.nom)}</h3>
        <p class="card-desc">${escapeHtml(item.description)}</p>
        <div class="card-stars">${stars}</div>
        ${btnHTML}
    </div>
`;

        container.appendChild(card);
    });
}

function getCatIcon(cat) {
    const icons = {
        "Jeu": "🎮",
        "Film": "🎬",
        "Série": "📺",
        "Livre": "📖",
        "Manga": "🗡️",
        "Anime": "⛩️"
    };
    return icons[cat] || "📜";
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function updateStats(total, displayed) {
    const stats = document.getElementById("stats");
    stats.innerHTML = displayed === total
        ? `⚜️ ${total} Chronique${total > 1 ? "s" : ""} archivée${total > 1 ? "s" : ""}`
        : `⚜️ ${displayed} Chronique${displayed > 1 ? "s" : ""} affichée${displayed > 1 ? "s" : ""} sur ${total}`;
}

// ─── 🔮 ORACLE DU ROYAUME — 100% LOCAL ──────────
let oracleDebounce = null;
let currentEggEl = null;
let lastQuery = "";

// ── Réponses par patterns (ordre = priorité) ──
const ORACLE_RULES = [

    // ── Prénoms & identités ──
    { match: q => q.includes("evan est à moi") || q.includes("evan est a moi"),
      rep: ["👑 Les archives royales enregistrent cette déclaration officielle... Evan, t'as vu ça ?! 😏",
            "📜 Proclamation royale reçue 5/5 ! L'Oracle valide... sous réserve qu'Evan soit d'accord 😂",
            "⚔️ EVAN EST À MOI — signé Lyla. Les archives en prennent bonne note 💛👀"] },

    { match: q => (q.includes("lyla est à moi") || q.includes("lyla est a moi")),
      rep: ["💘 Ohhh Evan qui claim Lyla... l'Oracle approuve cette énergie 😭👑",
            "📜 Déclaration enregistrée dans les archives royales... Lyla, tu as vu ça ? 👀"] },

    { match: q => q.includes("mwaha") || q.includes("mwah") || q.includes("muhaha") || q.includes("muahaha"),
      rep: ["😈 Le rire démoniaque a été détecté dans le Royaume... Lyla encore ? 👀",
            "🔮 L'Oracle entend un rire maléfique... mais adorable quand même 😂💛",
            "👑 Mwahaha dans les archives royales... Evan fais attention à toi 😏"] },

    { match: q => q === "evan" || q.includes("evan b") || q.startsWith("evan "),
      rep: ["⚔️ Evan... le fondateur du Royaume cherche quelqu'un ou c'est quelqu'un qui cherche Evan ? 👀",
            "🏰 L'Oracle voit qu'on s'intéresse à Evan... Lyla c'est toi ? 😏",
            "💛 Evan est dans les parages... et l'Oracle parie que Lyla aussi 🔮"] },

    { match: q => q === "lyla" || q.includes("lyla marie") || q.startsWith("lyla "),
      rep: ["🌸 Lyla Marie... un prénom qui revient souvent dans ce Royaume 👀",
            "💘 L'Oracle détecte une présence royale... Lyla est dans les archives 😌",
            "✨ Lyla... Evan vient de taper ça ou c'est Lyla elle-même ? L'Oracle se demande 😂"] },

    { match: q => q.includes("marie"),
      rep: ["🌸 Marie... l'Oracle note que ce prénom fait battre certains cœurs ici 💛",
            "👀 Marie... les archives royales savent exactement pourquoi tu cherches ça Evan 😏"] },

    // ── Déclarations sur soi ──
    { match: q => q.includes("je suis belle") || q.includes("je suis beau") || q.includes("trop belle") || q.includes("trop beau"),
      rep: ["✨ L'Oracle confirme sans hésiter... et quelqu'un d'autre dans ce Royaume le pense aussi 👀",
            "👑 Les archives royales enregistrent : VRAI. Evan/Lyla approuve ce message 💛",
            "🪞 Évidemment ! L'Oracle ne ment jamais... et l'autre le sait déjà 😌"] },

    { match: q => q.includes("je suis la meilleure") || q.includes("je suis le meilleur"),
      rep: ["👑 L'Oracle confirme officiellement votre supériorité royale 😂💛",
            "🏆 Meilleur(e) ? Oui. Et l'autre dans ce Royaume est d'accord, trust 😏"] },

    { match: q => q.includes("je m'ennuie") || q.includes("je mennuie") || q.includes("ennui") || q.includes("boring"),
      rep: ["😴 T'ennuies ? L'Oracle suggère d'envoyer un message à quelqu'un... tu vois qui 👀",
            "💤 Les archives royales sont là pour toi... mais Evan/Lyla aussi non ? 😏"] },

    { match: q => q.includes("je suis fatiguée") || q.includes("je suis fatigué"),
      rep: ["😴 Fatigué(e)... l'Oracle recommande une pause avec bonne compagnie 👀💛",
            "🌙 Les archives royales compatissent... et savent qui pourrait remonter le moral 😏"] },

    { match: q => q.includes("je t'aime") || q.includes("je taime"),
      rep: ["💘 L'Oracle rougit... mais c'est à Evan ou Lyla que tu devrais dire ça non ? 😏",
            "🫀 Trois petits mots dans les archives royales... l'Oracle enregistre et transmet 💛"] },

    // ── Taquineries directes ──
    { match: q => q.includes("appart") && (q.includes("evan") || q.includes("finito") || q.includes("fini")),
      rep: ["🏠 L'appart d'Evan... finito pour certaines personnes dans ce Royaume 😂👀",
            "🚪 L'Oracle a entendu parler de cet appart... Lyla bannie ou invitée ? 🤔😂"] },

    { match: q => q.includes("finito") || q.includes("c'est fini") || q.includes("c est fini"),
      rep: ["💔 Finito... ou pas vraiment ? L'Oracle sait que ça dure jamais 😂",
            "🔮 L'Oracle prédit : dans 5 minutes c'est plus finito 👀💛"] },

    { match: q => q.includes("crush"),
      rep: ["😳 Quelqu'un cherche 'crush'... l'Oracle a une petite idée de la situation 💛",
            "💘 Crush dans les archives royales... evan + lyla = obvious non ? 👀"] },

    { match: q => q.includes("jalou"),
      rep: ["😤 Jaloux(se) ? L'Oracle comprend... l'autre est clairement trop swag 💁",
            "👀 La jalousie royale a été détectée dans le Royaume... c'est mignon en vrai 💛"] },

    { match: q => q.includes("bisou") || q.includes("bise") || q.includes("câlin") || q.includes("calin"),
      rep: ["😘 Les bisous royaux sont réservés aux personnes très spéciales... you know 👀",
            "🫂 L'Oracle enregistre une demande de tendresse royale... destinataire évident 💛"] },

    { match: q => q.includes("mariage") || q.includes("fiancé") || q.includes("fiancee"),
      rep: ["💍 EVAN + LYLA — les archives royales en prennent note pour l'éternité 👑📜",
            "⛪ L'Oracle voit l'avenir... et il ressemble à une cérémonie royale 😂💛"] },

    { match: q => q.includes("date") || q.includes("rendez-vous") || q.includes("rendezvous"),
      rep: ["📅 Un rendez-vous dans les archives royales ? L'Oracle suggère de ne pas trop attendre 😏",
            "🌹 Date détectée... Evan + Lyla, l'Oracle valide le plan 👑"] },

    // ── Œuvres du catalogue ──
    { match: q => q.includes("comment traduire") || q.includes("traduire cet amour"),
      rep: ["💘 'Comment traduire cet amour'... l'Oracle se demande si Evan a ce problème avec Lyla aussi 👀",
            "🌍 Traduire l'amour... c'est compliqué pour tout le monde hein Evan ? 😂💛"] },

    { match: q => q.includes("the substance") || q.includes("substance"),
      rep: ["💉 The Substance... devenir une meilleure version de soi. Evan et Lyla sont déjà au max selon l'Oracle 💛",
            "✨ La Substance ? L'Oracle sait que personne ici n'en a besoin, ils sont déjà parfaits 😌"] },

    { match: q => q.includes("captain america") || q.includes("soldat de l'hiver") || q.includes("winter soldier"),
      rep: ["🛡️ Captain America... Evan se voit déjà en chevalier protecteur de Lyla ou quoi 😂",
            "❄️ Le Soldat de l'Hiver... aussi mystérieux qu'Evan quand il essaie pas de montrer ses feelings 👀"] },

    { match: q => q.includes("tetris"),
      rep: ["🟦 Tetris... comme Evan et Lyla, les pièces finissent toujours par s'emboîter 😌",
            "🎮 Tetris dans les archives ! L'Oracle note que certains duos s'assemblent aussi parfaitement 💛"] },

    { match: q => q.includes("harry potter") || q.includes("poudlard") || q.includes("hermione") || q.includes("dumbledore"),
      rep: ["⚡ Harry Potter... Lyla serait Hermione et Evan Ron ? L'Oracle approuve ce casting 😂",
            "🧙 Les archives magiques s'activent ! L'Oracle voit deux moldus qui méritent leur lettre de Poudlard 💛"] },

    { match: q => q.includes("solo leveling"),
      rep: ["⚔️ Solo Leveling... Evan farm ses stats pour impressionner Lyla depuis le début on dirait 😂",
            "📈 S-Rank détecté dans le Royaume... Evan ou Lyla ? L'Oracle dit les deux 👑"] },

    { match: q => q.includes("loups") || q.includes("zodiaque") || q.includes("loup"),
      rep: ["🐺 Les Loups du Zodiaque... certains dans ce Royaume ont aussi trouvé leur destiné(e) sans le savoir 👀💛",
            "🌕 Lune, loups, destinée... l'Oracle voit un fil rouge entre Evan et Lyla là 😏"] },

    { match: q => q.includes("harry") || q.includes("potter"),
      rep: ["🪄 Wingardium Leviosa... l'Oracle lévite de joie pour ce duo royal 💛",
            "⚡ Harry Potter dans les archives... et l'Oracle qui shippe Evan + Lyla depuis le tome 1 😂"] },

    { match: q => q.includes("roue du temps") || q.includes("robert jordan"),
      rep: ["⏳ La Roue du Temps tourne... et elle ramène toujours Evan vers Lyla 🔮💛",
            "📚 Robert Jordan savait : certaines histoires sont écrites d'avance. Comme celle d'Evan et Lyla 😌"] },

    { match: q => q.includes("ombre") || q.includes("tenebr") || q.includes("nycht"),
      rep: ["🌑 Le Royaume des Ombres... aussi mystérieux que les sentiments d'Evan pour Lyla 👀",
            "⚔️ Dans les ténèbres, l'Oracle voit toujours une lumière dorée... qui ressemble à Lyla 💛"] },

    { match: q => q.includes("girl in pieces") || q.includes("kathleen"),
      rep: ["📖 Girl in Pieces... l'Oracle espère que tout le monde dans ce Royaume est entier et heureux 💛",
            "🩹 Certains livres touchent au cœur... comme certaines personnes de ce Royaume 😌"] },

    // ── Expressions & réactions ──
    { match: q => q.includes("mdr") || q.includes("lol") || q.includes("ptdr") || q.includes("💀") || q.includes("😭"),
      rep: ["😂 L'Oracle entend des rires dans le Royaume... c'est Lyla ou Evan qui rigole ? 💛",
            "🤣 Bonne humeur détectée ! L'Oracle valide cette énergie royale 👑"] },

    { match: q => q.includes("non") && q.length < 15,
      rep: ["😤 NON ? L'Oracle a rarement entendu quelqu'un dire non avec autant de conviction ici 😂",
            "🚫 NON dit le Royaume... mais l'Oracle sait que c'est souvent un oui déguisé 👀"] },

    { match: q => q.includes("oui") && q.length < 15,
      rep: ["✅ OUI ! L'Oracle approuve cette réponse enthousiaste 👑💛",
            "🎉 Un OUI dans les archives royales... Evan ou Lyla vient d'accepter quelque chose ? 👀"] },

    { match: q => q.includes("help") || q.includes("aide") || q.includes("comment"),
      rep: ["🔮 L'Oracle est là pour guider... techniquement 😂 Essaie une vraie recherche peut-être ?",
            "📜 Les archives royales contiennent toutes les réponses... sauf comment confesser ses sentiments 👀"] },

    { match: q => q.includes("pourquoi"),
      rep: ["🤔 Pourquoi ? L'Oracle se pose la même question sur Evan et Lyla depuis le début 😂",
            "🔮 Pourquoi... c'est LA question des archives royales 👑"] },

    // ── Nourriture & quotidien ──
    { match: q => q.includes("pizza"),
      rep: ["🍕 Pizza dans les archives... Evan et Lyla partagent une pizza ou c'est encore deux pizzas séparées ? 😂",
            "🍕 L'Oracle a faim maintenant merci... commandez pour deux hein 👀💛"] },

    { match: q => q.includes("café") || q.includes("cafe") || q.includes("thé") || q.includes("the "),
      rep: ["☕ Une pause royale... l'Oracle suggère d'inviter quelqu'un pour ce café 👀",
            "🍵 Thé ou café dans le Royaume... Evan sait comment Lyla le prend ? 😏"] },

    { match: q => q.includes("dormir") || q.includes("dodo") || q.includes("fatigué") || q.includes("nuit"),
      rep: ["🌙 Bonne nuit à tout le Royaume... et à Evan et Lyla en particulier 💛",
            "😴 L'Oracle ferme les archives pour la nuit... douce nuit à vous deux 🔮"] },

    // ── Fallback créatifs — réponses random quand rien ne matche ──
    { match: q => q.length >= 3,
      rep: [
        "🔮 L'Oracle a vu bien des choses... mais ça, c'est nouveau 😂 Evan tu confirmes ?",
        "📜 Les archives royales enregistrent cette requête mystérieuse... et la transmettent à Evan 👀",
        "👑 Intéressant choix de recherche... l'Oracle se demande ce que Lyla en penserait 😏",
        "✨ L'Oracle consulte les étoiles... elles disent qu'Evan et Lyla devraient discuter de ça 💛",
        "🏰 Message reçu dans les archives royales... le destinataire semble être quelqu'un de spécial 👀",
        "⚜️ L'Oracle enregistre tout... et garde les secrets du Royaume 🤫💛",
        "🌟 Curieux(se)... l'Oracle voit que ce Royaume cache encore des surprises 😌",
        "📖 Page ajoutée aux chroniques royales... Evan et Lyla auraient aimé voir ça 😂",
        "🔮 L'Oracle a parlé. La prophétie est claire : Evan + Lyla = le meilleur duo du Royaume 💛",
        "⚔️ Les archives frémissent... quelque chose d'important se passe dans ce Royaume 👀",
      ]
    }
];

function getOracleResponse(query) {
    const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    for (const rule of ORACLE_RULES) {
        if (rule.match(q)) {
            const arr = rule.rep;
            return arr[Math.floor(Math.random() * arr.length)];
        }
    }
    return null;
}

function checkEasterEgg(query) {
    const q = query.trim();

    // Supprime l'ancien message
    if (currentEggEl) {
        currentEggEl.classList.remove("visible");
        const old = currentEggEl;
        setTimeout(() => { if (old.parentNode) old.remove(); }, 400);
        currentEggEl = null;
    }
    clearTimeout(oracleDebounce);

    if (q.length < 3) return;

    // Debounce 600ms — simule une "réflexion" de l'oracle
    oracleDebounce = setTimeout(() => {
        const response = getOracleResponse(q);
        if (response) showOracleMessage(response);
    }, 600);
}

function showOracleMessage(text) {
    // Retire l'ancien s'il existe encore
    const old = document.getElementById("oracle-bubble");
    if (old) old.remove();

    const el = document.createElement("div");
    el.id = "oracle-bubble";
    el.className = "easter-egg-msg";
    el.textContent = text;

    const searchWrapper = document.querySelector(".search-wrapper");
    searchWrapper.parentNode.insertBefore(el, searchWrapper.nextSibling);
    currentEggEl = el;

    // Apparition
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("visible")));

    // Disparaît après 6s
    clearTimeout(oracleDebounce);
    oracleDebounce = setTimeout(() => {
        el.classList.remove("visible");
        setTimeout(() => { if (el.parentNode) el.remove(); currentEggEl = null; }, 400);
    }, 6000);
}

// ─── RECHERCHE + FILTRE + TRI ────────────────
document.getElementById("search").addEventListener("input", filterAndSort);

const TELEGRAM_TOKEN = "8443841352:AAH1zjH59W50oJWfHLJpJ5QwDeHKpnRmuUA";
const TELEGRAM_CHAT_ID = "5620800791";

document.getElementById("search").addEventListener("blur", () => {
    const query = document.getElementById("search").value.trim();
    if (query.length >= 2) {
        trackRecherche();
        const msg = `👑 Les Chroniques du Royaume\n📅 ${new Date().toLocaleString("fr-FR")}\n🔎 Recherche : ${query}`;
        fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: msg })
        }).then(() => {
            console.log("✅ Recherche envoyée :", query);
        }).catch((err) => {
            console.error("❌ Erreur Telegram :", err);
        });
    }
});
document.getElementById("filter").addEventListener("change", filterAndSort);
document.getElementById("sort").addEventListener("change", filterAndSort);

function filterAndSort() {
    let filtered = [...catalogueData];

    const search = document.getElementById("search").value.toLowerCase().trim();
    checkEasterEgg(search);
    const filter = document.getElementById("filter").value;
    const sort = document.getElementById("sort").value;

    if (search) {
        filtered = filtered.filter(item =>
            item.nom.toLowerCase().includes(search) ||
            item.description.toLowerCase().includes(search)
        );
    }

    if (filter !== "Tous") {
        filtered = filtered.filter(item => item.categorie === filter);
    }

    if (sort === "note") {
        filtered.sort((a, b) => b.note - a.note);
    } else if (sort === "recent") {
        sortByDate(filtered);
    }
    // "default" → ordre original (déjà trié par date au chargement)

    displayCatalogue(filtered);
    updateStats(catalogueData.length, filtered.length);
}


// ─── 📖 LECTEUR PDF INTÉGRÉ ──────────────────
// ─── 📖 LECTEUR — SÉLECTION TOME ─────────────
function openReader(url, titre) {
    // Livre sans tomes → lecteur direct
    _launchPdfViewer(url, titre);
}

function openReaderModalFromBtn(btn) {
    const nom = btn.dataset.nom || "";
    let tomes = [];
    try { tomes = JSON.parse(btn.dataset.tomes || "[]"); } catch(e) { return; }
    if (!tomes.length) return;

    if (tomes.length === 1) {
        _launchPdfViewer(tomes[0].lien, nom + " — " + tomes[0].label);
        return;
    }

    // Plusieurs tomes → modal sélection
    const existing = document.getElementById("reader-modal");
    if (existing) existing.remove();

    const tomesHTML = tomes.map(t => {
        const lien = t.lien.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
        const label = t.label.replace(/'/g, "\\'");
        const nomSafe = nom.replace(/'/g, "\\'");
        return `<div class="dl-tome-row tomes-read-row">
            <span class="dl-tome-label">📚 ${t.label}</span>
            <button class="card-btn tomes-read-btn" onclick="closeReader();setTimeout(()=>_launchPdfViewer('${lien}','${nomSafe} — ${label}'),300)">
                <span>📖 Ouvrir</span>
            </button>
        </div>`;
    }).join("");

    const modal = document.createElement("div");
    modal.id = "reader-modal";
    modal.innerHTML = `
        <div class="reader-overlay" onclick="closeReader()"></div>
        <div class="dl-panel">
            <button class="stats-close" onclick="closeReader()">✕</button>
            <div class="dl-header">
                <span style="font-size:2rem">📖</span>
                <h2>${nom}</h2>
                <p>Choisis un tome à lire</p>
            </div>
            <div class="dl-tomes">${tomesHTML}</div>
        </div>`;
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add("visible"));
}

function closeReader() {
    const modal = document.getElementById("reader-modal");
    if (!modal) return;
    modal.classList.remove("visible");
    setTimeout(() => modal.remove(), 350);
}

// ─── 📄 VRAI LECTEUR PDF (PDF.js) ─────────────
let _pdfDoc = null, _pdfPage = 1, _pdfBusy = false;

function _launchPdfViewer(url, titre) {
    const old = document.getElementById("pdf-viewer-modal");
    if (old) old.remove();
    _pdfDoc = null; _pdfPage = 1; _pdfBusy = false;

    const modal = document.createElement("div");
    modal.id = "pdf-viewer-modal";
    modal.innerHTML = `
        <div class="pv-bg" onclick="closePdfViewer()"></div>
        <div class="pv-panel">
            <div class="pv-topbar">
                <span class="pv-titre">📖 ${titre}</span>
                <div style="display:flex;gap:8px">
                    <button class="pv-tbtn" onclick="window.open('${url}','_blank')" title="Ouvrir dans un onglet">↗</button>
                    <button class="pv-tbtn" onclick="closePdfViewer()">✕</button>
                </div>
            </div>
            <div class="pv-body" id="pv-body">
                <div class="pv-loader" id="pv-loader">
                    <div class="pv-spinner"></div>
                    <span>Chargement du parchemin...</span>
                </div>
                <canvas id="pv-canvas"></canvas>
            </div>
            <div class="pv-navbar">
                <button class="pv-navbtn" id="pv-prev" onclick="pdfGo(-1)" disabled>◀ Précédent</button>
                <span class="pv-pageinfo"><span id="pv-cur">1</span> / <span id="pv-tot">?</span></span>
                <button class="pv-navbtn" id="pv-next" onclick="pdfGo(1)" disabled>Suivant ▶</button>
            </div>
        </div>`;

    document.body.appendChild(modal);
    requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add("visible")));

    const load = () => {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        pdfjsLib.getDocument(url).promise
            .then(doc => {
                _pdfDoc = doc;
                document.getElementById("pv-loader").style.display = "none";
                document.getElementById("pv-canvas").style.display = "block";
                document.getElementById("pv-tot").textContent = doc.numPages;
                if (doc.numPages > 1) document.getElementById("pv-next").disabled = false;
                _renderPage(1);
            })
            .catch(() => _pdfFallback(url));
    };

    if (window.pdfjsLib) {
        load();
    } else {
        const s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        s.onload = load;
        s.onerror = () => _pdfFallback(url);
        document.head.appendChild(s);
    }
}

function _renderPage(n) {
    if (!_pdfDoc || _pdfBusy) return;
    _pdfBusy = true;
    _pdfDoc.getPage(n).then(page => {
        const body = document.getElementById("pv-body");
        const canvas = document.getElementById("pv-canvas");
        if (!body || !canvas) return;
        const maxW = body.clientWidth - 40;
        const vp0 = page.getViewport({ scale: 1 });
        const scale = Math.min(2.2, maxW / vp0.width);
        const vp = page.getViewport({ scale });
        canvas.width = vp.width;
        canvas.height = vp.height;
        page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise.then(() => {
            _pdfBusy = false;
            _pdfPage = n;
            document.getElementById("pv-cur").textContent = n;
            document.getElementById("pv-prev").disabled = n <= 1;
            document.getElementById("pv-next").disabled = n >= _pdfDoc.numPages;
            if (body) body.scrollTop = 0;
            // Animation flip
            canvas.style.animation = "none";
            void canvas.offsetWidth;
            canvas.style.animation = "pvFlip 0.3s ease-out";
        });
    });
}

function pdfGo(dir) {
    if (!_pdfDoc || _pdfBusy) return;
    const n = _pdfPage + dir;
    if (n < 1 || n > _pdfDoc.numPages) return;
    _renderPage(n);
}

function closePdfViewer() {
    const modal = document.getElementById("pdf-viewer-modal");
    if (!modal) return;
    modal.classList.remove("visible");
    setTimeout(() => { modal.remove(); _pdfDoc = null; }, 400);
}

function _pdfFallback(url) {
    const loader = document.getElementById("pv-loader");
    if (!loader) return;
    loader.innerHTML = `
        <p style="color:var(--texte-doux);font-style:italic;margin-bottom:16px;font-family:'EB Garamond',serif">
            📜 Ce parchemin ne peut pas s'afficher ici.
        </p>
        <button class="card-btn" style="max-width:220px" onclick="window.open('${url}','_blank')">
            <span>↗️ Ouvrir dans un onglet</span>
        </button>`;
}

// ─── ⬇️ TÉLÉCHARGEMENT ─────────────────────────
function openDownloadModalFromBtn(btn) {
    const nom = btn.dataset.nom || "";
    let tomes = [];
    try { tomes = JSON.parse(btn.dataset.tomes || "[]"); } catch(e) { return; }
    if (!tomes.length) return;
    _openDownloadModalData(nom, tomes);
}
function openDownloadModal(itemIndex) {
    const item = CATALOGUE[itemIndex];
    if (!item || !item.tomes) return;
    _openDownloadModalData(item.nom, item.tomes);
}
function _openDownloadModalData(nom, tomes) {
    const existing = document.getElementById("dl-modal");
    if (existing) existing.remove();
    const tomesHTML = tomes.map(t => {
        // Utilise le ZIP s'il existe, sinon le PDF direct
        const dlLien = t.zip ? t.zip : t.lien;
        const dlLabel = t.zip ? t.label + ".zip" : t.label + ".pdf";
        return `
        <label class="dl-tome-row">
            <input type="checkbox" class="dl-check" data-lien="${dlLien}" data-label="${t.label}" data-filename="${dlLabel}" checked>
            <span class="dl-checkmark"></span>
            <span class="dl-tome-label">📦 ${t.label}</span>
        </label>`;
    }).join("");
    const modal = document.createElement("div");
    modal.id = "dl-modal";
    modal.innerHTML = `
        <div class="dl-overlay" onclick="closeDownloadModal()"></div>
        <div class="dl-panel">
            <button class="stats-close" onclick="closeDownloadModal()">✕</button>
            <div class="dl-header">
                <span style="font-size:2rem">📚</span>
                <h2>${nom}</h2>
                <p>Sélectionne les tomes à télécharger</p>
            </div>
            <div class="dl-tomes">${tomesHTML}</div>
            <div class="dl-actions">
                <button class="dl-btn-all" onclick="toggleAllTomes(true)">Tout cocher</button>
                <button class="dl-btn-none" onclick="toggleAllTomes(false)">Tout décocher</button>
            </div>
            <button class="card-btn dl-confirm-btn" onclick="confirmDownload()">
                <span>⬇️ Télécharger la sélection</span>
            </button>
        </div>`;
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add("visible"));
}
function closeDownloadModal() {
    const modal = document.getElementById("dl-modal");
    if (!modal) return;
    modal.classList.remove("visible");
    setTimeout(() => modal.remove(), 350);
}
function toggleAllTomes(check) {
    document.querySelectorAll(".dl-check").forEach(cb => cb.checked = check);
}
function nativeDownload(url, filename) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 300);
}
function confirmDownload() {
    const checked = document.querySelectorAll(".dl-check:checked");
    if (checked.length === 0) {
        const btn = document.querySelector(".dl-confirm-btn span");
        btn.textContent = "⚠️ Sélectionne au moins un tome !";
        setTimeout(() => btn.textContent = "⬇️ Télécharger la sélection", 2000);
        return;
    }
    checked.forEach((cb, i) => {
        const filename = cb.dataset.filename || (cb.dataset.label + ".zip");
        setTimeout(() => nativeDownload(cb.dataset.lien, filename), i * 600);
    });
    closeDownloadModal();
}
function downloadDirect(url, nom, zip) {
    // Si un ZIP est disponible, télécharge le ZIP, sinon le PDF
    if (zip) {
        nativeDownload(zip, nom + ".zip");
    } else {
        nativeDownload(url, nom + ".pdf");
    }
}

// ─── SYSTÈME DE STATS ────────────────────────
const STATS_KEY = "royal_stats";

function getStats(){
    const def = {
        vues: 0,
        recherches: 0,
        clics: {},
        clicsCategorie: {},
        topChroniques: {},
        derniereVisite: null,
        premiereVisite: null
    };
    try {
        return JSON.parse(localStorage.getItem(STATS_KEY)) || def;
    } catch(e) { return def; }
}

function saveStats(s){
    localStorage.setItem(STATS_KEY, JSON.stringify(s));
}

function trackVue(){
    const s = getStats();
    s.vues++;
    if(!s.premiereVisite) s.premiereVisite = new Date().toLocaleString("fr-FR");
    s.derniereVisite = new Date().toLocaleString("fr-FR");
    saveStats(s);
}

function trackRecherche(){
    const s = getStats();
    s.recherches++;
    saveStats(s);
}

function trackClic(nom, categorie){
    const s = getStats();
    s.clics[nom] = (s.clics[nom] || 0) + 1;
    s.clicsCategorie[categorie] = (s.clicsCategorie[categorie] || 0) + 1;
    s.topChroniques[nom] = (s.topChroniques[nom] || 0) + 1;
    saveStats(s);
}

// Compter la vue au chargement du site
function initStats(){
    trackVue();
    // Vues globales via CountAPI
    fetch("https://api.countapi.xyz/hit/les-chroniques-du-royaume/visits")
        .then(r => r.json())
        .then(d => {
            const el = document.getElementById("stat-vues-globales");
            if(el) el.textContent = d.value.toLocaleString("fr-FR");
        }).catch(() => {});
}

// ─── PANEL STATS ─────────────────────────────
function openStats(){
    const s = getStats();

    // Top chroniques
    const topEntries = Object.entries(s.topChroniques)
        .sort((a,b) => b[1] - a[1])
        .slice(0, 5);

    const topHTML = topEntries.length > 0
        ? topEntries.map(([ nom, count ], i) => `
            <div class="stat-top-row">
                <span class="stat-rank">${["👑","⚔️","🏹","📜","⚜️"][i]}</span>
                <span class="stat-top-nom">${nom}</span>
                <span class="stat-top-count">${count} clic${count > 1 ? "s" : ""}</span>
            </div>`).join("")
        : `<p style="color:var(--texte-doux); font-style:italic;">Aucun clic encore...</p>`;

    // Stats catégories
    const catHTML = Object.entries(s.clicsCategorie).length > 0
        ? Object.entries(s.clicsCategorie)
            .sort((a,b) => b[1] - a[1])
            .map(([cat, count]) => `
                <div class="stat-cat-row">
                    <span>${getCatIcon(cat)} ${cat}</span>
                    <div class="stat-bar-wrap">
                        <div class="stat-bar-fill" style="width:${Math.min(100, count * 20)}%"></div>
                    </div>
                    <span>${count}</span>
                </div>`).join("")
        : `<p style="color:var(--texte-doux); font-style:italic;">Aucun clic encore...</p>`;

    const modal = document.createElement("div");
    modal.id = "stats-modal";
    modal.innerHTML = `
        <div class="stats-overlay" onclick="closeStats()"></div>
        <div class="stats-panel">
            <button class="stats-close" onclick="closeStats()">✕</button>
            <div class="stats-header">
                <span>📊</span>
                <h2>Archives des Statistiques</h2>
                <p>Données de votre session</p>
            </div>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">👁️</div>
                    <div class="stat-value">${s.vues}</div>
                    <div class="stat-label">Vos visites</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🌍</div>
                    <div class="stat-value" id="stat-vues-globales">...</div>
                    <div class="stat-label">Vues totales</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🔎</div>
                    <div class="stat-value">${s.recherches}</div>
                    <div class="stat-label">Recherches</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📖</div>
                    <div class="stat-value">${Object.values(s.clics).reduce((a,b) => a+b, 0)}</div>
                    <div class="stat-label">Clics archives</div>
                </div>
            </div>
            <div class="stats-section">
                <h3>🏆 Top Chroniques</h3>
                <div class="stat-top-list">${topHTML}</div>
            </div>
            <div class="stats-section">
                <h3>📂 Clics par catégorie</h3>
                <div class="stat-cats">${catHTML}</div>
            </div>
            ${s.premiereVisite ? `
            <div class="stats-section stats-dates">
                <p>📅 Première visite : <strong>${s.premiereVisite}</strong></p>
                <p>🕐 Dernière visite : <strong>${s.derniereVisite}</strong></p>
            </div>` : ""}
        </div>
    `;
    document.body.appendChild(modal);

    // Refresh vues globales
    fetch("https://api.countapi.xyz/get/les-chroniques-du-royaume/visits")
        .then(r => r.json())
        .then(d => {
            const el = document.getElementById("stat-vues-globales");
            if(el) el.textContent = d.value ? d.value.toLocaleString("fr-FR") : "—";
        }).catch(() => {
            const el = document.getElementById("stat-vues-globales");
            if(el) el.textContent = "—";
        });
}

function closeStats(){
    const modal = document.getElementById("stats-modal");
    if(modal) modal.remove();
}
