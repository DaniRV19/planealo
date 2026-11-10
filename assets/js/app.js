
/* =========================================================
   UNA SORPRESITA PARA TI
   JavaScript principal

   - Validación exclusiva del nombre Elena.
   - Navegación entre pantallas.
   - Ruleta vertical animada.
   - Selección de plan.
   - Validación de fecha y hora.
   - Confirmación final.
   - Reinicio completo.
========================================================= */

(() => {
    "use strict";

    document.addEventListener("DOMContentLoaded", () => {

        /* =====================================================
           CONFIGURACIÓN DE LOS PLANES

           Puedes cambiar los nombres y emojis aquí.
        ===================================================== */

    const plans = [
        {
            name: "Pintura",
            emoji: "🎨"
        },
        {
            name: "Cine",
            emoji: "🎬"
        },
        {
            name: "Mini golf",
            emoji: "🎳"
        },
        {
            name: "Pizza",
            emoji: "🍕"
        },
        {
            name: "Bolera",
            emoji: "🎳"
        },
        {
            name: "Ver el atardecer",
            emoji: "🌅"
        },
        {
            name: "Paseo romántico",
            emoji: "🌹"
        },
        {
            name: "Cena especial",
            emoji: "🍽️"
        }
    ];

        /* =====================================================
           ELEMENTOS HTML
        ===================================================== */

        const elements = {
            screens: document.querySelectorAll(".screen"),
            progressSteps: document.querySelectorAll(".progress-step"),

            nameForm: document.getElementById("nameForm"),
            nameInput: document.getElementById("nameInput"),
            nameError: document.getElementById("nameError"),

            slotMachine: document.getElementById("slotMachine"),
            slotItems: document.getElementById("slotItems"),
            spinAgain: document.getElementById("spinAgain"),
            acceptPlan: document.getElementById("acceptPlan"),
            rouletteHint: document.getElementById("rouletteHint"),

            chosenEmoji: document.getElementById("chosenEmoji"),
            chosenName: document.getElementById("chosenName"),

            dateInput: document.getElementById("dateInput"),
            dateError: document.getElementById("dateError"),
            timeError: document.getElementById("timeError"),
            confirmTime: document.getElementById("confirmTime"),
            backToWheel: document.getElementById("backToWheel"),

            finalEmoji: document.getElementById("finalEmoji"),
            finalPlan: document.getElementById("finalPlan"),
            finalDate: document.getElementById("finalDate"),
            finalTime: document.getElementById("finalTime"),

            restart: document.getElementById("restart")
        };

        /* =====================================================
           ESTADO
        ===================================================== */

        let currentStep = 1;
        let selectedPlan = null;
        let isSpinning = false;
        let spinTimeout = null;
        let spinInterval = null;

        /* =====================================================
           COMPROBACIÓN DE ELEMENTOS
        ===================================================== */

        const requiredElements = [
            elements.nameForm,
            elements.nameInput,
            elements.nameError,
            elements.slotItems,
            elements.spinAgain,
            elements.acceptPlan,
            elements.dateInput,
            elements.confirmTime,
            elements.restart
        ];

        if (requiredElements.some(element => !element)) {
            console.error(
                "No se han encontrado todos los elementos HTML necesarios. Comprueba que el index.html esté actualizado."
            );
            return;
        }

        /* =====================================================
           UTILIDADES
        ===================================================== */

        function getLocalDateString(date = new Date()) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");

            return `${year}-${month}-${day}`;
        }

        function showScreen(step) {
            currentStep = step;

            elements.screens.forEach(screen => {
                screen.classList.remove("active");
            });

            const target = document.getElementById(`step${step}`);

            if (target) {
                target.classList.add("active");
            }

            elements.progressSteps.forEach(progress => {
                const progressNumber = Number(progress.dataset.progress);

                progress.classList.toggle(
                    "active",
                    progressNumber <= step
                );
            });

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }

        function clearErrors() {
            elements.nameError.textContent = "";

            if (elements.dateError) {
                elements.dateError.textContent = "";
            }

            if (elements.timeError) {
                elements.timeError.textContent = "";
            }
        }

        /* =====================================================
           PASO 1 · VALIDACIÓN DEL NOMBRE
        ===================================================== */

        elements.nameForm.addEventListener("submit", event => {
            event.preventDefault();

            const enteredName = elements.nameInput.value
                .trim()
                .toLocaleLowerCase("es");

            if (!enteredName) {
                elements.nameError.textContent =
                    "Primero tienes que escribir tu nombre ♥";

                elements.nameInput.focus();
                return;
            }

            if (enteredName !== "elena") {
                elements.nameError.textContent =
                    "Mmm... parece que este no es el nombre correcto. Inténtalo otra vez ♥";

                elements.nameInput.classList.add("input-error");

                elements.nameInput.focus();
                elements.nameInput.select();

                return;
            }

            elements.nameError.textContent = "";
            elements.nameInput.classList.remove("input-error");

            showScreen(2);
            resetRoulette();
        });

        elements.nameInput.addEventListener("input", () => {
            elements.nameError.textContent = "";
            elements.nameInput.classList.remove("input-error");
        });

        /* =====================================================
           PASO 2 · RULETA VERTICAL

           La ventana muestra tres opciones.
           La opción central es la seleccionada.
           La animación simula una máquina de premios.
        ===================================================== */

        function createRouletteItems() {
            elements.slotItems.innerHTML = "";

            plans.forEach((plan, index) => {
                const item = document.createElement("div");

                item.className = "slot-item";
                item.textContent = `${plan.emoji} ${plan.name}`;
                item.dataset.index = index;

                elements.slotItems.appendChild(item);
            });

            positionRoulette(0);
        }

        function positionRoulette(index) {
            const itemHeight = 42;
            const windowHeight = 126;

            const offset =
                (windowHeight / 2) -
                (itemHeight / 2) -
                (index * itemHeight);

            elements.slotItems.style.transition = "none";
            elements.slotItems.style.transform =
                `translateY(${offset}px)`;
        }

        function setRoulettePosition(index, animate = true) {
            const itemHeight = 42;
            const windowHeight = 126;

            const offset =
                (windowHeight / 2) -
                (itemHeight / 2) -
                (index * itemHeight);

            elements.slotItems.style.transition = animate
                ? "transform 0.12s cubic-bezier(.2,.75,.25,1)"
                : "none";

            elements.slotItems.style.transform =
                `translateY(${offset}px)`;
        }

        function resetRoulette() {
            stopRouletteTimers();

            isSpinning = false;
            selectedPlan = null;

            createRouletteItems();

            elements.spinAgain.disabled = false;
            elements.acceptPlan.disabled = true;

            elements.rouletteHint.textContent =
                "Pulsa girar para descubrir nuestro plan.";

            elements.spinAgain.textContent = "↻ Girar";
        }

        function stopRouletteTimers() {
            if (spinTimeout) {
                clearTimeout(spinTimeout);
                spinTimeout = null;
            }

            if (spinInterval) {
                clearInterval(spinInterval);
                spinInterval = null;
            }
        }

        function spinRoulette() {
            if (isSpinning) {
                return;
            }

            isSpinning = true;
            selectedPlan = null;

            elements.spinAgain.disabled = true;
            elements.acceptPlan.disabled = true;

            elements.rouletteHint.textContent =
                "A ver qué nos depara el destino... ♥";

            const totalSteps = 24 + Math.floor(Math.random() * 12);
            const finalIndex = Math.floor(Math.random() * plans.length);

            let currentIndex = Math.floor(Math.random() * plans.length);
            let currentStepCount = 0;
            let delay = 65;

            function moveNext() {
                currentStepCount++;

                if (currentStepCount >= totalSteps) {
                    finishSpin(finalIndex);
                    return;
                }

                currentIndex = (currentIndex + 1) % plans.length;

                setRoulettePosition(currentIndex, true);

                const progress = currentStepCount / totalSteps;

                delay = 55 + Math.pow(progress, 3) * 260;

                spinTimeout = setTimeout(moveNext, delay);
            }

            setRoulettePosition(currentIndex, false);

            spinTimeout = setTimeout(moveNext, delay);
        }

        function finishSpin(index) {
            stopRouletteTimers();

            setRoulettePosition(index, true);

            selectedPlan = plans[index];
            isSpinning = false;

            elements.spinAgain.disabled = false;
            elements.acceptPlan.disabled = false;

            elements.rouletteHint.textContent =
                `¡Ha salido ${selectedPlan.name}! ¿Nos quedamos con este plan? ♥`;

            elements.spinAgain.textContent = "↻ Girar otra vez";
        }

        elements.spinAgain.addEventListener("click", spinRoulette);

        elements.acceptPlan.addEventListener("click", () => {
            if (!selectedPlan || isSpinning) {
                return;
            }

            elements.chosenEmoji.textContent = selectedPlan.emoji;
            elements.chosenName.textContent = selectedPlan.name;

            showScreen(3);
        });

        /* =====================================================
           PASO 3 · FECHA Y HORA
        ===================================================== */

        elements.dateInput.min = getLocalDateString();

        elements.dateInput.addEventListener("change", () => {
            if (elements.dateError) {
                elements.dateError.textContent = "";
            }
        });

        document.querySelectorAll('input[name="time"]').forEach(input => {
            input.addEventListener("change", () => {
                if (elements.timeError) {
                    elements.timeError.textContent = "";
                }
            });
        });

        elements.confirmTime.addEventListener("click", () => {
            if (!selectedPlan) {
                showScreen(2);
                return;
            }

            clearErrors();

            const selectedDate = elements.dateInput.value;
            const selectedTime = document.querySelector(
                'input[name="time"]:checked'
            );

            let valid = true;

            if (!selectedDate) {
                elements.dateError.textContent =
                    "Tienes que elegir un día ♥";

                valid = false;
            } else {
                const chosenDate = new Date(`${selectedDate}T00:00:00`);
                const today = new Date(`${getLocalDateString()}T00:00:00`);

                if (
                    Number.isNaN(chosenDate.getTime()) ||
                    chosenDate < today
                ) {
                    elements.dateError.textContent =
                        "No podemos elegir un día que ya ha pasado.";

                    valid = false;
                }
            }

            if (!selectedTime) {
                elements.timeError.textContent =
                    "Selecciona también una hora ♥";

                valid = false;
            }

            if (!valid) {
                return;
            }

            showFinalScreen(selectedDate, selectedTime.value);
        });

        elements.backToWheel.addEventListener("click", () => {
            showScreen(2);
        });

        /* =====================================================
           PASO 4 · CONFIRMACIÓN FINAL
        ===================================================== */

        function formatDate(dateString) {
            const date = new Date(`${dateString}T00:00:00`);

            return new Intl.DateTimeFormat("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric"
            }).format(date);
        }

        function formatTime(timeString) {
            const [hours, minutes] = timeString.split(":");

            return `${hours}:${minutes}`;
        }

        function showFinalScreen(date, time) {
            elements.finalEmoji.textContent = selectedPlan.emoji;
            elements.finalPlan.textContent = selectedPlan.name;
            elements.finalDate.textContent = formatDate(date);
            elements.finalTime.textContent = formatTime(time);

            showScreen(4);
        }

        /* =====================================================
           REINICIO COMPLETO
        ===================================================== */

        function restartApplication() {
            stopRouletteTimers();

            isSpinning = false;
            selectedPlan = null;

            elements.nameInput.value = "";
            elements.dateInput.value = "";

            document.querySelectorAll('input[name="time"]').forEach(input => {
                input.checked = false;
            });

            clearErrors();

            elements.acceptPlan.disabled = true;
            elements.spinAgain.disabled = false;
            elements.spinAgain.textContent = "↻ Girar";

            elements.nameInput.classList.remove("input-error");

            elements.rouletteHint.textContent =
                "Pulsa girar para descubrir nuestro plan.";

            elements.dateInput.min = getLocalDateString();

            createRouletteItems();

            showScreen(1);
        }

        elements.restart.addEventListener("click", restartApplication);

        /* =====================================================
           INICIALIZACIÓN
        ===================================================== */

        createRouletteItems();
        showScreen(1);

    });

})();
