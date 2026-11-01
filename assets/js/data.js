/* =====================================================================
 * Spotify-dos — Base de datos simulada
 * ================================================================== */

const IMG = "assets/img";

const DB = {
  artists: [
    { id: "a-badbunny",   name: "Bad Bunny",       img: `${IMG}/artists/bad-bunny.jpg`,      genre: "Reggaeton / Trap latino", monthly: "45.2M", verified: true,
      bio: "El conejo más malo del género urbano latino. Domina las listas globales con su mezcla única de trap, reggaeton y experimentación." },
    { id: "a-karolg",     name: "Karol G",          img: `${IMG}/artists/karol-g.jpg`,        genre: "Reggaeton / Pop",         monthly: "38.7M", verified: true,
      bio: "La Bichota. Artista colombiana que conquistó el mundo con 'Mañana Será Bonito' y su energía inigualable sobre el escenario." },
    { id: "a-feid",       name: "Feid",             img: `${IMG}/artists/feid.jpg`,           genre: "Urban / Reggaeton",       monthly: "22.3M", verified: true,
      bio: "Ferxxo. El rey del mood. Su sonido suave y romántico lo posicionó como uno de los artistas más influyentes del urbano actual." },
    { id: "a-taylorswift",name: "Taylor Swift",     img: `${IMG}/artists/taylor-swift.jpg`,   genre: "Pop / Country",           monthly: "82.1M", verified: true,
      bio: "La artista más influyente de su generación. Reina del pop con un catálogo que abarca country, synth-pop, folk y más." },
    { id: "a-weeknd",     name: "The Weeknd",       img: `${IMG}/artists/the-weeknd.jpg`,     genre: "R&B / Pop",               monthly: "71.4M", verified: true,
      bio: "Abel Tesfaye redefine el R&B oscuro y atmósferico. Sus álbumes son viajes sonoros nocturnos que no se olvidan fácilmente." },
    { id: "a-dualipa",    name: "Dua Lipa",         img: `${IMG}/artists/dua-lipa.jpg`,       genre: "Pop / Dance",             monthly: "64.8M", verified: true,
      bio: "La reina del pop dance de nueva generación. 'Future Nostalgia' es uno de los mejores álbumes pop de la última década." },
    { id: "a-monlaferte", name: "Mon Laferte",      img: `${IMG}/artists/mon-laferte.jpg`,    genre: "Pop Latino / Rock",       monthly: "8.9M",  verified: true,
      bio: "Artista chilena con una voz poderosa y un estilo único que mezcla folklore, pop, bolero y rock con emoción genuina." },
    { id: "a-bunkers",    name: "Los Bunkers",      img: `${IMG}/artists/los-bunkers.jpg`,    genre: "Rock Chileno",            monthly: "5.4M",  verified: true,
      bio: "La banda de rock chileno más importante de los 2000. Melodías perfectas, letras poéticas e influencia que perdura." },
    { id: "a-rosalia",    name: "Rosalía",          img: `${IMG}/artists/rosalia.jpg`,        genre: "Flamenco / Urbano",       monthly: "18.2M", verified: true,
      bio: "La artista española que fusionó el flamenco tradicional con el urbano moderno, ganando múltiples Grammy y reconocimiento mundial." },
    { id: "a-kendrick",   name: "Kendrick Lamar",   img: `${IMG}/artists/kendrick-lamar.jpg`, genre: "Hip-Hop / Rap",           monthly: "29.5M", verified: true,
      bio: "El poeta del hip-hop. Ganador del Premio Pulitzer, K.Dot es considerado el mejor MC vivo por muchos críticos y fans." },
    { id: "a-sza",        name: "SZA",              img: `${IMG}/artists/sza.jpg`,            genre: "R&B / Soul",              monthly: "35.6M", verified: true,
      bio: "La voz más honesta del R&B alternativo. Sus letras introspectivas sobre amor, identidad y crecimiento conectan profundamente." },
    { id: "a-coldplay",   name: "Coldplay",         img: `${IMG}/artists/coldplay.jpg`,       genre: "Rock / Alternative",      monthly: "41.3M", verified: true,
      bio: "Banda británica que lleva décadas entregando himnos emocionantes. De 'Yellow' a 'Music of the Spheres', siempre evolucionando." },
  ],

  albums: [
    { id:"al-uvst",     title:"Un Verano Sin Ti",         artistId:"a-badbunny",  year:2022, img:`${IMG}/albums/un-verano-sin-ti.jpg`,
      songs:[["s1","El Apagón",237],["s2","Tití Me Preguntó",229],["s3","Efecto",189],["s4","Me Porto Bonito",183],["s5","Ojitos Lindos",225]] },
    { id:"al-yhlq",     title:"YHLQMDLG",                artistId:"a-badbunny",  year:2020, img:`${IMG}/albums/yhlqmdlg.jpg`,
      songs:[["s6","Safaera",270],["s7","LA DIFÍCIL",193],["s8","Ignorantes",210]] },
    { id:"al-msb",      title:"Mañana Será Bonito",       artistId:"a-karolg",    year:2023, img:`${IMG}/albums/manana-sera-bonito.jpg`,
      songs:[["s9","TQG",194],["s10","Amargura",205],["s11","X Si Volvemos",198],["s12","Provenza",228]] },
    { id:"al-fcf",      title:"Feliz Cumpleaños Ferxxo",  artistId:"a-feid",      year:2023, img:`${IMG}/albums/feliz-cumpleanos-ferxxo.jpg`,
      songs:[["s13","NIÑA",203],["s14","Brickell",215],["s15","Luna",198],["s16","Castigo",212]] },
    { id:"al-1989",     title:"1989 (Taylor's Version)",  artistId:"a-taylorswift",year:2023, img:`${IMG}/albums/1989.jpg`,
      songs:[["s17","Shake It Off",220],["s18","Style",231],["s19","Blank Space",231],["s20","Bad Blood",213]] },
    { id:"al-folklore", title:"Folklore",                 artistId:"a-taylorswift",year:2020, img:`${IMG}/albums/folklore.jpg`,
      songs:[["s21","cardigan",239],["s22","exile",285],["s23","august",261],["s24","seven",205]] },
    { id:"al-ah",       title:"After Hours",              artistId:"a-weeknd",    year:2020, img:`${IMG}/albums/after-hours.jpg`,
      songs:[["s25","Blinding Lights",200],["s26","Save Your Tears",215],["s27","In Your Eyes",238],["s28","Heartless",198]] },
    { id:"al-fn",       title:"Future Nostalgia",         artistId:"a-dualipa",   year:2020, img:`${IMG}/albums/future-nostalgia.jpg`,
      songs:[["s29","Levitating",203],["s30","Physical",194],["s31","Don't Start Now",183],["s32","Break My Heart",221]] },
    { id:"al-norma",    title:"Norma",                    artistId:"a-monlaferte",year:2019, img:`${IMG}/albums/norma.jpg`,
      songs:[["s33","Tu Falta de Querer",218],["s34","Amárrame",243],["s35","Tormento",195]] },
    { id:"al-lvlz",     title:"La Velocidad de la Luz",   artistId:"a-bunkers",   year:2005, img:`${IMG}/albums/la-velocidad-de-la-luz.jpg`,
      songs:[["s36","Quién Fuera",238],["s37","Miño",208],["s38","Canción de Lejos",219],["s39","La Suite Nupcial",241]] },
    { id:"al-motomami", title:"MOTOMAMI",                 artistId:"a-rosalia",   year:2022, img:`${IMG}/albums/motomami.jpg`,
      songs:[["s40","SAOKO",177],["s41","BIZCOCHITO",130],["s42","HENTAI",195],["s43","LA FAMA",246]] },
    { id:"al-damn",     title:"DAMN.",                    artistId:"a-kendrick",  year:2017, img:`${IMG}/albums/damn.jpg`,
      songs:[["s44","HUMBLE.",177],["s45","DNA.",185],["s46","LOVE.",213],["s47","LOYALTY.",233]] },
    { id:"al-sos",      title:"SOS",                      artistId:"a-sza",       year:2022, img:`${IMG}/albums/sos.jpg`,
      songs:[["s48","Kill Bill",154],["s49","Shirt",219],["s50","Gone Girl",228],["s51","Used",204]] },
    { id:"al-parachutes",title:"Parachutes",              artistId:"a-coldplay",  year:2000, img:`${IMG}/albums/parachutes.jpg`,
      songs:[["s52","Yellow",267],["s53","The Scientist",309],["s54","Trouble",227],["s55","Shiver",299]] },
  ],

  playlists: [
    { id:"pl-topglobal", name:"Top 50 Global",          img:`${IMG}/playlists/top-global.jpg`,      desc:"Las canciones más escuchadas del planeta ahora mismo.", owner:"Spotify",
      songIds:["s25","s1","s9","s17","s29","s44","s13","s48","s40","s6"] },
    { id:"pl-exitos",    name:"Éxitos de Hoy",          img:`${IMG}/playlists/exitos-de-hoy.jpg`,   desc:"Los hits frescos que dominan las listas.", owner:"Spotify",
      songIds:["s9","s13","s1","s17","s25","s29","s40","s44","s48","s30"] },
    { id:"pl-daily1",    name:"Daily Mix 1",            img:`${IMG}/playlists/daily-mix-1.jpg`,     desc:"Bad Bunny, Feid, Karol G y más.", owner:"Spotify",
      songIds:["s1","s13","s9","s3","s16","s11","s5","s6","s7","s15"] },
    { id:"pl-daily2",    name:"Daily Mix 2",            img:`${IMG}/playlists/daily-mix-2.jpg`,     desc:"The Weeknd, Dua Lipa, Taylor Swift y más.", owner:"Spotify",
      songIds:["s25","s29","s17","s27","s31","s18","s30","s19","s26","s20"] },
    { id:"pl-lofi",      name:"Chill Lo-Fi",            img:`${IMG}/playlists/chill-lofi.jpg`,      desc:"Beats tranquilos para estudiar, leer o descansar.", owner:"Spotify",
      songIds:["s21","s33","s36","s52","s54","s23","s55","s53","s24","s35"] },
    { id:"pl-fitness",   name:"Gym Mode 💪",            img:`${IMG}/playlists/gimnasio.jpg`,        desc:"El soundtrack para tu entrenamiento más intenso.", owner:"Spotify",
      songIds:["s44","s40","s1","s25","s9","s29","s17","s45","s13","s41"] },
    { id:"pl-rockcl",    name:"Rock Nacional CL",       img:`${IMG}/playlists/rock-nacional.jpg`,   desc:"Lo mejor del rock chileno, clásico y contemporáneo.", owner:"Spotify",
      songIds:["s36","s37","s38","s39","s33","s34","s35"] },
    { id:"pl-ferxxo",    name:"Bichota Party 🐍",       img:`${IMG}/playlists/bichota-party.jpg`,   desc:"100% reggaeton y urbano de lo más pesado.", owner:"Spotify",
      songIds:["s9","s1","s13","s6","s3","s11","s16","s7","s15","s4"] },
    { id:"pl-latinx",    name:"Latino Caliente",        img:`${IMG}/playlists/latino-caliente.jpg`, desc:"El sabor latino que te pone a bailar.", owner:"Spotify",
      songIds:["s1","s9","s13","s43","s40","s3","s11","s12","s5","s16"] },
    { id:"pl-sad",       name:"Tristeza Premium 😢",    img:`${IMG}/playlists/tristeza-premium.jpg`,desc:"Cuando el sentimiento es fuerte.", owner:"Spotify",
      songIds:["s33","s21","s22","s52","s23","s34","s24","s48","s50","s54"] },
    { id:"pl-rap",       name:"Rap & R&B",              img:`${IMG}/playlists/rap-rnb.jpg`,         desc:"Hip-hop y R&B de calidad mundial.", owner:"Spotify",
      songIds:["s44","s45","s48","s47","s46","s49","s50","s51","s27","s26"] },
    { id:"pl-indie",     name:"Indie Acústico",         img:`${IMG}/playlists/indie-acustico.jpg`,  desc:"Guitarras, sentimiento y mucho mood.", owner:"Spotify",
      songIds:["s21","s22","s23","s52","s53","s54","s33","s35","s55","s24"] },
  ],

  userPlaylists: [],

  genres: [
    { id:"g-pop",        name:"Pop",           img:`${IMG}/genres/pop.jpg`,           color:"#8d67ab" },
    { id:"g-reggaeton",  name:"Reggaeton",      img:`${IMG}/genres/reggaeton.jpg`,     color:"#e8115b" },
    { id:"g-rock",       name:"Rock",           img:`${IMG}/genres/rock.jpg`,          color:"#ba5d07" },
    { id:"g-lofi",       name:"Lo-Fi",          img:`${IMG}/genres/lofi.jpg`,          color:"#537aa1" },
    { id:"g-fiesta",     name:"Fiesta",         img:`${IMG}/genres/fiesta.jpg`,        color:"#e61e32" },
    { id:"g-chill",      name:"Chill",          img:`${IMG}/genres/chill.jpg`,         color:"#1e3264" },
    { id:"g-hiphop",     name:"Hip-Hop",        img:`${IMG}/genres/hip-hop.jpg`,       color:"#ba2323" },
    { id:"g-electronica",name:"Electrónica",    img:`${IMG}/genres/electronica.jpg`,   color:"#503750" },
    { id:"g-rnb",        name:"R&B",            img:`${IMG}/genres/rnb.jpg`,           color:"#477d95" },
    { id:"g-romanticas", name:"Románticas",     img:`${IMG}/genres/romanticas.jpg`,    color:"#c13584" },
    { id:"g-muschi",     name:"Música Chilena", img:`${IMG}/genres/musica-chilena.jpg`,color:"#2d7236" },
    { id:"g-entrenamiento",name:"Entrenamiento",img:`${IMG}/genres/entrenamiento.jpg`, color:"#e1b12c" },
  ],

  plans: [
    { id:"mini",       name:"Premium Mini",       price:2990,  desc:"1 cuenta / móvil / 30 días", features:["Sin anuncios","Escucha en móvil","Calidad alta","1 descarga al mes"] },
    { id:"individual", name:"Premium Individual", price:5490,  desc:"1 cuenta / 3 meses gratis",  features:["Sin anuncios","Todos los dispositivos","Calidad muy alta","Descargas ilimitadas"] },
    { id:"duo",        name:"Premium Dúo",        price:7490,  desc:"2 cuentas / pareja",          features:["Sin anuncios","2 cuentas premium","Calidad muy alta","Descargas ilimitadas","Playlist Duo Mix"] },
    { id:"familiar",   name:"Premium Familiar",   price:8990,  desc:"6 cuentas / una dirección",  features:["Sin anuncios","6 cuentas premium","Calidad muy alta","Control parental","Descargas ilimitadas","Spotify Kids"] },
    { id:"estudiante", name:"Premium Estudiante", price:2990,  desc:"50% descuento / verificación", features:["Sin anuncios","1 cuenta premium","Calidad muy alta","Descargas ilimitadas","Hulu + Showtime (EE.UU.)"] },
  ],

  songs: [],

  buildSongs() {
    const songs = [];
    for (const alb of DB.albums) {
      for (const [id, title, dur] of alb.songs) {
        songs.push({ id, title, albumId: alb.id, artistId: alb.artistId, duration: dur });
      }
    }
    DB.songs = songs;
  },

  song(id)     { return DB.songs.find(s => s.id === id); },
  album(id)    { return DB.albums.find(a => a.id === id); },
  artist(id)   { return DB.artists.find(a => a.id === id); },
  genre(id)    { return DB.genres.find(g => g.id === id); },
  plan(id)     { return DB.plans.find(p => p.id === id) || null; },

  playlist(id) {
    return DB.playlists.find(p => p.id === id)
        || DB.userPlaylists.find(p => p.id === id)
        || null;
  },

  allPlaylists() { return [...DB.playlists, ...DB.userPlaylists]; },
  isUserPlaylist(id) { return DB.userPlaylists.some(p => p.id === id); },

  search(q) {
    if (!q) return { artists: [], albums: [], playlists: [], songs: [] };
    const norm = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const nq = norm(q);
    return {
      artists:   DB.artists.filter(a => norm(a.name).includes(nq)),
      albums:    DB.albums.filter(a => norm(a.title).includes(nq) || norm(DB.artist(a.artistId)?.name||"").includes(nq)),
      playlists: DB.allPlaylists().filter(p => norm(p.name).includes(nq)),
      songs:     DB.songs.filter(s => norm(s.title).includes(nq) || norm(DB.artist(s.artistId)?.name||"").includes(nq)).slice(0, 10),
    };
  },

  homeSections: [],
};

DB.buildSongs();

/* ---------- Playlists del usuario (desde store) ---------- */
const _DEFAULT_USER_PLAYLISTS = [
  { id:"pl-mia",  name:"Mi playlist favorita",   desc:"Mis temas favoritos del momento.", owner:"Matyaz Paredes", img:`${IMG}/playlists/mi-playlist-favorita.jpg`, songIds:["s25","s1","s9","s17","s13","s33","s29"] },
  { id:"pl-tarea",name:"Foco para programar 🧠",  desc:"Lo-Fi y chill para estudiar sin distracciones.", owner:"Matyaz Paredes", img:`${IMG}/playlists/foco-programar.jpg`, songIds:["s21","s23","s36","s52","s33","s53"] },
  { id:"pl-toca", name:"Para cantar en la ducha", desc:"Éxitos que suenan mejor con el agua corriendo.", owner:"Matyaz Paredes", img:`${IMG}/playlists/cantar-ducha.jpg`, songIds:["s18","s29","s30","s17","s1","s9"] },
];

const STORED_PL = Store.get("userPlaylists") || [];
DB.userPlaylists = [
  ..._DEFAULT_USER_PLAYLISTS.map(def => {
    const saved = STORED_PL.find(p => p && p.id === def.id);
    return saved ? { ...def, ...saved, songIds: [...(saved.songIds || def.songIds)] } : { ...def, songIds: [...def.songIds] };
  }),
  ...STORED_PL.filter(p => p && p.id && !_DEFAULT_USER_PLAYLISTS.some(d => d.id === p.id))
              .map(p => ({ ...p, songIds: [...(p.songIds || [])] })),
];

DB.homeSections = [
  { title:"Reproducido recientemente", items:[
    {type:"album",    id:"al-ah"},
    {type:"playlist", id:"pl-exitos"},
    {type:"album",    id:"al-fn"},
    {type:"playlist", id:"pl-lofi"},
    {type:"artist",   id:"a-weeknd"},
    {type:"album",    id:"al-msb"},
  ]},
  { title:"Artistas populares", items:[
    {type:"artist", id:"a-badbunny"},
    {type:"artist", id:"a-karolg"},
    {type:"artist", id:"a-taylorswift"},
    {type:"artist", id:"a-weeknd"},
    {type:"artist", id:"a-dualipa"},
    {type:"artist", id:"a-rosalia"},
    {type:"artist", id:"a-kendrick"},
  ]},
  { title:"Álbumes esenciales", items:[
    {type:"album", id:"al-uvst"},
    {type:"album", id:"al-1989"},
    {type:"album", id:"al-motomami"},
    {type:"album", id:"al-damn"},
    {type:"album", id:"al-fn"},
    {type:"album", id:"al-ah"},
    {type:"album", id:"al-sos"},
  ]},
  { title:"Playlists para ti", items:[
    {type:"playlist", id:"pl-daily1"},
    {type:"playlist", id:"pl-daily2"},
    {type:"playlist", id:"pl-sad"},
    {type:"playlist", id:"pl-fitness"},
    {type:"playlist", id:"pl-indie"},
    {type:"playlist", id:"pl-ferxxo"},
  ]},
  { title:"Hecho en Chile 🇨🇱", items:[
    {type:"artist",   id:"a-monlaferte"},
    {type:"artist",   id:"a-bunkers"},
    {type:"album",    id:"al-norma"},
    {type:"album",    id:"al-lvlz"},
    {type:"playlist", id:"pl-rockcl"},
  ]},
];

DB.homeTrending = {
  title: "Canciones del momento",
  queue: "playlist:pl-topglobal",
  songIds: ["s1","s25","s9","s13","s5","s29","s27","s18","s43","s44"],
};

console.log("[DATAJS] homeSections:", DB.homeSections.length, "| homeTrending:", !!DB.homeTrending, "| userPlaylists:", DB.userPlaylists.length, "| songs:", DB.songs.length);
window.addEventListener("error", function(e){ console.error("[DATAJS] GLOBAL ERROR:", e.message, e.filename, e.lineno); });
