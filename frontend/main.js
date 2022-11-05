const backendURL = "http://localhost:3000";

const sectionSelector = document.getElementById("sectionSelector");
const listSection = document.getElementById("listSection");
const configSection = document.getElementById("configSection");
const headerTitle = document.getElementById("headerTitle");
const liItemTemplate = document.getElementById("liItemTemplate");
const couponsSort = document.getElementById("couponsSort");
const arrowUp = document.getElementById("arrowUp");
const arrowDown = document.getElementById("arrowDown");

const couponsList = document.getElementById("couponsList");
const coupons = [];
let sort = "created";
let sortASC = -1;

sectionSelector.addEventListener("change", changeSection);
couponsSort.addEventListener("change", changeCouponsSort);
arrowUp.addEventListener("click", toggleSort);
arrowDown.addEventListener("click", toggleSort);

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
  const result = await fetch(`${backendURL}/coupons/all?apiKey=1234`);
  const resultJSON = await result.json();
  for (const item of resultJSON) {
    item.created = new Date(item.created);
    item.expired = item.expired ? new Date(item.expired) : null;
    coupons.push(item);
  }
}

function populateCouponsList() {
  couponsList.innerHTML = null;

  for (const coupon of coupons) {
    const newItem = liItemTemplate.cloneNode(true);
    newItem.classList.remove("hidden");
    newItem.querySelector(".liID").innerText = coupon.id;
    newItem.querySelector(".liTextCode").innerText = `${coupon.code}`;
    newItem.querySelectorAll(".liTextDate")[0].innerText = `${formatDate(
      coupon.created
    )}`;
    newItem.querySelectorAll(".liTextDate")[1].innerText = `${
      coupon.expired ? formatDate(coupon.expired) : ""
    }`;
    newItem.querySelector(".liTextUses").innerText = `Usos: ${coupon.uses
      .toString()
      .padStart(2, "0")}`;
    couponsList.appendChild(newItem);
  }
}

function formatDate(date) {
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
}

async function startup() {
  await getCoupons();
  sortCoupons();
  populateCouponsList();
}

startup();
