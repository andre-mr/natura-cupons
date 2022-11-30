// replace with real values
const apiURL = "http://localhost:3000";
const publicKey = "devkey";

class PageConfigs {
  backgroundColor = "";
  buttonColor = "";
  defaultTarget = "";
  image = "";
  text = "";
  textColor = "";
}

class Visit {
  dateTime = null;
  userID = null;
  userDevice = null;
  userBrowser = null;
}

let targetURL;
let params = new URL(window.location).searchParams;

if (!params) {
  params = new URL(document.location).searchParams;
}

if (params) {
  targetURL = params.get("url");
} else {
  targetURL = window.location.href.substring(
    window.location.href.indexOf("url=") + 4,
    window.location.href.length
  );
  if (!targetURL) {
    targetURL = document.location.href.substring(
      document.location.href.indexOf("url=") + 4,
      document.location.href.length
    );
  }
}

let couponCode;
let pageConfigs = new PageConfigs();
let instagramAndroid = false;

const topImage = document.getElementById("topImage");
const contentText = document.getElementById("contentText");
const couponCodeText = document.getElementById("couponCodeText");
const codeButton = document.getElementById("codeButton");
const goButton = document.getElementById("goButton");

goButton.addEventListener("click", goProduct);
codeButton.addEventListener("click", goProduct);

async function getCoupon() {
  if (targetURL) {
    const result = await fetch(`${apiURL}?publickey=${publicKey}`);
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
  topImage.src = pageConfigs.image;
  contentText.innerText = pageConfigs.text;

  document.body.style.backgroundColor = `${pageConfigs.backgroundColor}`;
  contentText.style.setProperty("color", `${pageConfigs.textColor}`);
  codeButton.style.setProperty("border-color", `${pageConfigs.buttonColor}`);
  goButton.style.setProperty("background-color", `${pageConfigs.buttonColor}`);

  await instagramBrowserAdapt();
}

async function goProduct() {
  await copyCode();
  if (instagramAndroid) {
    // alert(
    //   'Por favor, toque no menu acima e escolha a opção "Abrir no Chrome".'
    // );
  } else {
    await copyCode();
    try {
      window.location.replace(targetURL);
    } catch (e) {
      window.location = targetURL;
    }
  }
}

async function copyCode() {
  if (navigator.clipboard) {
    //Chrome
    await navigator.clipboard.writeText(couponCode);
  } else if (window.clipboardData) {
    // Internet Explorer
    await window.clipboardData.setData("Text", couponCode);
  } else {
    // Old
    const textArea = document.createElement("textarea");
    textArea.value = couponCode;
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy");
    } catch (err) {
      console.error("Unable to copy", err);
    }

    document.body.removeChild(textArea);
  }
}

async function instagramBrowserAdapt() {
  if (instagramAndroid) {
    contentText.innerText =
      "Utilize o cupom acima no site para um desconto especial.";
    const codeButtonText = codeButton.innerText;
    codeButton.innerHTML = `<a href="${targetURL}">${codeButtonText}</a>`;
    goButton.innerHTML = `<a href="${targetURL}">Ir à loja</a>`;
  }
}

async function registerVisit() {
  const visit = new Visit();

  if (typeof Storage !== "undefined") {
    const userID = localStorage.getItem("userID");
    if (userID && userID != undefined) {
      visit.userID = userID;
    }
  }

  const userAgentInfo = navigator.userAgent;

  if (userAgentInfo.toLowerCase().indexOf("iphone") >= 0) {
    visit.userDevice = "iphone";
  } else if (userAgentInfo.toLowerCase().indexOf("ipad") >= 0) {
    visit.userDevice = "ipad";
  } else if (userAgentInfo.toLowerCase().indexOf("mac os") >= 0) {
    visit.userDevice = "mac";
  } else if (userAgentInfo.toLowerCase().indexOf("android") >= 0) {
    visit.userDevice = "android";
  } else if (userAgentInfo.toLowerCase().indexOf("linux") >= 0) {
    visit.userDevice = "linux";
  } else if (userAgentInfo.toLowerCase().indexOf("windows") >= 0) {
    visit.userDevice = "windows";
  }

  if (userAgentInfo.toLowerCase().indexOf("instagram") >= 0) {
    visit.userBrowser = "instagram";
  } else if (
    userAgentInfo.toLowerCase().indexOf("safari") >= 0 &&
    (userAgentInfo.toLowerCase().indexOf("ipad") >= 0 ||
      userAgentInfo.toLowerCase().indexOf("mac os") >= 0 ||
      userAgentInfo.toLowerCase().indexOf("macintosh") >= 0)
  ) {
    visit.userBrowser = "safari";
  } else if (userAgentInfo.toLowerCase().indexOf("edg") >= 0) {
    visit.userBrowser = "edge";
  } else if (userAgentInfo.toLowerCase().indexOf("chrome") >= 0) {
    visit.userBrowser = "chrome";
  } else if (userAgentInfo.toLowerCase().indexOf("firefox") >= 0) {
    visit.userBrowser = "firefox";
  }

  const defaultHeader = new Headers();
  defaultHeader.append("Content-Type", "application/json");
  const requestJSON = JSON.stringify(visit);

  const requestOptions = {
    method: "POST",
    headers: defaultHeader,
    body: requestJSON,
    redirect: "follow",
  };

  const result = await fetch(
    `${apiURL}/visit/add?publickey=${publicKey}`,
    requestOptions
  );
  const resultResponse = await result.json();
  if (resultResponse && resultResponse != visit.userID) {
    if (typeof Storage !== "undefined") {
      localStorage.setItem("userID", resultResponse);
    }
  }
}

async function startup() {
  if (
    navigator.userAgent.includes("Instagram") &&
    (navigator.userAgent.includes("Android") ||
      !navigator.userAgent.includes("iPhone"))
  ) {
    instagramAndroid = true;
  }
  await getPageConfigs();
  if (!targetURL) {
    try {
      window.location.replace(pageConfigs.defaultTarget);
    } catch (e) {
      window.location = pageConfigs.defaultTarget;
    }
  } else {
    await getCoupon();
    applyPageConfigs();
  }

  registerVisit();
}

startup();
