const axios = require("axios");
const cheerio = require("cheerio");
const XenNode = require("xen-node");
const GistMan = require("./gistman");

const timeout = 30000;
const interval = 60000;
const URL = process.env.URL; // 'https://www.ignboards.com'
const BOARD_URI = process.env.BOARD_URI; // '/forums/vale-tudo.80331/'
const GIST_TOKEN = process.env.GIST_TOKEN; // ex: '9872938172983719283719283719283773'
const FILE_ID = process.env.FILE_ID; // ex: '87a6sd87a6sd86c6c8a68768a7c6868'
const FILE_NAME = process.env.FILE_NAME; // ex: 'xistoclone'
const COOKIE = JSON.parse(process.env.COOKIE); // ex ["xf_user=45345dfgfdsf4r4s4r-gdfgdfgdfg_hzdsgr434gdfhj3j3hk4j3h4k;"]

const dicionario = [
  {
    modo: "qualquer",
    excluir: [],
    chave: ["qual o lvl", "qual o level"],
    resposta: [
      "full equip lvl 20 no max",
      "gostosa",
      "lvl 100",
      "Comeria às quintas",
    ],
  },
  {
    modo: "qualquer",
    excluir: ["455747000", "455541734"],
    chave: ["ze sims", "zelão", "jose sims", "jose", "josé"],
    resposta: ["abre o boção", "potchi leva modera"],
  },
  {
    modo: "todas",
    excluir: [],
    chave: ["duro", "golpe"],
    resposta: ["nada mais pode ser feito", "RIP"],
  },
  {
    modo: "todas",
    excluir: [],
    chave: ["avaliem"],
    resposta: ["penta", "mono", "avaliando com estrelas"],
  },
  {
    modo: "todas",
    excluir: [],
    chave: ["concurso"],
    resposta: ["@BCFF11"],
  },
  {
    modo: "qualquer",
    excluir: [],
    chave: ["entra aqui", "entre aqui"],
    resposta: ["entrei, e agora?"],
  },
  {
    modo: "todas",
    excluir: [],
    chave: ["panela"],
    resposta: [
      "panela é mono",
      "não participo de panelas, lamento.",
      "panela boa",
    ],
  },
  {
    modo: "todas",
    excluir: [],
    chave: ["bom dia"],
    resposta: [
      "Bom dia meu confederado!",
      "Bom dia meu consagrado!",
      "Bom dia meu capataz.",
    ],
  },
  {
    modo: "qualquer",
    excluir: [],
    chave: ["dá pra viver", "dá para viver", "você viveria com"],
    resposta: [
      "não da nem para o sucrilhos",
      "não dá não",
    ],
  },
];

const req = new XenNode(URL);
const giz = new GistMan(GIST_TOKEN);

function randomChoice(data) {
  return data[Math.floor(Math.random() * data.length)];
}

function postingDeleyed(data) {
  setTimeout(main, data.length * timeout + interval); // call main recursively with delays
  data.forEach((thread, idx) => {
    setTimeout(() => {
      console.log("post: ", thread);
      req
        .checkLogin(COOKIE)
        .then(() => req.post(thread[2], thread[0]))
        .catch(() => console.log("xenNodeError"));
    }, idx * timeout);
  });
}

function genResponse(data) {
  let toRespond = [];
  data.forEach((post) => {
    for (key of dicionario) {
      let isPresent = (elem) => {
        let regex = new RegExp(`\\b${elem}\\b`, "i");
        return regex.test(post[1]);
      };
      if (
        key.modo === "qualquer" &&
        !key.excluir.includes(post[0]) &&
        key.chave.some(isPresent)
      ) {
        post.push(randomChoice(key.resposta));
        return toRespond.push(post);
      } else if (!key.excluir.includes(post[0]) && key.chave.every(isPresent)) {
        post.push(randomChoice(key.resposta));
        return toRespond.push(post);
      }
    }
  });
  postingDeleyed(toRespond);
}

function filterThreads(data) {
  giz
    .read(FILE_ID, FILE_NAME)
    .then((gResp) => {
      gResp = BigInt(gResp);
      let fThreads = data.filter((fil) => BigInt(fil[0]) > gResp);
      if (fThreads.length > 0) {
        giz
          .update(FILE_ID, FILE_NAME, data[0][0])
          .catch(() => console.log("gistManUpdateError"));
        genResponse(fThreads);
      } else {
        //console.log('nothing new')
        setTimeout(main, interval); // if not have new tweets call main recursively
      }
    })
    .catch((error) => console.log("gistManReadError"));
}

function main() {
  axios
    .get(URL + BOARD_URI)
    .then((resp) => {
      let $ = cheerio.load(resp.data);
      let allThreads = $(".structItem-title")
        .toArray()
        .map((element) => [
          $(element).attr("uix-data-href").slice(-10, -1),
          $(element)
            .text()
            .replace(/\t/g, "")
            .replace(/\n\n\n/g, " ")
            .trim(),
        ])
        .sort((a, b) => b[0] - a[0]);
      filterThreads(allThreads);
    })
    .catch((error) => console.log(error));
}

console.log("rodando...");
main();
