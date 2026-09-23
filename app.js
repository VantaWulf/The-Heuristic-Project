(function () {
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-toggle");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  setupSlopeLab();
  setupBalanceLab();
  setupForm();
})();

function setupSlopeLab() {
  const canvas = document.getElementById("slope-canvas");
  if (!canvas) return;

  const mEl = document.getElementById("slope-m");
  const bEl = document.getElementById("slope-b");
  const mVal = document.getElementById("slope-m-val");
  const bVal = document.getElementById("slope-b-val");
  const eqLine = document.getElementById("eq-line");

  const draw = () => {
    const m = Number(mEl.value);
    const b = Number(bEl.value);
    mVal.textContent = formatNum(m);
    bVal.textContent = formatNum(b);
    if (eqLine) eqLine.innerHTML = "y = " + equationHTML(m, b);
    paintSlope(canvas, m, b);
  };

  mEl.addEventListener("input", draw);
  bEl.addEventListener("input", draw);
  window.addEventListener("resize", draw);
  requestAnimationFrame(draw);

  document.querySelectorAll("[data-preset]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const [m, b] = btn.dataset.preset.split(",").map(Number);
      mEl.value = String(m);
      bEl.value = String(b);
      document.querySelectorAll("[data-preset]").forEach((el) => el.setAttribute("aria-pressed", "false"));
      btn.setAttribute("aria-pressed", "true");
      draw();
    });
  });

  draw();
}

function formatNum(n) {
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
}

function signed(n) {
  const v = formatNum(n);
  if (Number(v) >= 0) return "+ " + v;
  return "− " + formatNum(Math.abs(n));
}

function equationHTML(m, b) {
  const mv = Number(formatNum(m));
  const bv = Number(formatNum(b));
  const mPart =
    mv === 0 ? "" :
    mv === 1 ? '<span class="m">x</span>' :
    mv === -1 ? '<span class="m">−x</span>' :
    `<span class="m">${formatNum(m)}x</span>`;
  const bPart =
    mv === 0 ? `<span class="b">${formatNum(b)}</span>` :
    bv === 0 ? "" :
    ` <span class="b">${signed(b)}</span>`;
  return mPart + bPart || '<span class="b">0</span>';
}

function paintSlope(canvas, m, b) {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(320, rect.width);
  const h = Math.max(320, rect.height);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const pad = 28;
  const xMin = -6;
  const xMax = 6;
  const yMin = -6;
  const yMax = 6;
  const sx = (w - pad * 2) / (xMax - xMin);
  const sy = (h - pad * 2) / (yMax - yMin);
  const X = (x) => pad + (x - xMin) * sx;
  const Y = (y) => h - pad - (y - yMin) * sy;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(94,179,216,0.35)";
  ctx.lineWidth = 1;
  for (let i = xMin; i <= xMax; i++) {
    ctx.beginPath();
    ctx.moveTo(X(i), Y(yMin));
    ctx.lineTo(X(i), Y(yMax));
    ctx.stroke();
  }
  for (let j = yMin; j <= yMax; j++) {
    ctx.beginPath();
    ctx.moveTo(X(xMin), Y(j));
    ctx.lineTo(X(xMax), Y(j));
    ctx.stroke();
  }

  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(X(xMin), Y(0));
  ctx.lineTo(X(xMax), Y(0));
  ctx.moveTo(X(0), Y(yMin));
  ctx.lineTo(X(0), Y(yMax));
  ctx.stroke();

  ctx.strokeStyle = "#5eb3d8";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(X(xMin), Y(m * xMin + b));
  ctx.lineTo(X(xMax), Y(m * xMax + b));
  ctx.stroke();

  if (m !== 0) {
    const run = 1;
    const rise = m;
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(X(0), Y(b));
    ctx.lineTo(X(run), Y(b));
    ctx.lineTo(X(run), Y(b + rise));
    ctx.stroke();
  }

  ctx.fillStyle = "#111111";
  ctx.beginPath();
  ctx.arc(X(0), Y(b), 5.5, 0, Math.PI * 2);
  ctx.fill();
}

function setupBalanceLab() {
  const root = document.getElementById("balance-lab");
  if (!root) return;
  const left = document.getElementById("pan-left");
  const right = document.getElementById("pan-right");
  const eq = document.getElementById("balance-eq");
  let step = 0;

  const render = () => {
    left.innerHTML = "";
    right.innerHTML = "";
    if (step === 0) {
      addTiles(left, "x", 2);
      addTiles(left, "one", 3);
      addTiles(right, "one", 11);
      eq.textContent = "2x + 3 = 11";
    } else if (step === 1) {
      addTiles(left, "x", 2);
      addTiles(left, "one", 3, true);
      addTiles(right, "one", 8);
      addTiles(right, "one", 3, true);
      eq.textContent = "2x = 8";
    } else {
      addTiles(left, "x", 1);
      addTiles(right, "one", 4);
      eq.textContent = "x = 4";
    }
  };

  root.querySelectorAll("[data-step]").forEach((btn) => {
    btn.addEventListener("click", () => {
      step = Number(btn.dataset.step);
      root.querySelectorAll("[data-step]").forEach((el) => el.setAttribute("aria-pressed", "false"));
      btn.setAttribute("aria-pressed", "true");
      render();
    });
  });

  render();
}

function addTiles(pan, type, n, faded) {
  for (let i = 0; i < n; i++) {
    const el = document.createElement("span");
    el.className = "tile " + type + (faded ? " out" : "");
    el.textContent = type === "x" ? "x" : "1";
    pan.appendChild(el);
  }
}

function setupForm() {
  const form = document.getElementById("join-form");
  if (!form) return;
  const status = document.getElementById("form-status");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const body = [
      `Name: ${data.name || ""}`,
      `Email: ${data.email || ""}`,
      `Role: ${data.role || ""}`,
      "",
      data.message || "",
    ].join("\n");
    const mailto = `mailto:hello@theheuristicproject.org?subject=${encodeURIComponent("The Heuristic Project")}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    if (status) status.textContent = "Your email app should open with the message ready to send.";
  });
}
