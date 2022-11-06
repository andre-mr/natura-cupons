const backendURL = "http://localhost:3000";

const sectionSelector = document.getElementById("sectionSelector");
const listSection = document.getElementById("listSection");
const configSection = document.getElementById("configSection");
const headerTitle = document.getElementById("headerTitle");
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

const couponsList = document.getElementById("couponsList");
let coupons = [];
let sort = "created";
let sortASC = -1;
let selectedCoupon;

sectionSelector.addEventListener("change", changeSection);
couponsSort.addEventListener("change", changeCouponsSort);
arrowUp.addEventListener("click", toggleSort);
arrowDown.addEventListener("click", toggleSort);
modalEditCancelButton.addEventListener("click", hideModal);
modalRemoveCancelButton.addEventListener("click", hideModal);
modalSaveButton.addEventListener("click", updateCoupon);
modalRemoveButton.addEventListener("click", deleteCoupon);
addCouponButton.addEventListener("click", showEditModal);

function changeSection(e) {
  switch (e.target.value) {
    case "cupons":
      showListSection();
      break;
    case "configuracoes":
      showConfigSection();
      break;
  }
}

async function updateCoupon() {
  if (selectedCoupon && editCouponCode.value) {
    selectedCoupon.code = editCouponCode.value;
    selectedCoupon.expired = editCouponExpired.value
      ? new Date(editCouponExpired.value)
      : null;
    selectedCoupon.uses = editCouponUses.value;

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
      `${backendURL}/coupons/update?apiKey=1234`,
      requestOptions
    );
  } else if (editCouponCode.value) {
    selectedCoupon = {};
    selectedCoupon.code = editCouponCode.value;
    selectedCoupon.created = new Date(editCouponCreated.value);
    selectedCoupon.expired = editCouponExpired.value
      ? new Date(editCouponExpired.value)
      : null;
    selectedCoupon.redirects = editCouponRedirects.value;
    selectedCoupon.uses = editCouponUses.value;

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
      `${backendURL}/coupons/add?apiKey=1234`,
      requestOptions
    );
  } else {
    !editCouponCode.classList.contains("requiredField")
      ? editCouponCode.classList.add("requiredField")
      : null;
    return;
  }

  editCouponCode.classList.remove("requiredField");
  hideModal();
  await getCoupons();
  sortCoupons();
  populateCouponsList();
  selectedCoupon = null;
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
    `${backendURL}/coupons/delete?apiKey=1234`,
    requestOptions
  );

  hideModal();
  await getCoupons();
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
  headerTitle.innerText = "Cupons";
  listSection.classList.contains("hidden")
    ? listSection.classList.remove("hidden")
    : null;
  !configSection.classList.contains("hidden")
    ? configSection.classList.add("hidden")
    : null;
}

function showConfigSection() {
  headerTitle.innerText = "Configurações";
  configSection.classList.contains("hidden")
    ? configSection.classList.remove("hidden")
    : null;
  !listSection.classList.contains("hidden")
    ? listSection.classList.add("hidden")
    : null;
}

async function getCoupons() {
  coupons = [];
  const result = await fetch(`${backendURL}/coupons/all?apiKey=1234`);
  const resultJSON = await result.json();
  for (const item of resultJSON) {
    item.created = new Date(item.created);
    item.expired = item.expired ? new Date(item.expired) : null;
    coupons.push(item);
  }
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
    newItem.querySelector("#liID").innerText = coupon.id;
    newItem.querySelector("#liTextCode").innerText = `${coupon.code}`;
    if (coupon.uses > 40) {
      !newItem.querySelector("#liTextCode").classList.contains("textDanger")
        ? newItem.querySelector("#liTextCode").classList.add("textDanger")
        : null;
    } else {
      newItem.querySelector("#liTextCode").classList.remove("textDanger");
    }
    newItem.querySelector("#liTextDateCreated").innerText = `${formatDateBR(
      coupon.created
    )}`;
    newItem.querySelector("#liTextDateExpired").innerText = `${
      coupon.expired ? formatDateBR(coupon.expired) : ""
    }`;
    newItem.querySelector("#liTextRedirects").innerText = `${coupon.redirects
      .toString()
      .padStart(2, "0")}`;
    newItem.querySelector("#liTextUses").innerText = `${coupon.uses
      .toString()
      .padStart(2, "0")}`;
    if (coupon.uses > 40) {
      !newItem.querySelector("#liTextUses").classList.contains("textDanger")
        ? newItem.querySelector("#liTextUses").classList.add("textDanger")
        : null;
    } else {
      newItem.querySelector("#liTextUses").classList.remove("textDanger");
    }
    newItem
      .querySelector("#editButton")
      .addEventListener("click", showEditModal);
    newItem
      .querySelector("#removeButton")
      .addEventListener("click", showRemoveModal);
    couponsList.appendChild(newItem);
  }
}

function showEditModal(e) {
  editCouponCode.classList.remove("requiredField");
  let itemID;
  e.stopPropagation();
  if (e.target.tagName == "svg") {
    itemID = e.target.parentElement.querySelector("#liID").textContent;
  }
  if (e.target.tagName == "path") {
    itemID =
      e.target.parentElement.parentElement.querySelector("#liID").textContent;
  }

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

  if (itemID) {
    selectCoupon(itemID);
    editCouponCode.value = selectedCoupon.code;
    editCouponCreated.value = formatDateUS(selectedCoupon.created);
    editCouponExpired.value = selectedCoupon.expired
      ? formatDateUS(selectedCoupon.expired)
      : null;
    editCouponRedirects.value = selectedCoupon.redirects;
    editCouponUses.value = selectedCoupon.uses;
    modalSaveButton.innerText = "Atualizar";
    modalSaveButton.classList.remove("primaryButton");
    !modalSaveButton.classList.contains("saveButton")
      ? modalSaveButton.classList.add("saveButton")
      : null;
  } else {
    selectedCoupon = null;
    editCouponCode.value = "";
    editCouponCreated.value = formatDateUS(new Date());
    editCouponExpired.value = null;
    editCouponRedirects.value = 0;
    editCouponUses.value = 0;
    modalSaveButton.innerText = "Adicionar";
    !modalSaveButton.classList.contains("primaryButton")
      ? modalSaveButton.classList.add("primaryButton")
      : null;
    modalSaveButton.classList.contains("saveButton")
      ? modalSaveButton.classList.remove("saveButton")
      : null;
  }
  editCouponCode.focus();
}

function showRemoveModal(e) {
  let itemID;
  e.stopPropagation();
  if (e.target.tagName == "svg") {
    itemID = e.target.parentElement.querySelector("#liID").textContent;
  }
  if (e.target.tagName == "path") {
    itemID =
      e.target.parentElement.parentElement.querySelector("#liID").textContent;
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
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
}

function formatDateUS(date) {
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
}

async function startup() {
  await getCoupons();
  sortCoupons();
  populateCouponsList();
}

startup();
