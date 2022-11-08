const backendURL = "http://localhost:3000";

const sectionSelector = document.getElementById("sectionSelector");
const listSection = document.getElementById("listSection");
const configSection = document.getElementById("configSection");
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
const configCouponUses = document.getElementById("configCouponUses");
const configRedirectsPerUse = document.getElementById("configRedirectsPerUse");
const configAlertRemainingUses = document.getElementById(
  "configAlertRemainingUses"
);
const configExpiredDays = document.getElementById("configExpiredDays");
const configResetButton = document.getElementById("configResetButton");
const configUpdateButton = document.getElementById("configUpdateButton");
const couponsList = document.getElementById("couponsList");
const apikeyInput = document.getElementById("apikeyInput");
const apikeyCheckbox = document.getElementById("apikeyCheckbox");
const apikeySection = document.getElementById("apikeySection");
const logoutButton = document.getElementById("logoutButton");
const loginButton = document.getElementById("loginButton");
const configApikey = document.getElementById("configApikey");

let coupons = [];
let configs = {
  couponUses: 0,
  redirectsPerUse: 0,
  alertRemainingUses: 0,
  expiredDays: 0,
};
let sort = "uses";
let sortASC = -1;
let selectedCoupon;
let apikey;

sectionSelector.addEventListener("change", changeSection);
couponsSort.addEventListener("change", changeCouponsSort);
arrowUp.addEventListener("click", toggleSort);
arrowDown.addEventListener("click", toggleSort);
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
      break;
    case "inactive":
      showListSection();
      await getCouponsInactive();
      populateCouponsList();
      break;
    case "settings":
      showConfigSection();
      await getConfigs();
      break;
  }
}

async function resetConfigs() {
  await getConfigs();
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
        await getConfigs();
        populateConfigs();
      })
      .catch(async (error) => {
        window.alert("Ocorreu um erro na atualização!");
        await getConfigs();
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
        await getConfigs();
        populateConfigs();
      })
      .catch(async (error) => {
        window.alert("Ocorreu um erro na atualização!");
        await getConfigs();
        populateConfigs();
      });
  }
}

function validateConfigsForm() {
  return (
    configAlertRemainingUses.value &&
    configCouponUses.value &&
    configExpiredDays.value &&
    configRedirectsPerUse.value &&
    (configAlertRemainingUses.value != configs.alertRemainingUses ||
      configCouponUses.value != configs.couponUses ||
      configExpiredDays.value != configs.expiredDays ||
      configRedirectsPerUse.value != configs.redirectsPerUse)
  );
}

async function updateCoupon(e) {
  if ((e && e.key && e.keyCode == 13) || !e) {
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

function toggleSort() {
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
}

function showConfigSection() {
  configSection.classList.contains("hidden")
    ? configSection.classList.remove("hidden")
    : null;
  !listSection.classList.contains("hidden")
    ? listSection.classList.add("hidden")
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

async function getConfigs() {
  const result = await fetch(`${backendURL}/configs/all?apikey=${apikey}`);
  const resultJSON = await result.json();
  configs.alertRemainingUses = resultJSON[0].value;
  configs.couponUses = resultJSON[1].value;
  configs.expiredDays = resultJSON[2].value;
  configs.redirectsPerUse = resultJSON[3].value;
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

    if (coupon.uses < configs.alertRemainingUses) {
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
    newItem.querySelector(".liTextRedirects").value = `${coupon.redirects}`;
    newItem.querySelector(".liTextUses").value = `${coupon.uses}`;
    if (coupon.uses < configs.alertRemainingUses) {
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
  expiredDate.setDate(expiredDate.getDate() + configs.expiredDays);
  editCouponExpired.value = formatDateUS(expiredDate);
  editCouponRedirects.value = 0;
  editCouponUses.value = configs.couponUses;
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
  await getCouponsActive();
  await getConfigs();
  sortCoupons();
  populateCouponsList();
  populateConfigs();
}

function populateConfigs() {
  configCouponUses.value = configs.couponUses;
  configRedirectsPerUse.value = configs.redirectsPerUse;
  configAlertRemainingUses.value = configs.alertRemainingUses;
  configExpiredDays.value = configs.expiredDays;
}

autoLogin();
