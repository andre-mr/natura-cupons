// replace with real domain
const apiURL = "http://localhost:3000";
// replace with real domain
const thisURL = "http://127.0.0.1:5500/redirect/index.html";

class PageConfigs {
  backgroundColor = "FFFFFF";
  buttonColor = "CCCCCC";
  imageB64 = "";
  text = "...";
  textColor = "000000";
}

const params = new URL(document.location).searchParams;
let targetURL = params.get("url");

let couponCode;
let pageConfigs = new PageConfigs();

const topImage = document.getElementById("topImage");
const contentText = document.getElementById("contentText");
const couponCodeText = document.getElementById("couponCodeText");
const codeButton = document.getElementById("codeButton");
const goButton = document.getElementById("goButton");

goButton.addEventListener("click", goProduct);
codeButton.addEventListener("click", copyCode);

async function getCoupon() {
  if (targetURL) {
    const result = await fetch(`${apiURL}`);
    couponCode = await result.json();
    couponCodeText.innerText = couponCode;
  } else {
    couponCodeText.classList.add("hidden");
    contentText.innerText = "Erro, contate o divulgador.";
  }
}

async function getPageConfigs() {
  const result = await fetch(`${apiURL}/configs/page`);
  const resultJSON = await result.json();
  pageConfigs = JSON.parse(JSON.stringify(resultJSON));
}

async function applyPageConfigs() {
  topImage.src = pageConfigs.imageB64;
  contentText.innerText = pageConfigs.text;

  document.body.style.backgroundColor = `#${pageConfigs.backgroundColor}`;
  contentText.style.setProperty("color", `#${pageConfigs.textColor}`);
  codeButton.style.setProperty("border-color", `#${pageConfigs.buttonColor}`);
  goButton.style.setProperty("background-color", `#${pageConfigs.buttonColor}`);
}

async function goProduct() {
  await copyCode();
  location.replace(targetURL);
}

async function copyCode() {
  await navigator.clipboard.writeText(couponCode);
}

async function startup() {
  if (!targetURL) {
    targetURL = "https://www.natura.com.br";
  }
  await getCoupon();
  await getPageConfigs();
  applyPageConfigs();
}

startup();
