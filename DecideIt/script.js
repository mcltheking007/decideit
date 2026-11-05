const categories = {
  food: ["Jollof rice", "Fried rice", "Shawarma", "Pizza", "Pasta", "Burger"],
  movie: ["Comedy", "Action", "Thriller", "Romance", "Documentary"],
  activity: ["Go for a walk", "Listen to music", "Read a book", "Watch a movie", "Learn something new"]
};

let history = JSON.parse(localStorage.getItem("decideItHistory") || "[]");

function displayHistory() {
  document.getElementById("history").innerHTML =
    history.slice(0, 5).map(item => `<li>${item}</li>`).join("");
}

function pick(options) {
  if (!options.length) return;

  const choice = options[Math.floor(Math.random() * options.length)];

  document.getElementById("result").textContent = "✨ DecideIt chooses: " + choice;

  history.unshift(choice);
  history = history.slice(0, 5);

  localStorage.setItem("decideItHistory", JSON.stringify(history));
  displayHistory();
}

function makeDecision() {
  const options = document.getElementById("options").value
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);

  if (options.length < 2) {
    document.getElementById("result").textContent =
      "Please enter at least two choices.";
    return;
  }

  pick(options);
}

function chooseCategory(category) {
  pick(categories[category]);
}

displayHistory();


let customLists = JSON.parse(localStorage.getItem("decideItLists") || "{}");

function saveList() {
  const name = document.getElementById("listName").value.trim();
  const options = document.getElementById("listOptions").value
    .split(",").map(x => x.trim()).filter(Boolean);

  if (!name || options.length < 2) {
    alert("Enter a list name and at least two choices.");
    return;
  }

  customLists[name] = options;
  localStorage.setItem("decideItLists", JSON.stringify(customLists));

  document.getElementById("listName").value = "";
  document.getElementById("listOptions").value = "";
  displayLists();
}

function displayLists() {
  const area = document.getElementById("savedLists");
  area.innerHTML = "";

  Object.keys(customLists).forEach(name => {
    const button = document.createElement("button");
    button.textContent = name;
    button.style.margin = "10px 8px 0 0";
    button.onclick = () => pick(customLists[name]);
    area.appendChild(button);
  });
}

displayLists();


let wheelAngle = 0;
let wheelSpinning = false;

function drawWheel(options, angle = 0) {
  const canvas = document.getElementById("wheelCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const size = canvas.width;
  const center = size / 2;
  const radius = center - 5;

  ctx.clearRect(0, 0, size, size);

  if (!options.length) return;

  const slice = (Math.PI * 2) / options.length;

  options.forEach((option, i) => {
    const start = angle + i * slice;
    const end = start + slice;

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = ["#8b5cf6", "#ec4899", "#0ea5e9", "#f59e0b", "#10b981"][i % 5];
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(start + slice / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "white";
    ctx.font = "bold 14px Arial";
    ctx.fillText(option.slice(0, 18), radius - 15, 5);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(center, center, 18, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
}

function spinWheel() {
  if (wheelSpinning) return;

  const options = document.getElementById("wheelOptions").value
    .split(",").map(x => x.trim()).filter(Boolean);

  const result = document.getElementById("wheelResult");

  if (options.length < 2) {
    result.textContent = "Enter at least two choices!";
    return;
  }

  wheelSpinning = true;
  result.textContent = "🎡 The wheel is spinning...";

  const winnerIndex = Math.floor(Math.random() * options.length);
  const slice = Math.PI * 2 / options.length;
  const pointerAngle = -Math.PI / 2;
  const target = pointerAngle - (winnerIndex + 0.5) * slice;
  const current = wheelAngle % (Math.PI * 2);
  const extra = 6 * Math.PI * 2;
  const finalAngle = wheelAngle + extra +
    ((target - current) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);

  const initialAngle = wheelAngle;
  const startTime = performance.now();
  const duration = 4000;

  function animate(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);

    wheelAngle = initialAngle + (finalAngle - initialAngle) * eased;
    drawWheel(options, wheelAngle);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      wheelAngle = finalAngle;
      wheelSpinning = false;
      result.textContent = "🎉 The wheel picked: " + options[winnerIndex];
      pick([options[winnerIndex]]);
    }
  }

  requestAnimationFrame(animate);
}

drawWheel(["Your", "Next", "Big", "Decision"]);

function displayLists() {
  const area = document.getElementById("savedLists");
  area.innerHTML = "";

  Object.keys(customLists).forEach(name => {
    const row = document.createElement("div");
    row.className = "saved-list-row";

    const choose = document.createElement("button");
    choose.textContent = "🎯 " + name;
    choose.onclick = () => pick(customLists[name]);

    const remove = document.createElement("button");
    remove.textContent = "Delete";
    remove.className = "delete-list";
    remove.onclick = () => {
      if (confirm("Delete " + name + "?")) {
        delete customLists[name];
        localStorage.setItem("decideItLists", JSON.stringify(customLists));
        displayLists();
      }
    };

    row.append(choose, remove);
    area.appendChild(row);
  });
}

displayLists();
