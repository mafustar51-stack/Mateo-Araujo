
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const finePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;

  // Año automático en el pie de página.
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Barra superior que indica cuánto se ha desplazado la página.
  const progress = document.getElementById("scrollProgress");

  function updateScrollProgress() {
    if (!progress) return;

    const available =
      document.documentElement.scrollHeight - window.innerHeight;

    const percent = available > 0
      ? (window.scrollY / available) * 100
      : 0;

    progress.style.width = `${Math.min(100, percent)}%`;
  }

  window.addEventListener("scroll", updateScrollProgress, {
    passive: true
  });
  updateScrollProgress();

  // Menú adaptable para móviles.
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  function closeMenu() {
    if (!menuToggle || !navLinks) return;

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú");
    navLinks.classList.remove("open");
    document.body.classList.remove("menu-open");
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen =
        menuToggle.getAttribute("aria-expanded") === "true";

      menuToggle.setAttribute(
        "aria-expanded",
        String(!isOpen)
      );

      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Abrir menú" : "Cerrar menú"
      );

      navLinks.classList.toggle("open", !isOpen);
      document.body.classList.toggle("menu-open", !isOpen);
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 700) closeMenu();
    });
  }

  // Aparición progresiva de las secciones.
  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !reducedMotion) {
    const observer = new IntersectionObserver((entries, current) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          current.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -35px 0px"
    });

    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) => {
      element.classList.add("visible");
    });
  }

  // Tarjetas con inclinación 3D según la posición del cursor.
  if (finePointer && !reducedMotion) {
    document.querySelectorAll(".tilt-card").forEach((card) => {
      let frame = null;

      card.addEventListener("pointermove", (event) => {
        if (event.pointerType !== "mouse") return;

        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;

        const rotateY = (x - 0.5) * 9;
        const rotateX = (0.5 - y) * 9;

        if (frame) cancelAnimationFrame(frame);

        frame = requestAnimationFrame(() => {
          card.style.transform =
            `perspective(850px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
        });
      });

      card.addEventListener("pointerleave", () => {
        if (frame) cancelAnimationFrame(frame);

        card.style.transform = "";
      });
    });
  }

  // Botones magnéticos: una atracción ligera hacia el cursor.
  if (finePointer && !reducedMotion) {
    document.querySelectorAll(".magnetic").forEach((button) => {
      button.addEventListener("pointermove", (event) => {
        if (event.pointerType !== "mouse") return;

        const rect = button.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);

        button.style.transform =
          `translate(${dx * 0.07}px, ${dy * 0.10}px)`;
      });

      button.addEventListener("pointerleave", () => {
        button.style.transform = "";
      });

      button.addEventListener("pointerdown", () => {
        button.style.transform = "scale(.97)";
      });

      button.addEventListener("pointerup", () => {
        button.style.transform = "";
      });
    });
  }

  // Abrir/cerrar información técnica de los ejercicios.
  document.querySelectorAll(".detail-trigger").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".exercise-card");
      if (!card) return;

      const isOpen = card.classList.toggle("is-open");

      button.setAttribute("aria-expanded", String(isOpen));
      button.firstChild.textContent =
        isOpen ? "OCULTAR TÉCNICA " : "VER TÉCNICA ";

      const arrow = button.querySelector("span");
      if (arrow) arrow.textContent = isOpen ? "↙" : "↗";
    });
  });

  // Contenido dinámico de las rutinas.
  const routines = {
    full: {
      label: "IDEAL PARA ORGANIZAR 2–3 DÍAS SEMANALES",
      title: "FULL BODY",
      description:
        "Trabaja los principales grupos musculares en cada sesión. Puede ser una opción práctica para principiantes o para quienes disponen de pocos días.",
      days: [
        ["01", "CUERPO COMPLETO"],
        ["02", "DESCANSO / ACTIVIDAD SUAVE"],
        ["03", "CUERPO COMPLETO"]
      ]
    },

    upper: {
      label: "EJEMPLO DE DISTRIBUCIÓN EN 4 DÍAS",
      title: "UPPER / LOWER",
      description:
        "Alterna sesiones de tren superior e inferior. Esta estructura permite distribuir el trabajo muscular durante la semana y reservar tiempo para la recuperación.",
      days: [
        ["01", "TREN SUPERIOR"],
        ["02", "TREN INFERIOR"],
        ["03", "DESCANSO"],
        ["04", "TREN SUPERIOR"],
        ["05", "TREN INFERIOR"]
      ]
    },

    ppl: {
      label: "DISTRIBUCIÓN EN 3 SESIONES",
      title: "PUSH / PULL / LEGS",
      description:
        "Organiza el entrenamiento en empujes, tirones y piernas. La frecuencia semanal debe adaptarse a tu experiencia, disponibilidad y recuperación.",
      days: [
        ["01", "PUSH — EMPUJES"],
        ["02", "PULL — TIRONES"],
        ["03", "LEGS — PIERNAS"]
      ]
    }
  };

  const routineTabs = document.querySelectorAll(".routine-tab");
  const routineContent = document.getElementById("routineContent");

  function renderRoutine(key) {
    const routine = routines[key];
    if (!routine || !routineContent) return;

    routineContent.replaceChildren();

    const label = document.createElement("div");
    label.className = "routine-label";
    label.textContent = routine.label;

    const title = document.createElement("h3");
    title.textContent = routine.title;

    const description = document.createElement("p");
    description.textContent = routine.description;

    const days = document.createElement("div");
    days.className = "routine-days";

    routine.days.forEach(([number, name]) => {
      const row = document.createElement("span");
      const index = document.createElement("span");
      const label = document.createElement("b");

      index.textContent = number;
      label.textContent = name;

      row.append(index, label);
      days.appendChild(row);
    });

    const disclaimer = document.createElement("p");
    disclaimer.className = "routine-disclaimer";
    disclaimer.textContent =
      "Ejemplo orientativo, no un programa personalizado. Ajusta el volumen, la intensidad y los descansos a tu nivel y recuperación.";

    routineContent.append(
      label,
      title,
      description,
      days,
      disclaimer
    );
  }

  routineTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      routineTabs.forEach((item) => {
        const active = item === tab;

        item.classList.toggle("active", active);
        item.setAttribute("aria-selected", String(active));
      });

      renderRoutine(tab.dataset.routine);
    });
  });
});
