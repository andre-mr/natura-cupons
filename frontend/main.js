// replace with real domain
const backendURL = "http://localhost:3000";

const sectionSelector = document.getElementById("sectionSelector");
const listSection = document.getElementById("listSection");
const configSection = document.getElementById("configSection");
const pageSection = document.getElementById("pageSection");
const liItemTemplate = document.getElementById("liItemTemplate");
const couponsSort = document.getElementById("couponsSort");
const arrowUp = document.getElementById("arrowUp");
const arrowDown = document.getElementById("arrowDown");
const modalBackground = document.getElementById("modalBackground");
const modalContainer = document.getElementById("modalContainer");
const editModal = document.getElementById("editModal");
const removeModal = document.getElementById("removeModal");
const editCouponCode = document.getElementById("editCouponCode");
const editCouponCreated = document.getElementById("editCouponCreated");
const editCouponExpired = document.getElementById("editCouponExpired");
const editCouponRedirects = document.getElementById("editCouponRedirects");
const editCouponUses = document.getElementById("editCouponUses");
const modalEditCancelButton = document.getElementById("modalEditCancelButton");
const modalRemoveCancelButton = document.getElementById(
  "modalRemoveCancelButton"
);
const modalSaveButton = document.getElementById("modalSaveButton");
const modalRemoveButton = document.getElementById("modalRemoveButton");
const addCouponButton = document.getElementById("addCouponButton");
const couponsCount = document.getElementById("couponsCount");
const usesCount = document.getElementById("usesCount");
const redirectsCount = document.getElementById("redirectsCount");
const configAlertRemainingUses = document.getElementById(
  "configAlertRemainingUses"
);
const configAutoUpdateInterval = document.getElementById(
  "configAutoUpdateInterval"
);
const configCouponUses = document.getElementById("configCouponUses");
const configRedirectsPerUse = document.getElementById("configRedirectsPerUse");
const configExpiredDays = document.getElementById("configExpiredDays");
const configApikey = document.getElementById("configApikey");
const configResetButton = document.getElementById("configResetButton");
const configUpdateButton = document.getElementById("configUpdateButton");
const couponsList = document.getElementById("couponsList");
const apikeyInput = document.getElementById("apikeyInput");
const apikeyCheckbox = document.getElementById("apikeyCheckbox");
const apikeySection = document.getElementById("apikeySection");
const logoutButton = document.getElementById("logoutButton");
const loginButton = document.getElementById("loginButton");

const pagePreviewTopImage = document.getElementById("pagePreviewTopImage");
const pagePreviewContentText = document.getElementById(
  "pagePreviewContentText"
);
const pagePreviewCouponCodeText = document.getElementById(
  "pagePreviewCouponCodeText"
);
const pagePreviewCodeButton = document.getElementById("pagePreviewCodeButton");
const pagePreviewCGoButton = document.getElementById("pagePreviewGoButton");
const pagePreviewContainer = document.getElementById("pagePreviewContainer");

const pageConfigImageSelector = document.getElementById(
  "pageConfigImageSelector"
);
const pageConfigText = document.getElementById("pageConfigText");
const pageConfigTextColor = document.getElementById("pageConfigTextColor");
const pageConfigBackgroundColor = document.getElementById(
  "pageConfigBackgroundColor"
);
const pageConfigButtonColor = document.getElementById("pageConfigButtonColor");
const pageConfigResetButton = document.getElementById("pageConfigResetButton");
const pageConfigUpdateButton = document.getElementById(
  "pageConfigUpdateButton"
);

sectionSelector.addEventListener("change", changeSection);
couponsSort.addEventListener("change", changeCouponsSort);
arrowUp.addEventListener("click", toggleSortOrder);
arrowDown.addEventListener("click", toggleSortOrder);
modalEditCancelButton.addEventListener("click", hideModal);
modalRemoveCancelButton.addEventListener("click", hideModal);
modalSaveButton.addEventListener("click", updateCoupon);
modalRemoveButton.addEventListener("click", deleteCoupon);
addCouponButton.addEventListener("click", showEditModal);
configResetButton.addEventListener("click", resetConfigs);
configUpdateButton.addEventListener("click", updateConfigs);
apikeyInput.addEventListener("keypress", userLogin);
loginButton.addEventListener("click", userLogin);
logoutButton.addEventListener("click", userLogout);
editCouponCode.addEventListener("keypress", updateCoupon);
pageConfigImageSelector.addEventListener("change", changeImageSelected);
pageConfigText.addEventListener("input", changePageConfigText);
pageConfigTextColor.addEventListener("input", changePageConfigTextColor);
pageConfigBackgroundColor.addEventListener(
  "input",
  changePageConfigBackgroundColor
);
pageConfigButtonColor.addEventListener("input", changePageConfigButtonColor);
pageConfigResetButton.addEventListener("click", pageConfigResetForm);
pageConfigUpdateButton.addEventListener("click", pageConfigUpdateConfigs);

class CouponsConfigs {
  alertRemainingUses = 5;
  autoUpdateInterval = 5;
  couponUses = 50;
  expiredDays = 30;
  redirectsPerUse = 5;
}

class PageConfigs {
  backgroundColor = "";
  textColor = "";
  buttonColor = "";
  text = "";
  imageB64 = "";
}

let coupons = [];
let couponsConfigs = new CouponsConfigs();
let pageConfigs = null;
let sort = "uses";
let sortASC = 1;
let selectedCoupon;
let apikey;
let autoUpdateTimer = 0;
let autoUpdateRunning = false;

const autoUpdateLoop = setInterval(async () => {
  if (autoUpdateRunning) {
    if (autoUpdateTimer <= 0) {
      await getCouponsActive();
      sortCoupons();
      populateCouponsList();
      resetAutoUpdateTimer();
    } else {
      autoUpdateTimer--;
    }
  }
}, 1000);

async function pageConfigUpdateConfigs() {
  const defaultHeader = new Headers();
  defaultHeader.append("Content-Type", "application/json");

  const newConfigs = new PageConfigs();
  newConfigs.backgroundColor = pageConfigs.backgroundColor;
  newConfigs.buttonColor = pageConfigs.buttonColor;
  newConfigs.textColor = pageConfigs.textColor;
  newConfigs.text = pageConfigs.text;
  newConfigs.imageB64 = pageConfigs.imageB64;

  const requestConfigs = [];
  requestConfigs.push({
    description: "backgroundColor",
    value: pageConfigs.backgroundColor,
  });
  requestConfigs.push({
    description: "buttonColor",
    value: pageConfigs.buttonColor,
  });
  requestConfigs.push({
    description: "imageB64",
    value: pageConfigs.imageB64,
  });
  requestConfigs.push({
    description: "text",
    value: pageConfigs.text,
  });
  requestConfigs.push({
    description: "textColor",
    value: pageConfigs.imageB64,
  });
  const requestJSON = JSON.stringify(requestConfigs);

  const requestOptions = {
    method: "PUT",
    headers: defaultHeader,
    body: requestJSON,
    redirect: "follow",
  };

  fetch(`${backendURL}/configs/page/update?apikey=${apikey}`, requestOptions)
    .then(async (response) => {
      window.alert("Configurações atualizadas!");
      await pageConfigResetForm();
      populatePageConfigs();
      applyPagePreview();
    })
    .catch(async (error) => {
      window.alert("Ocorreu um erro na atualização!");
      // await getCouponsConfigs();
      // populateConfigs();
    });
}

async function pageConfigResetForm() {
  await getPageConfigs();
  pageConfigImageSelector.value = null;
  pageConfigText.value = null;
  pageConfigBackgroundColor.value = null;
  pageConfigButtonColor.value = null;
  pageConfigTextColor.value = null;
  applyPagePreview();
}

async function changePageConfigText(e) {
  pageConfigs.text = e.target.value;
  pagePreviewContentText.innerText = pageConfigs.text;
}

async function changePageConfigTextColor(e) {
  pageConfigs.textColor = `${e.target.value}`;
  applyPagePreview();
}

async function changePageConfigBackgroundColor(e) {
  pageConfigs.backgroundColor = `${e.target.value}`;
  applyPagePreview();
}

async function changePageConfigButtonColor(e) {
  pageConfigs.buttonColor = `${e.target.value}`;
  applyPagePreview();
}

async function changeImageSelected(e) {
  var reader = new FileReader();
  reader.onload = function () {
    pageConfigs.imageB64 = reader.result;
    pagePreviewTopImage.src = pageConfigs.imageB64;
  };
  reader.readAsDataURL(e.target.files[0]);
}

function resetAutoUpdateTimer() {
  autoUpdateTimer = couponsConfigs.autoUpdateInterval * 60;
}

async function highlightChange(element) {
  if (!element.classList.contains("highlight")) {
    element.classList.add("highlight");
    setTimeout(() => {
      element.classList.remove("highlight");
    }, 500);
  }
}

async function autoLogin() {
  apikey = localStorage.getItem("apikey");
  if (apikey) {
    const loginResult = await login();
    if (loginResult) {
      startup();
    } else {
      window.alert("Senha inválida!");
    }
  }
  apikeyInput.focus();
}

async function userLogin(e) {
  if (e && ((e.key && e.keyCode == 13) || !e.key)) {
    apikey = apikeyInput.value;
    const loginResult = await login();
    if (loginResult == true) {
      if (apikeyCheckbox.checked) {
        localStorage.setItem("apikey", apikey);
      }
      startup();
    } else {
      apikeyInput.value = null;
      window.alert("Senha inválida!");
    }
  }
}

async function userLogout() {
  apikey = null;
  localStorage.removeItem("apikey");
  window.location.reload();
}

async function login() {
  const result = await fetch(`${backendURL}/login?apikey=${apikey}`);
  return await result.json();
}

async function changeSection(e) {
  switch (e.target.value) {
    case "coupons":
      showListSection();
      await getCouponsActive();
      populateCouponsList();
      sortCoupons();
      autoUpdateRunning = true;
      break;
    case "inactive":
      showListSection();
      await getCouponsInactive();
      populateCouponsList();
      sortCoupons();
      autoUpdateRunning = false;
      break;
    case "settings":
      showConfigSection();
      await getCouponsConfigs();
      populateConfigs();
      autoUpdateRunning = false;
      break;
    case "page":
      showPageSection();
      await getPageConfigs();
      applyPagePreview();
      autoUpdateRunning = false;
      break;
  }
}

async function resetConfigs() {
  await getCouponsConfigs();
  populateConfigs();
}

async function updateConfigs() {
  const defaultHeader = new Headers();
  defaultHeader.append("Content-Type", "application/json");

  if (configApikey.value && configApikey.value != apikey) {
    const requestJSON = JSON.stringify({ value: configApikey.value });

    const requestOptions = {
      method: "PUT",
      headers: defaultHeader,
      body: requestJSON,
      redirect: "follow",
    };

    fetch(`${backendURL}/login/update?apikey=${apikey}`, requestOptions)
      .then(async (response) => {
        window.alert("Configurações atualizadas!");
        apikey = configApikey.value;
        configApikey.value = null;
        localStorage.setItem("apikey", apikey);
        await getCouponsConfigs();
        populateConfigs();
      })
      .catch(async (error) => {
        window.alert("Ocorreu um erro na atualização!");
        await getCouponsConfigs();
        populateConfigs();
      });
  }

  if (validateConfigsForm()) {
    const requestConfigs = [];
    requestConfigs.push({
      description: "alertRemainingUses",
      value: configAlertRemainingUses.value,
    });
    requestConfigs.push({
      description: "autoUpdateInterval",
      value: configAutoUpdateInterval.value,
    });
    requestConfigs.push({
      description: "couponUses",
      value: configCouponUses.value,
    });
    requestConfigs.push({
      description: "expiredDays",
      value: configExpiredDays.value,
    });
    requestConfigs.push({
      description: "redirectsPerUse",
      value: configRedirectsPerUse.value,
    });
    const requestJSON = JSON.stringify(requestConfigs);

    const requestOptions = {
      method: "PUT",
      headers: defaultHeader,
      body: requestJSON,
      redirect: "follow",
    };

    fetch(`${backendURL}/configs/update?apikey=${apikey}`, requestOptions)
      .then(async (response) => {
        window.alert("Configurações atualizadas!");
        await getCouponsConfigs();
        populateConfigs();
      })
      .catch(async (error) => {
        window.alert("Ocorreu um erro na atualização!");
        await getCouponsConfigs();
        populateConfigs();
      });
  }
}

function validateConfigsForm() {
  return (
    configAlertRemainingUses.value &&
    configAutoUpdateInterval.value &&
    configCouponUses.value &&
    configExpiredDays.value &&
    configRedirectsPerUse.value &&
    (configAlertRemainingUses.value != couponsConfigs.alertRemainingUses ||
      configAutoUpdateInterval.value != couponsConfigs.autoUpdateInterval ||
      configCouponUses.value != couponsConfigs.couponUses ||
      configExpiredDays.value != couponsConfigs.expiredDays ||
      configRedirectsPerUse.value != couponsConfigs.redirectsPerUse)
  );
}

async function updateCoupon(e) {
  if ((e && e.key && e.keyCode == 13) || !e || !e.key) {
    if (selectedCoupon) {
      const defaultHeader = new Headers();
      defaultHeader.append("Content-Type", "application/json");
      const requestJSON = JSON.stringify(selectedCoupon);

      const requestOptions = {
        method: "PUT",
        headers: defaultHeader,
        body: requestJSON,
        redirect: "follow",
      };

      const result = await fetch(
        `${backendURL}/coupons/update?apikey=${apikey}`,
        requestOptions
      );
    } else {
      selectedCoupon = {};
      selectedCoupon.code = editCouponCode.value;
      selectedCoupon.created = new Date(editCouponCreated.value);
      selectedCoupon.expired = editCouponExpired.value
        ? new Date(editCouponExpired.value)
        : null;
      selectedCoupon.redirects = editCouponRedirects.value;
      selectedCoupon.uses = editCouponUses.value;
      const today = new Date();
      if (selectedCoupon.expired < today) {
        selectedCoupon.active = 0;
      } else {
        selectedCoupon.active = 1;
      }

      const defaultHeader = new Headers();
      defaultHeader.append("Content-Type", "application/json");
      const requestJSON = JSON.stringify(selectedCoupon);

      const requestOptions = {
        method: "POST",
        headers: defaultHeader,
        body: requestJSON,
        redirect: "follow",
      };

      const result = await fetch(
        `${backendURL}/coupons/add?apikey=${apikey}`,
        requestOptions
      );
      hideModal();
      await getCouponsActive();
      sortCoupons();
      populateCouponsList();
      editCouponCode.classList.remove("requiredField");
    }

    selectedCoupon = null;
  }
}

async function deleteCoupon() {
  const defaultHeader = new Headers();
  defaultHeader.append("Content-Type", "application/json");
  const requestJSON = JSON.stringify(selectedCoupon);

  const requestOptions = {
    method: "DELETE",
    headers: defaultHeader,
    body: requestJSON,
    redirect: "follow",
  };

  const result = await fetch(
    `${backendURL}/coupons/delete?apikey=${apikey}`,
    requestOptions
  );

  hideModal();
  await getCouponsActive();
  sortCoupons();
  populateCouponsList();
  selectedCoupon = null;
}

function hideModal() {
  !modalBackground.classList.contains("hidden")
    ? modalBackground.classList.add("hidden")
    : null;
  !modalContainer.classList.contains("hidden")
    ? modalContainer.classList.add("hidden")
    : null;
}

function toggleSortOrder() {
  arrowDown.classList.toggle("hidden");
  arrowUp.classList.toggle("hidden");
  sortASC = -sortASC;
  sortCoupons();
}

function changeCouponsSort(e) {
  sort = e.target.value;
  sortCoupons();
}

function sortCoupons() {
  switch (sort) {
    case "code":
      coupons.sort((a, b) => {
        if (a.code > b.code) {
          return sortASC;
        }
        if (a.code < b.code) {
          return -sortASC;
        }
        return 0;
      });
      break;
    case "created":
      coupons.sort((a, b) => {
        if (a.created > b.created) {
          return sortASC;
        }
        if (a.created < b.created) {
          return -sortASC;
        }
        return 0;
      });
      break;
    case "expired":
      coupons.sort((a, b) => {
        if (a.expired > b.expired) {
          return sortASC;
        }
        if (a.expired < b.expired) {
          return -sortASC;
        }
        return 0;
      });
      break;
    case "redirects":
      coupons.sort((a, b) => {
        if (a.redirects > b.redirects) {
          return sortASC;
        }
        if (a.redirects < b.redirects) {
          return -sortASC;
        }
        return 0;
      });
      break;
    case "uses":
      coupons.sort((a, b) => {
        if (a.uses > b.uses) {
          return sortASC;
        }
        if (a.uses < b.uses) {
          return -sortASC;
        }
        return 0;
      });
      break;
  }
  populateCouponsList();
}

function showListSection() {
  listSection.classList.contains("hidden")
    ? listSection.classList.remove("hidden")
    : null;
  !configSection.classList.contains("hidden")
    ? configSection.classList.add("hidden")
    : null;
  !pageSection.classList.contains("hidden")
    ? pageSection.classList.add("hidden")
    : null;
}

function showConfigSection() {
  configSection.classList.contains("hidden")
    ? configSection.classList.remove("hidden")
    : null;
  !listSection.classList.contains("hidden")
    ? listSection.classList.add("hidden")
    : null;
  !pageSection.classList.contains("hidden")
    ? pageSection.classList.add("hidden")
    : null;
}

function showPageSection() {
  pageSection.classList.contains("hidden")
    ? pageSection.classList.remove("hidden")
    : null;
  !listSection.classList.contains("hidden")
    ? listSection.classList.add("hidden")
    : null;
  !configSection.classList.contains("hidden")
    ? configSection.classList.add("hidden")
    : null;
}

async function getCouponsActive() {
  coupons = [];
  const result = await fetch(`${backendURL}/coupons/active?apikey=${apikey}`);
  const resultJSON = await result.json();
  for (const item of resultJSON) {
    item.created = new Date(item.created);
    item.expired = item.expired ? new Date(item.expired) : null;
    coupons.push(item);
  }
}

async function getCouponsInactive() {
  coupons = [];
  const result = await fetch(`${backendURL}/coupons/inactive?apikey=${apikey}`);
  const resultJSON = await result.json();
  for (const item of resultJSON) {
    item.created = new Date(item.created);
    item.expired = item.expired ? new Date(item.expired) : null;
    coupons.push(item);
  }
}

async function getCouponsConfigs() {
  const result = await fetch(`${backendURL}/configs/coupons?apikey=${apikey}`);
  const resultJSON = await result.json();
  couponsConfigs = JSON.parse(JSON.stringify(resultJSON));
}

async function getPageConfigs() {
  const result = await fetch(`${backendURL}/configs/page?apikey=${apikey}`);
  const resultJSON = await result.json();
  pageConfigs = JSON.parse(JSON.stringify(resultJSON));
}

function populateCouponsList() {
  couponsCount.innerText = coupons.length;
  let totalUses = (totalRedirects = 0);
  for (const coupon of coupons) {
    totalUses += coupon.uses;
    totalRedirects += coupon.redirects;
  }
  usesCount.innerText = totalUses;
  redirectsCount.innerText = totalRedirects;
  couponsList.innerHTML = null;

  for (const coupon of coupons) {
    const newItem = liItemTemplate.cloneNode(true);
    newItem.classList.remove("hidden");
    newItem.querySelector(".liID").innerText = coupon.id;
    newItem.querySelector(".liTextCode").value = `${coupon.code}`;
    if (coupon.skips > 0) {
      newItem.querySelector(".liTextCode").classList.add("highlightCurrent");
    }

    if (coupon.uses <= couponsConfigs.alertRemainingUses) {
      !newItem.querySelector(".liTextCode").classList.contains("textDanger")
        ? newItem.querySelector(".liTextCode").classList.add("textDanger")
        : null;
    } else {
      newItem.querySelector(".liTextCode").classList.remove("textDanger");
    }
    newItem
      .querySelector(".liTextCode")
      .addEventListener("keypress", changeCodeValue);
    newItem
      .querySelector(".liTextCode")
      .addEventListener("focusout", changeCodeValue);
    newItem.querySelector(".liTextDateCreated").value = `${formatDateUS(
      coupon.created
    )}`;
    newItem.querySelector(".liTextDateExpired").value = `${
      coupon.expired ? formatDateUS(coupon.expired) : ""
    }`;
    newItem
      .querySelector(".liTextDateExpired")
      .addEventListener("keypress", changeExpiredValue);
    newItem
      .querySelector(".liTextDateExpired")
      .addEventListener("focusout", changeExpiredValue);
    newItem.querySelector(".liTextRedirects").value = `${
      coupon.redirects >= 0 ? coupon.redirects : 0
    }`;
    newItem.querySelector(".liTextUses").value = `${coupon.uses}`;
    if (coupon.uses <= couponsConfigs.alertRemainingUses) {
      !newItem.querySelector(".liTextUses").classList.contains("textDanger")
        ? newItem.querySelector(".liTextUses").classList.add("textDanger")
        : null;
    } else {
      newItem.querySelector(".liTextUses").classList.remove("textDanger");
    }
    newItem
      .querySelector(".liTextUses")
      .addEventListener("keypress", changeUsesValue);
    newItem
      .querySelector(".liTextUses")
      .addEventListener("focusout", changeUsesValue);
    newItem
      .querySelector(".removeButton")
      .addEventListener("click", showRemoveModal);

    if (!coupon.active) {
      newItem.querySelector(".liTextCode").disabled = true;
      newItem.querySelector(".liTextCode").classList.remove("cursorPointer");
      newItem.querySelector(".liTextCode").classList.add("cursorDefault");
      newItem.querySelector(".liTextUses").disabled = true;
      newItem.querySelector(".liTextUses").classList.remove("cursorPointer");
      newItem.querySelector(".liTextUses").classList.add("cursorDefault");
      newItem.querySelector(".liTextDateExpired").disabled = true;
      newItem
        .querySelector(".liTextDateExpired")
        .classList.remove("cursorPointer");
      newItem
        .querySelector(".liTextDateExpired")
        .classList.add("cursorDefault");
    }
    couponsList.appendChild(newItem);
  }
}

function changeUsesValue(e) {
  if ((e && e.key && e.keyCode == 13) || !e.key) {
    e.preventDefault();
    const itemID =
      e.target.parentElement.parentElement.querySelector(".liID").textContent;
    for (const coupon of coupons) {
      if (coupon.id == itemID) {
        selectedCoupon = coupon;
        break;
      }
    }
    if (selectedCoupon.uses != e.target.value) {
      selectedCoupon.uses = e.target.value;
      highlightChange(e.target);
      updateCoupon();
    }
  }
}

function changeExpiredValue(e) {
  if ((e && e.key && e.keyCode == 13) || !e.key) {
    e.preventDefault();
    const itemID =
      e.target.parentElement.parentElement.querySelector(".liID").textContent;
    for (const coupon of coupons) {
      if (coupon.id == itemID) {
        selectedCoupon = coupon;
        break;
      }
    }
    if (
      e.target.value &&
      formatDateUS(selectedCoupon.expired) != e.target.value
    ) {
      selectedCoupon.expired = new Date(e.target.value);
      highlightChange(e.target);
      updateCoupon();
    }
  }
}

function changeCodeValue(e) {
  if ((e && e.key && e.keyCode == 13) || !e.key) {
    e.preventDefault();
    const itemID = e.target.parentElement.querySelector(".liID").textContent;
    for (const coupon of coupons) {
      if (coupon.id == itemID) {
        selectedCoupon = coupon;
        break;
      }
    }
    if (selectedCoupon.code != e.target.value) {
      selectedCoupon.code = e.target.value;
      highlightChange(e.target);
      updateCoupon();
    }
  }
}

function showEditModal(e) {
  editCouponCode.classList.remove("requiredField");

  modalBackground.classList.contains("hidden")
    ? modalBackground.classList.remove("hidden")
    : null;
  modalContainer.classList.contains("hidden")
    ? modalContainer.classList.remove("hidden")
    : null;
  editModal.classList.contains("hidden")
    ? editModal.classList.remove("hidden")
    : null;
  !removeModal.classList.contains("hidden")
    ? removeModal.classList.add("hidden")
    : null;

  selectedCoupon = null;
  editCouponCode.value = "";
  editCouponCreated.value = formatDateUS(new Date());
  const expiredDate = new Date();
  expiredDate.setDate(expiredDate.getDate() + couponsConfigs.expiredDays);
  editCouponExpired.value = formatDateUS(expiredDate);
  editCouponRedirects.value = 0;
  editCouponUses.value = couponsConfigs.couponUses;
  editCouponCode.focus();
}

function showRemoveModal(e) {
  let itemID;
  e.stopPropagation();
  if (e.target.tagName == "svg") {
    itemID = e.target.parentElement.querySelector(".liID").textContent;
  }
  if (e.target.tagName == "path") {
    itemID =
      e.target.parentElement.parentElement.querySelector(".liID").textContent;
  }
  selectCoupon(itemID);

  removeCouponCode.innerText = selectedCoupon.code;

  modalBackground.classList.contains("hidden")
    ? modalBackground.classList.remove("hidden")
    : null;
  modalContainer.classList.contains("hidden")
    ? modalContainer.classList.remove("hidden")
    : null;
  removeModal.classList.contains("hidden")
    ? removeModal.classList.remove("hidden")
    : null;
  !editModal.classList.contains("hidden")
    ? editModal.classList.add("hidden")
    : null;
}

function selectCoupon(id) {
  for (const coupon of coupons) {
    if (coupon.id == id) {
      selectedCoupon = coupon;
      break;
    }
  }
}

function formatDateBR(date) {
  if (Object.prototype.toString.call(date) === "[object Date]") {
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  } else {
    return null;
  }
}

function formatDateUS(date) {
  if (Object.prototype.toString.call(date) === "[object Date]") {
    return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
  } else {
    return null;
  }
}

async function startup() {
  document.getElementById("apikeySection").classList.add("hidden");
  document.getElementById("headerSection").classList.remove("hidden");
  document.getElementById("mainSection").classList.remove("hidden");
  await getCouponsConfigs();
  await getCouponsActive();
  await getPageConfigs();
  populateConfigs();
  populatePageConfigs();
  sortCoupons();
  populateCouponsList();
  window.addEventListener("keypress", resetAutoUpdateTimer);
  resetAutoUpdateTimer();
  autoUpdateRunning = true;
}

function populateConfigs() {
  configCouponUses.value = couponsConfigs.couponUses;
  configRedirectsPerUse.value = couponsConfigs.redirectsPerUse;
  configAlertRemainingUses.value = couponsConfigs.alertRemainingUses;
  configAutoUpdateInterval.value = couponsConfigs.autoUpdateInterval;
  configExpiredDays.value = couponsConfigs.expiredDays;
}

function populatePageConfigs() {
  //
}

function applyPagePreview() {
  pagePreviewTopImage.src = pageConfigs.imageB64;
  pagePreviewContentText.innerText = pageConfigs.text;

  pagePreviewContainer.style.setProperty(
    "background-color",
    `#${pageConfigs.backgroundColor}`
  );
  pagePreviewContentText.style.setProperty(
    "color",
    `#${pageConfigs.textColor}`
  );
  pagePreviewCodeButton.style.setProperty(
    "border-color",
    `#${pageConfigs.buttonColor}`
  );
  pagePreviewGoButton.style.setProperty(
    "background-color",
    `#${pageConfigs.buttonColor}`
  );
}

autoLogin();
