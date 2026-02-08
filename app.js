const CAPTURE_WIDTH = 1080;
const CAPTURE_HEIGHT = 1920;
const PHOTO_OFFSET_MIN = -100;
const PHOTO_OFFSET_MAX = 100;
const HISTORY_LIMIT = 20;
const HISTORY_STORAGE_KEY = "condolencias.history.v1";
const DARK_MODE_STORAGE_KEY = "condolencias.darkmode.v1";
const GUIDED_STEP_ORDER = [
    "photo",
    "name",
    "birth",
    "death",
    "wake-enabled",
    "wake-location",
    "wake-date",
    "wake-time",
    "wake-address",
    "burial-enabled",
    "burial-location",
    "burial-date",
    "burial-time",
    "burial-address",
    "finish"
];

const textSyncFields = [
    { input: "wakeLocationInput", display: "displayWakeLocation" },
    { input: "wakeTimeInput", display: "displayWakeTime" },
    { input: "wakeAddressInput", display: "displayWakeAddress" },
    { input: "burialLocationInput", display: "displayBurialLocation" },
    { input: "burialTimeInput", display: "displayBurialTime" },
    { input: "burialAddressInput", display: "displayBurialAddress" }
];

const photoState = {
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    isDragging: false,
    startX: 0,
    startY: 0
};

let currentPhotoSrc = "";
let currentFormat = "circle";
let defaultState = null;
let noteHistory = [];
let selectedHistoryIds = new Set();
let guidedVisibleStepIds = [];
let guidedCurrentStepIndex = 0;

const elements = {
    captureArea: document.getElementById("captureArea"),
    noteCard: document.getElementById("captureArea"),
    previewContainer: document.querySelector(".preview-container"),
    previewStage: document.getElementById("previewStage"),
    darkModeToggle: document.getElementById("darkModeToggle"),
    guidedModeBtn: document.getElementById("guidedModeBtn"),

    nameInput: document.getElementById("nameInput"),
    birthInput: document.getElementById("birthInput"),
    deathInput: document.getElementById("deathInput"),
    wakeLocationInput: document.getElementById("wakeLocationInput"),
    wakeDateInput: document.getElementById("wakeDateInput"),
    wakeTimeInput: document.getElementById("wakeTimeInput"),
    wakeAddressInput: document.getElementById("wakeAddressInput"),
    burialLocationInput: document.getElementById("burialLocationInput"),
    burialDateInput: document.getElementById("burialDateInput"),
    burialTimeInput: document.getElementById("burialTimeInput"),
    burialAddressInput: document.getElementById("burialAddressInput"),

    wakeEnabled: document.getElementById("wakeEnabled"),
    burialEnabled: document.getElementById("burialEnabled"),
    cremationMode: document.getElementById("cremationMode"),

    wakeSection: document.getElementById("wakeSection"),
    burialSection: document.getElementById("burialSection"),
    wakeBlock: document.getElementById("wakeBlock"),
    burialBlock: document.getElementById("burialBlock"),

    wakePresets: document.getElementById("wakePresets"),
    burialPresets: document.getElementById("burialPresets"),

    displayName: document.getElementById("displayName"),
    displayBirth: document.getElementById("displayBirth"),
    displayDeath: document.getElementById("displayDeath"),
    displayWakeDate: document.getElementById("displayWakeDate"),
    displayBurialDate: document.getElementById("displayBurialDate"),

    burialIcon: document.getElementById("burialIcon"),
    burialTitle: document.getElementById("burialTitle"),
    displayBurialIcon: document.getElementById("displayBurialIcon"),
    displayBurialTitle: document.getElementById("displayBurialTitle"),

    photoInput: document.getElementById("photoInput"),
    photoDropTarget: document.getElementById("photoDropTarget"),
    photoPreview: document.getElementById("photoPreview"),
    previewImg: document.getElementById("previewImg"),
    displayPhoto: document.getElementById("displayPhoto"),
    photoControls: document.getElementById("photoControls"),
    editPhotoBtn: document.getElementById("editPhotoBtn"),
    removePhotoBtn: document.getElementById("removePhotoBtn"),

    photoEditorModal: document.getElementById("photoEditorModal"),
    photoEditorClose: document.getElementById("photoEditorClose"),
    photoEditorImg: document.getElementById("photoEditorImg"),
    photoEditorPreview: document.getElementById("photoEditorPreview"),
    editorZoomSlider: document.getElementById("editorZoomSlider"),
    editorPosXSlider: document.getElementById("editorPosXSlider"),
    editorPosYSlider: document.getElementById("editorPosYSlider"),
    editorResetBtn: document.getElementById("editorResetBtn"),
    editorConfirmBtn: document.getElementById("editorConfirmBtn"),

    downloadBtn: document.getElementById("downloadBtn"),
    copyImageBtn: document.getElementById("copyImageBtn"),
    saveHistoryBtn: document.getElementById("saveHistoryBtn"),
    historyBtn: document.getElementById("historyBtn"),
    resetBtn: document.getElementById("resetBtn"),

    historyModal: document.getElementById("historyModal"),
    historyCloseBtn: document.getElementById("historyCloseBtn"),
    historyList: document.getElementById("historyList"),
    historyEmpty: document.getElementById("historyEmpty"),
    historySelectAll: document.getElementById("historySelectAll"),
    historyDeleteSelectedBtn: document.getElementById("historyDeleteSelectedBtn"),

    copyWakeToBurialBtn: document.getElementById("copyWakeToBurialBtn"),

    guidedModal: document.getElementById("guidedModal"),
    guidedCloseBtn: document.getElementById("guidedCloseBtn"),
    guidedProgressText: document.getElementById("guidedProgressText"),
    guidedProgressBar: document.getElementById("guidedProgressBar"),
    guidedValidationMessage: document.getElementById("guidedValidationMessage"),
    guidedFooter: document.getElementById("guidedFooter"),
    guidedPrevBtn: document.getElementById("guidedPrevBtn"),
    guidedNextBtn: document.getElementById("guidedNextBtn"),
    guidedFinishBtn: document.getElementById("guidedFinishBtn"),
    guidedDownloadBtn: document.getElementById("guidedDownloadBtn"),
    guidedCopyBtn: document.getElementById("guidedCopyBtn"),
    guidedSteps: document.querySelectorAll("[data-guided-step]"),

    guidedPhotoInput: document.getElementById("guidedPhotoInput"),
    guidedRemovePhotoBtn: document.getElementById("guidedRemovePhotoBtn"),
    guidedPhotoStatus: document.getElementById("guidedPhotoStatus"),
    guidedPhotoLiveFrame: document.getElementById("guidedPhotoLiveFrame"),
    guidedPhotoLiveImg: document.getElementById("guidedPhotoLiveImg"),
    guidedZoomSlider: document.getElementById("guidedZoomSlider"),
    guidedPosXSlider: document.getElementById("guidedPosXSlider"),
    guidedPosYSlider: document.getElementById("guidedPosYSlider"),
    guidedOpenEditorBtn: document.getElementById("guidedOpenEditorBtn"),

    guidedNameInput: document.getElementById("guidedNameInput"),
    guidedBirthInput: document.getElementById("guidedBirthInput"),
    guidedDeathInput: document.getElementById("guidedDeathInput"),
    guidedWakeLocationInput: document.getElementById("guidedWakeLocationInput"),
    guidedWakeDateInput: document.getElementById("guidedWakeDateInput"),
    guidedWakeTimeInput: document.getElementById("guidedWakeTimeInput"),
    guidedWakeAddressInput: document.getElementById("guidedWakeAddressInput"),
    guidedBurialLocationInput: document.getElementById("guidedBurialLocationInput"),
    guidedBurialDateInput: document.getElementById("guidedBurialDateInput"),
    guidedBurialTimeInput: document.getElementById("guidedBurialTimeInput"),
    guidedBurialAddressInput: document.getElementById("guidedBurialAddressInput"),
    guidedCopyWakeInfoBtn: document.getElementById("guidedCopyWakeInfoBtn"),
    guidedWakePresetHint: document.getElementById("guidedWakePresetHint"),
    guidedBurialPresetHint: document.getElementById("guidedBurialPresetHint"),
    guidedWakePresetButtons: document.querySelectorAll("#guidedWakePresetButtons .guided-location-preset"),
    guidedBurialPresetButtons: document.querySelectorAll("#guidedBurialPresetButtons .guided-location-preset"),

    guidedWakeChoices: document.querySelectorAll('input[name="guidedWakeEnabled"]'),
    guidedBurialChoices: document.querySelectorAll('input[name="guidedBurialEnabled"]'),

    photoFrame: document.querySelector(".photo-frame"),
    photoFrameInner: document.querySelector(".photo-frame-inner"),
    formatOptions: document.querySelectorAll(".format-option"),
    accordionSections: document.querySelectorAll("[data-accordion]")
};

const PLACEHOLDER_PHOTO_SRC = elements.displayPhoto.getAttribute("src") || "";

function formatDateBR(dateString) {
    if (!dateString) return "—";
    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString("pt-BR");
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function cloneState(state) {
    return JSON.parse(JSON.stringify(state));
}

function emitElementEvent(element, eventName) {
    if (!element) return;
    element.dispatchEvent(new Event(eventName, { bubbles: true }));
}

function getGuidedChoiceValue(name) {
    const selected = document.querySelector(`input[name="${name}"]:checked`);
    return selected ? selected.value : "";
}

function setGuidedChoiceValue(name, value) {
    document.querySelectorAll(`input[name="${name}"]`).forEach(input => {
        input.checked = input.value === value;
    });
}

function isGuidedWakeEnabled() {
    return getGuidedChoiceValue("guidedWakeEnabled") === "yes";
}

function isGuidedBurialEnabled() {
    return getGuidedChoiceValue("guidedBurialEnabled") === "yes";
}

function getGuidedVisibleSteps() {
    const steps = ["photo", "name", "birth", "death", "wake-enabled"];

    if (isGuidedWakeEnabled()) {
        steps.push("wake-location", "wake-date", "wake-time", "wake-address");
    }

    steps.push("burial-enabled");

    if (isGuidedBurialEnabled()) {
        steps.push("burial-location", "burial-date", "burial-time", "burial-address");
    }

    steps.push("finish");

    return steps.filter(stepId => GUIDED_STEP_ORDER.includes(stepId));
}

function clearGuidedValidation() {
    if (!elements.guidedValidationMessage) return;
    elements.guidedValidationMessage.textContent = "";
    elements.guidedValidationMessage.classList.remove("active");
}

function setGuidedValidation(message) {
    if (!elements.guidedValidationMessage) return;
    elements.guidedValidationMessage.textContent = message;
    elements.guidedValidationMessage.classList.add("active");
}

function hasInputValue(value) {
    return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

function setGuidedPresetFeedback(target, message) {
    const feedbackElement = target === "wake" ? elements.guidedWakePresetHint : elements.guidedBurialPresetHint;
    if (!feedbackElement) return;
    feedbackElement.textContent = message || "";
}

function syncGuidedPhotoAdjustControls() {
    const hasPhoto = Boolean(currentPhotoSrc);
    const controls = [
        elements.guidedZoomSlider,
        elements.guidedPosXSlider,
        elements.guidedPosYSlider,
        elements.guidedOpenEditorBtn
    ];

    controls.forEach(control => {
        if (!control) return;
        control.disabled = !hasPhoto;
    });

    if (elements.guidedZoomSlider) {
        elements.guidedZoomSlider.value = Math.round(photoState.scale * 100);
    }

    if (elements.guidedPosXSlider) {
        elements.guidedPosXSlider.value = photoState.offsetX;
    }

    if (elements.guidedPosYSlider) {
        elements.guidedPosYSlider.value = photoState.offsetY;
    }
}

function getPhotoTransformReferenceSize() {
    const referenceWidth = elements.photoFrame?.clientWidth || 1;
    const referenceHeight = elements.photoFrame?.clientHeight || 1;

    return {
        width: Math.max(referenceWidth, 1),
        height: Math.max(referenceHeight, 1)
    };
}

function buildPhotoTransformForTarget({ targetWidth, targetHeight }) {
    const referenceSize = getPhotoTransformReferenceSize();
    const safeTargetWidth = Math.max(targetWidth || referenceSize.width, 1);
    const safeTargetHeight = Math.max(targetHeight || referenceSize.height, 1);

    const widthRatio = safeTargetWidth / referenceSize.width;
    const heightRatio = safeTargetHeight / referenceSize.height;
    const scaleRatio = widthRatio;

    const offsetX = photoState.offsetX * widthRatio;
    const offsetY = photoState.offsetY * heightRatio;
    const scale = photoState.scale * scaleRatio;

    return `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) scale(${scale})`;
}

function applyPhotoTransformTo(image, frame) {
    if (!image || !frame) return;

    const transform = buildPhotoTransformForTarget({
        targetWidth: frame.clientWidth,
        targetHeight: frame.clientHeight
    });
    image.style.transform = transform;
}

function getPhotoEditorRatio() {
    const referenceSize = getPhotoTransformReferenceSize();
    const ratioX = (elements.photoEditorPreview?.clientWidth || referenceSize.width) / referenceSize.width;
    const ratioY = (elements.photoEditorPreview?.clientHeight || referenceSize.height) / referenceSize.height;

    return {
        ratioX: Math.max(ratioX, 0.01),
        ratioY: Math.max(ratioY, 0.01)
    };
}

function syncPhotoEditorFrame() {
    if (!elements.photoEditorPreview || !elements.photoFrame) return;

    const baseWidth = elements.photoFrame.clientWidth || 400;
    const baseHeight = elements.photoFrame.clientHeight || 400;
    const maxWidth = Math.max(window.innerWidth - 160, 240);
    const maxHeight = Math.max(window.innerHeight - 360, 220);
    const frameScale = Math.min(1, maxWidth / baseWidth, maxHeight / baseHeight);
    const width = Math.round(baseWidth * frameScale);
    const height = Math.round(baseHeight * frameScale);

    elements.photoEditorPreview.style.width = `${width}px`;
    elements.photoEditorPreview.style.height = `${height}px`;
    elements.photoEditorPreview.style.borderRadius = window.getComputedStyle(elements.photoFrame).borderRadius;

    const formatClassList = ["format-circle", "format-oval-v", "format-oval-h", "format-rectangle", "format-square"];
    elements.photoEditorPreview.classList.remove(...formatClassList);
    elements.photoEditorPreview.classList.add(`format-${currentFormat}`);
}

function syncGuidedPhotoLiveFrameFormat() {
    if (!elements.guidedPhotoLiveFrame) return;

    const formatClassList = ["format-circle", "format-oval-v", "format-oval-h", "format-rectangle", "format-square"];
    elements.guidedPhotoLiveFrame.classList.remove(...formatClassList);
    elements.guidedPhotoLiveFrame.classList.add(`format-${currentFormat}`);
}

function getMainPresetButton(container, location) {
    if (!container || !location) return null;
    return Array.from(container.querySelectorAll(".location-preset-btn"))
        .find(button => button.dataset.location === location);
}

function setMainPresetFromGuided(target, location) {
    const container = target === "wake" ? elements.wakePresets : elements.burialPresets;
    if (!container) return;

    const matchedButton = getMainPresetButton(container, location);
    if (matchedButton) {
        setActivePreset(container, matchedButton);
    } else {
        setPresetToCustom(container);
    }
}

function updateGuidedPresetButtons(target) {
    const isWake = target === "wake";
    const buttons = isWake ? elements.guidedWakePresetButtons : elements.guidedBurialPresetButtons;
    const locationValue = isWake ? elements.guidedWakeLocationInput.value.trim() : elements.guidedBurialLocationInput.value.trim();
    const addressValue = isWake ? elements.guidedWakeAddressInput.value.trim() : elements.guidedBurialAddressInput.value.trim();

    buttons.forEach(button => {
        const locationMatches = button.dataset.location === locationValue;
        const addressMatches = (button.dataset.address || "").trim() === addressValue;
        button.classList.toggle("active", locationMatches && addressMatches);
    });
}

function applyGuidedPreset({ target, location, address }) {
    if (target === "wake") {
        elements.guidedWakeLocationInput.value = location;
        elements.guidedWakeAddressInput.value = address;
        emitElementEvent(elements.guidedWakeLocationInput, "input");
        emitElementEvent(elements.guidedWakeAddressInput, "input");
        setMainPresetFromGuided("wake", location);
        setGuidedPresetFeedback("wake", "Local e endereço preenchidos automaticamente. Você pode editar.");
        updateGuidedPresetButtons("wake");
        return;
    }

    elements.guidedBurialLocationInput.value = location;
    elements.guidedBurialAddressInput.value = address;
    emitElementEvent(elements.guidedBurialLocationInput, "input");
    emitElementEvent(elements.guidedBurialAddressInput, "input");
    setMainPresetFromGuided("burial", location);
    setGuidedPresetFeedback("burial", "Local e endereço preenchidos automaticamente. Você pode editar.");
    updateGuidedPresetButtons("burial");
}

function copyGuidedWakeDataToBurial() {
    elements.guidedBurialLocationInput.value = elements.guidedWakeLocationInput.value;
    elements.guidedBurialDateInput.value = elements.guidedWakeDateInput.value;
    elements.guidedBurialTimeInput.value = elements.guidedWakeTimeInput.value;
    elements.guidedBurialAddressInput.value = elements.guidedWakeAddressInput.value;

    emitElementEvent(elements.guidedBurialLocationInput, "input");
    emitElementEvent(elements.guidedBurialDateInput, "change");
    emitElementEvent(elements.guidedBurialTimeInput, "input");
    emitElementEvent(elements.guidedBurialAddressInput, "input");

    setMainPresetFromGuided("burial", elements.guidedBurialLocationInput.value.trim());
    setGuidedPresetFeedback("burial", "Dados copiados do velório. Ajuste se necessário.");
    updateGuidedPresetButtons("burial");
}

function updateGuidedPhotoStatus() {
    if (!elements.guidedPhotoStatus || !elements.guidedRemovePhotoBtn) return;

    if (currentPhotoSrc) {
        elements.guidedPhotoStatus.textContent = "Foto adicionada com sucesso.";
        elements.guidedRemovePhotoBtn.disabled = false;
    } else {
        elements.guidedPhotoStatus.textContent = "Nenhuma foto adicionada (opcional).";
        elements.guidedRemovePhotoBtn.disabled = true;
    }

    syncGuidedPhotoAdjustControls();
}

function syncGuidedInputsFromForm() {
    if (!elements.guidedModal) return;

    elements.guidedNameInput.value = elements.nameInput.value || "";
    elements.guidedBirthInput.value = elements.birthInput.value || "";
    elements.guidedDeathInput.value = elements.deathInput.value || "";

    elements.guidedWakeLocationInput.value = elements.wakeLocationInput.value || "";
    elements.guidedWakeDateInput.value = elements.wakeDateInput.value || "";
    elements.guidedWakeTimeInput.value = elements.wakeTimeInput.value || "";
    elements.guidedWakeAddressInput.value = elements.wakeAddressInput.value || "";

    elements.guidedBurialLocationInput.value = elements.burialLocationInput.value || "";
    elements.guidedBurialDateInput.value = elements.burialDateInput.value || "";
    elements.guidedBurialTimeInput.value = elements.burialTimeInput.value || "";
    elements.guidedBurialAddressInput.value = elements.burialAddressInput.value || "";

    setGuidedChoiceValue("guidedWakeEnabled", elements.wakeEnabled.checked ? "yes" : "no");
    setGuidedChoiceValue("guidedBurialEnabled", elements.burialEnabled.checked ? "yes" : "no");

    if (elements.guidedPhotoInput) {
        elements.guidedPhotoInput.value = "";
    }

    if (elements.guidedPhotoLiveImg) {
        elements.guidedPhotoLiveImg.src = currentPhotoSrc || PLACEHOLDER_PHOTO_SRC;
    }

    updateGuidedPhotoStatus();
    syncGuidedPhotoLiveFrameFormat();
    updatePhotoTransform();
    updateGuidedPresetButtons("wake");
    updateGuidedPresetButtons("burial");
    setGuidedPresetFeedback("wake", "");
    setGuidedPresetFeedback("burial", "");
}

function focusGuidedCurrentStep() {
    const stepId = guidedVisibleStepIds[guidedCurrentStepIndex];
    if (!stepId) return;

    const activeStep = Array.from(elements.guidedSteps).find(step => step.dataset.guidedStep === stepId);
    if (!activeStep) return;

    const focusTarget = activeStep.querySelector('input:not([type="file"]), button');
    if (!focusTarget || typeof focusTarget.focus !== "function") return;

    window.setTimeout(() => {
        focusTarget.focus();
    }, 20);
}

function renderGuidedStep() {
    if (!elements.guidedSteps.length || !guidedVisibleStepIds.length) return;

    const currentStepId = guidedVisibleStepIds[guidedCurrentStepIndex];
    const total = guidedVisibleStepIds.length;
    const currentPosition = guidedCurrentStepIndex + 1;

    elements.guidedSteps.forEach(step => {
        step.classList.toggle("active", step.dataset.guidedStep === currentStepId);
    });

    if (elements.guidedProgressText) {
        elements.guidedProgressText.textContent = `Etapa ${currentPosition} de ${total}`;
    }

    if (elements.guidedProgressBar) {
        const progress = (currentPosition / total) * 100;
        elements.guidedProgressBar.style.width = `${progress}%`;
    }

    const isFinishStep = currentStepId === "finish";
    if (elements.guidedFooter) {
        elements.guidedFooter.classList.toggle("hidden", isFinishStep);
    }

    if (elements.guidedPrevBtn) {
        elements.guidedPrevBtn.disabled = guidedCurrentStepIndex === 0;
    }

    clearGuidedValidation();
    updateGuidedPhotoStatus();
    focusGuidedCurrentStep();
}

function refreshGuidedFlow({ keepCurrentStep = false } = {}) {
    if (!elements.guidedSteps.length) return;

    const previousStepId = guidedVisibleStepIds[guidedCurrentStepIndex] || "photo";
    guidedVisibleStepIds = getGuidedVisibleSteps();
    if (!guidedVisibleStepIds.length) return;

    if (keepCurrentStep) {
        const matchingIndex = guidedVisibleStepIds.indexOf(previousStepId);
        guidedCurrentStepIndex = matchingIndex >= 0
            ? matchingIndex
            : Math.min(guidedCurrentStepIndex, guidedVisibleStepIds.length - 1);
    } else {
        guidedCurrentStepIndex = 0;
    }

    renderGuidedStep();
}

function openGuidedModal() {
    if (!elements.guidedModal) return;

    closeHistoryModal();
    closePhotoEditor();
    syncGuidedInputsFromForm();
    guidedVisibleStepIds = getGuidedVisibleSteps();
    guidedCurrentStepIndex = 0;
    elements.guidedModal.classList.add("active");
    renderGuidedStep();
}

function closeGuidedModal() {
    if (!elements.guidedModal) return;
    elements.guidedModal.classList.remove("active");
    clearGuidedValidation();
}

function validateGuidedStep(stepId) {
    if (stepId === "name" && !hasInputValue(elements.guidedNameInput.value)) {
        setGuidedValidation("Informe o nome completo para continuar.");
        elements.guidedNameInput.focus();
        return false;
    }

    if (stepId === "birth" && !elements.guidedBirthInput.value) {
        setGuidedValidation("Informe a data de nascimento para continuar.");
        elements.guidedBirthInput.focus();
        return false;
    }

    if (stepId === "death") {
        if (!elements.guidedDeathInput.value) {
            setGuidedValidation("Informe a data de falecimento para continuar.");
            elements.guidedDeathInput.focus();
            return false;
        }

        if (elements.guidedBirthInput.value && elements.guidedDeathInput.value < elements.guidedBirthInput.value) {
            setGuidedValidation("A data de falecimento não pode ser anterior à data de nascimento.");
            elements.guidedDeathInput.focus();
            return false;
        }
    }

    if (stepId === "wake-enabled" && !getGuidedChoiceValue("guidedWakeEnabled")) {
        setGuidedValidation("Selecione se haverá velório.");
        if (elements.guidedWakeChoices[0]) {
            elements.guidedWakeChoices[0].focus();
        }
        return false;
    }

    if (stepId === "wake-location" && isGuidedWakeEnabled() && !hasInputValue(elements.guidedWakeLocationInput.value)) {
        setGuidedValidation("Informe o local do velório para continuar.");
        elements.guidedWakeLocationInput.focus();
        return false;
    }

    if (stepId === "wake-date" && isGuidedWakeEnabled() && !elements.guidedWakeDateInput.value) {
        setGuidedValidation("Informe a data do velório para continuar.");
        elements.guidedWakeDateInput.focus();
        return false;
    }

    if (stepId === "wake-time" && isGuidedWakeEnabled() && !hasInputValue(elements.guidedWakeTimeInput.value)) {
        setGuidedValidation("Informe o horário do velório para continuar.");
        elements.guidedWakeTimeInput.focus();
        return false;
    }

    if (stepId === "wake-address" && isGuidedWakeEnabled() && !hasInputValue(elements.guidedWakeAddressInput.value)) {
        setGuidedValidation("Informe o endereço do velório para continuar.");
        elements.guidedWakeAddressInput.focus();
        return false;
    }

    if (stepId === "burial-enabled" && !getGuidedChoiceValue("guidedBurialEnabled")) {
        setGuidedValidation("Selecione se haverá sepultamento.");
        if (elements.guidedBurialChoices[0]) {
            elements.guidedBurialChoices[0].focus();
        }
        return false;
    }

    if (stepId === "burial-location" && isGuidedBurialEnabled() && !hasInputValue(elements.guidedBurialLocationInput.value)) {
        setGuidedValidation("Informe o local do sepultamento para continuar.");
        elements.guidedBurialLocationInput.focus();
        return false;
    }

    if (stepId === "burial-date" && isGuidedBurialEnabled() && !elements.guidedBurialDateInput.value) {
        setGuidedValidation("Informe a data do sepultamento para continuar.");
        elements.guidedBurialDateInput.focus();
        return false;
    }

    if (stepId === "burial-time" && isGuidedBurialEnabled() && !hasInputValue(elements.guidedBurialTimeInput.value)) {
        setGuidedValidation("Informe o horário do sepultamento para continuar.");
        elements.guidedBurialTimeInput.focus();
        return false;
    }

    if (stepId === "burial-address" && isGuidedBurialEnabled() && !hasInputValue(elements.guidedBurialAddressInput.value)) {
        setGuidedValidation("Informe o endereço do sepultamento para continuar.");
        elements.guidedBurialAddressInput.focus();
        return false;
    }

    return true;
}

function goToPreviousGuidedStep() {
    if (!guidedVisibleStepIds.length || guidedCurrentStepIndex === 0) return;
    guidedCurrentStepIndex -= 1;
    renderGuidedStep();
}

function goToNextGuidedStep() {
    if (!guidedVisibleStepIds.length) return;

    const currentStepId = guidedVisibleStepIds[guidedCurrentStepIndex];
    if (!validateGuidedStep(currentStepId)) return;

    if (guidedCurrentStepIndex < guidedVisibleStepIds.length - 1) {
        guidedCurrentStepIndex += 1;
        renderGuidedStep();
    }
}

function applyGuidedWakeChoice() {
    const enabled = isGuidedWakeEnabled();
    elements.wakeEnabled.checked = enabled;
    emitElementEvent(elements.wakeEnabled, "change");
    refreshGuidedFlow({ keepCurrentStep: true });
}

function applyGuidedBurialChoice() {
    const enabled = isGuidedBurialEnabled();
    elements.burialEnabled.checked = enabled;
    emitElementEvent(elements.burialEnabled, "change");
    refreshGuidedFlow({ keepCurrentStep: true });
}

function setDarkMode(enabled) {
    document.body.classList.toggle("dark-mode", enabled);
    if (elements.darkModeToggle) {
        elements.darkModeToggle.checked = enabled;
    }

    try {
        localStorage.setItem(DARK_MODE_STORAGE_KEY, enabled ? "1" : "0");
    } catch (error) {
        console.warn("Não foi possível salvar preferência de modo escuro:", error);
    }
}

function initializeDarkMode() {
    let enabled = false;

    try {
        const stored = localStorage.getItem(DARK_MODE_STORAGE_KEY);
        if (stored === "1") {
            enabled = true;
        } else if (stored === "0") {
            enabled = false;
        }
    } catch (error) {
        console.warn("Não foi possível ler preferência de modo escuro:", error);
    }

    document.body.classList.toggle("dark-mode", enabled);
    if (elements.darkModeToggle) {
        elements.darkModeToggle.checked = enabled;
    }
}

function persistHistory() {
    try {
        sessionStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(noteHistory));
    } catch (error) {
        console.warn("Não foi possível persistir histórico na sessão:", error);
    }
}

function restoreHistory() {
    try {
        const raw = sessionStorage.getItem(HISTORY_STORAGE_KEY);
        if (!raw) return;

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return;

        noteHistory = parsed
            .filter(entry => entry && entry.state && entry.thumbnail)
            .slice(0, HISTORY_LIMIT);
    } catch (error) {
        console.warn("Falha ao restaurar histórico da sessão:", error);
        noteHistory = [];
    }
}

function updateHistoryActionControls() {
    const total = noteHistory.length;
    const selected = selectedHistoryIds.size;

    elements.historySelectAll.disabled = total === 0;
    elements.historySelectAll.checked = total > 0 && selected === total;
    elements.historySelectAll.indeterminate = selected > 0 && selected < total;

    elements.historyDeleteSelectedBtn.disabled = selected === 0;
    if (selected > 0) {
        elements.historyDeleteSelectedBtn.innerHTML = `<i class="fas fa-trash"></i> Apagar selecionados (${selected})`;
    } else {
        elements.historyDeleteSelectedBtn.innerHTML = '<i class="fas fa-trash"></i> Apagar selecionados';
    }
}

function deleteHistoryEntries(ids) {
    if (!ids || !ids.size) return;

    noteHistory = noteHistory.filter(entry => !ids.has(entry.id));
    ids.forEach(id => selectedHistoryIds.delete(id));
    persistHistory();
    renderHistoryList();
}

function toggleButtonLoading(button, { pendingHTML, successHTML, errorHTML, action }) {
    return runActionWithButton(button, {
        pendingHTML,
        successHTML,
        errorHTML,
        action
    });
}

async function runActionWithButton(button, { pendingHTML, successHTML, errorHTML, action }) {
    if (!button) {
        await action();
        return;
    }

    const originalHTML = button.innerHTML;
    button.disabled = true;
    button.innerHTML = pendingHTML;

    try {
        await action();
        button.innerHTML = successHTML;
        await wait(1500);
    } catch (error) {
        console.error(error);
        button.innerHTML = errorHTML;
        await wait(2200);
    } finally {
        button.innerHTML = originalHTML;
        button.disabled = false;
    }
}

function applyTextSync() {
    textSyncFields.forEach(field => {
        const inputEl = document.getElementById(field.input);
        const displayEl = document.getElementById(field.display);

        inputEl.addEventListener("input", event => {
            displayEl.textContent = event.target.value || "—";
        });
    });
}

function adjustNameSize() {
    const name = elements.nameInput.value || "—";
    elements.displayName.textContent = name;

    elements.displayName.style.fontSize = "";

    const maxWidth = 960;
    const isCortel = elements.captureArea.classList.contains("theme-cortel");
    const startSize = isCortel ? 72 : 56;
    const fontFamily = isCortel ? "'Cinzel', serif" : "'Playfair Display', serif";

    const tempSpan = document.createElement("span");
    tempSpan.style.cssText = `
        font-family: ${fontFamily};
        font-size: ${startSize}px;
        font-weight: 600;
        visibility: hidden;
        position: absolute;
        white-space: nowrap;
    `;
    tempSpan.textContent = name;
    document.body.appendChild(tempSpan);

    let fontSize = startSize;
    let textWidth = tempSpan.offsetWidth;

    while (textWidth > maxWidth && fontSize > 16) {
        fontSize -= 1;
        tempSpan.style.fontSize = `${fontSize}px`;
        textWidth = tempSpan.offsetWidth;
    }

    document.body.removeChild(tempSpan);
    elements.displayName.style.fontSize = `${fontSize}px`;
}

function updatePreviewScale() {
    const container = elements.previewContainer;
    const stage = elements.previewStage;
    if (!container || !stage) return;

    const containerStyles = window.getComputedStyle(container);
    const horizontalPadding = (parseFloat(containerStyles.paddingLeft) || 0) + (parseFloat(containerStyles.paddingRight) || 0);
    const verticalPadding = (parseFloat(containerStyles.paddingTop) || 0) + (parseFloat(containerStyles.paddingBottom) || 0);

    const availableWidth = Math.max(container.clientWidth - horizontalPadding, 1);
    const availableHeight = Math.max(container.clientHeight - verticalPadding, 1);

    let scale = Math.min(availableWidth / CAPTURE_WIDTH, availableHeight / CAPTURE_HEIGHT, 1);
    if (!Number.isFinite(scale) || scale <= 0) {
        scale = 1;
    }

    stage.style.width = `${Math.round(CAPTURE_WIDTH * scale)}px`;
    stage.style.height = `${Math.round(CAPTURE_HEIGHT * scale)}px`;
    elements.captureArea.style.transform = `scale(${scale})`;
    elements.captureArea.style.transformOrigin = "top left";
}

function syncDateDisplays() {
    elements.displayBirth.textContent = formatDateBR(elements.birthInput.value);
    elements.displayDeath.textContent = formatDateBR(elements.deathInput.value);
    elements.displayWakeDate.textContent = formatDateBR(elements.wakeDateInput.value);
    elements.displayBurialDate.textContent = formatDateBR(elements.burialDateInput.value);
}

function syncAllDisplays() {
    textSyncFields.forEach(field => {
        const inputEl = document.getElementById(field.input);
        const displayEl = document.getElementById(field.display);
        displayEl.textContent = inputEl.value || "—";
    });

    syncDateDisplays();
    adjustNameSize();
}

function openPhotoEditor() {
    syncPhotoEditorFrame();
    elements.photoEditorModal.classList.add("active");
    elements.editorZoomSlider.value = photoState.scale * 100;
    elements.editorPosXSlider.value = photoState.offsetX;
    elements.editorPosYSlider.value = photoState.offsetY;
    updateEditorPreview();
}

function closePhotoEditor() {
    elements.photoEditorModal.classList.remove("active");
}

function updateEditorPreview() {
    photoState.offsetX = clamp(photoState.offsetX, PHOTO_OFFSET_MIN, PHOTO_OFFSET_MAX);
    photoState.offsetY = clamp(photoState.offsetY, PHOTO_OFFSET_MIN, PHOTO_OFFSET_MAX);
    photoState.scale = clamp(photoState.scale, 0.1, 3);

    applyPhotoTransformTo(elements.photoEditorImg, elements.photoEditorPreview);

    elements.editorZoomSlider.value = photoState.scale * 100;
    elements.editorPosXSlider.value = photoState.offsetX;
    elements.editorPosYSlider.value = photoState.offsetY;
    syncGuidedPhotoAdjustControls();
}

function updatePhotoTransform() {
    photoState.offsetX = clamp(photoState.offsetX, PHOTO_OFFSET_MIN, PHOTO_OFFSET_MAX);
    photoState.offsetY = clamp(photoState.offsetY, PHOTO_OFFSET_MIN, PHOTO_OFFSET_MAX);
    photoState.scale = clamp(photoState.scale, 0.1, 3);

    applyPhotoTransformTo(elements.displayPhoto, elements.photoFrameInner || elements.photoFrame);
    applyPhotoTransformTo(elements.previewImg, elements.photoPreview);
    applyPhotoTransformTo(elements.guidedPhotoLiveImg, elements.guidedPhotoLiveFrame);
}

function resetPhotoPosition() {
    photoState.offsetX = 0;
    photoState.offsetY = 0;
    photoState.scale = 1;
    updateEditorPreview();
    updatePhotoTransform();
}

function applyPhotoSource(src, { openEditor = false, resetPosition = true } = {}) {
    currentPhotoSrc = src;
    elements.previewImg.src = src;
    elements.displayPhoto.src = src;
    elements.photoEditorImg.src = src;
    if (elements.guidedPhotoLiveImg) {
        elements.guidedPhotoLiveImg.src = src;
    }

    elements.photoPreview.classList.add("has-photo");
    elements.photoControls.classList.add("active");
    elements.captureArea.classList.add("has-photo");

    if (resetPosition) {
        resetPhotoPosition();
    } else {
        updateEditorPreview();
        updatePhotoTransform();
    }

    if (openEditor) {
        openPhotoEditor();
    }

    updateGuidedPhotoStatus();
}

function clearPhoto() {
    currentPhotoSrc = "";

    elements.photoInput.value = "";
    elements.previewImg.src = PLACEHOLDER_PHOTO_SRC;
    elements.displayPhoto.src = PLACEHOLDER_PHOTO_SRC;
    elements.photoEditorImg.src = PLACEHOLDER_PHOTO_SRC;
    if (elements.guidedPhotoLiveImg) {
        elements.guidedPhotoLiveImg.src = PLACEHOLDER_PHOTO_SRC;
    }

    elements.photoPreview.classList.remove("has-photo");
    elements.photoControls.classList.remove("active");
    elements.captureArea.classList.remove("has-photo");

    resetPhotoPosition();
    updateGuidedPhotoStatus();
}

function getPointerCoordinates(event) {
    if (event.touches && event.touches.length > 0) {
        return {
            x: event.touches[0].pageX,
            y: event.touches[0].pageY
        };
    }

    if (event.changedTouches && event.changedTouches.length > 0) {
        return {
            x: event.changedTouches[0].pageX,
            y: event.changedTouches[0].pageY
        };
    }

    if (typeof event.pageX === "number" && typeof event.pageY === "number") {
        return {
            x: event.pageX,
            y: event.pageY
        };
    }

    if (typeof event.clientX === "number" && typeof event.clientY === "number") {
        return {
            x: event.clientX + window.scrollX,
            y: event.clientY + window.scrollY
        };
    }

    return null;
}

function startDrag(event) {
    event.preventDefault();
    const point = getPointerCoordinates(event);
    if (!point) return;
    const { ratioX, ratioY } = getPhotoEditorRatio();

    photoState.isDragging = true;
    photoState.startX = point.x - (photoState.offsetX * ratioX);
    photoState.startY = point.y - (photoState.offsetY * ratioY);
    elements.photoEditorImg.classList.add("grabbing");
}

function doDrag(event) {
    if (!photoState.isDragging) return;
    event.preventDefault();

    const point = getPointerCoordinates(event);
    if (!point) return;
    const { ratioX, ratioY } = getPhotoEditorRatio();

    photoState.offsetX = clamp((point.x - photoState.startX) / ratioX, PHOTO_OFFSET_MIN, PHOTO_OFFSET_MAX);
    photoState.offsetY = clamp((point.y - photoState.startY) / ratioY, PHOTO_OFFSET_MIN, PHOTO_OFFSET_MAX);

    updateEditorPreview();
}

function stopDrag() {
    photoState.isDragging = false;
    elements.photoEditorImg.classList.remove("grabbing");
}

function setPhotoFormat(format) {
    elements.photoFrame.classList.remove(
        "format-circle",
        "format-oval-v",
        "format-oval-h",
        "format-rectangle",
        "format-square"
    );

    elements.photoFrame.classList.add(`format-${format}`);
    currentFormat = format;

    elements.formatOptions.forEach(option => {
        const isActive = option.dataset.format === format;
        option.classList.toggle("active", isActive);
        const radio = option.querySelector('input[type="radio"]');
        if (radio) {
            radio.checked = isActive;
        }
    });

    syncGuidedPhotoLiveFrameFormat();
    syncPhotoEditorFrame();
    updatePhotoTransform();
    updateEditorPreview();
}

function setActivePreset(container, targetButton) {
    container.querySelectorAll(".location-preset-btn").forEach(button => {
        button.classList.toggle("active", button === targetButton);
    });
}

function setPresetToCustom(container) {
    const customButton = Array.from(container.querySelectorAll(".location-preset-btn")).find(
        button => button.dataset.location === "Personalizado"
    );

    if (customButton) {
        setActivePreset(container, customButton);
    }
}

function getActivePresetIndex(container) {
    const buttons = Array.from(container.querySelectorAll(".location-preset-btn"));
    return buttons.findIndex(button => button.classList.contains("active"));
}

function setActivePresetByIndex(container, index) {
    const buttons = Array.from(container.querySelectorAll(".location-preset-btn"));
    buttons.forEach((button, currentIndex) => {
        button.classList.toggle("active", currentIndex === index);
    });
}

function applyPresetValue({ target, location, address }) {
    if (target === "wake") {
        if (location !== "Personalizado") {
            elements.wakeLocationInput.value = location;
            elements.wakeAddressInput.value = address;
            document.getElementById("displayWakeLocation").textContent = location;
            document.getElementById("displayWakeAddress").textContent = address;
        }
        return;
    }

    if (location !== "Personalizado") {
        elements.burialLocationInput.value = location;
        elements.burialAddressInput.value = address;
        document.getElementById("displayBurialLocation").textContent = location;
        document.getElementById("displayBurialAddress").textContent = address;
    }
}

function setSectionEnabled(section, enabled, detailBlock) {
    const content = section.querySelector(".section-content");
    if (content) {
        content.classList.toggle("is-disabled", !enabled);
    }

    detailBlock.classList.toggle("hidden", !enabled);
}

function updateWakeSectionState() {
    setSectionEnabled(elements.wakeSection, elements.wakeEnabled.checked, elements.wakeBlock);
}

function updateBurialSectionState() {
    const enabled = elements.burialEnabled.checked;
    setSectionEnabled(elements.burialSection, enabled, elements.burialBlock);
}

function updateCremationUI() {
    if (elements.cremationMode.checked) {
        elements.burialIcon.className = "fas fa-fire";
        elements.burialTitle.textContent = "Cremação";
        elements.displayBurialIcon.className = "fas fa-fire";
        elements.displayBurialTitle.textContent = "Cremação";
    } else {
        elements.burialIcon.className = "fas fa-cross";
        elements.burialTitle.textContent = "Sepultamento";
        elements.displayBurialIcon.className = "fas fa-monument";
        elements.displayBurialTitle.textContent = "Sepultamento";
    }
}

function copyWakeToBurial() {
    elements.burialLocationInput.value = elements.wakeLocationInput.value;
    elements.burialAddressInput.value = elements.wakeAddressInput.value;
    elements.burialDateInput.value = elements.wakeDateInput.value;
    elements.burialTimeInput.value = elements.wakeTimeInput.value;

    document.getElementById("displayBurialLocation").textContent = elements.burialLocationInput.value || "—";
    document.getElementById("displayBurialAddress").textContent = elements.burialAddressInput.value || "—";
    elements.displayBurialDate.textContent = formatDateBR(elements.burialDateInput.value);
    document.getElementById("displayBurialTime").textContent = elements.burialTimeInput.value || "—";

    setPresetToCustom(elements.burialPresets);
}

function formatTimeForHistory(isoString) {
    const date = new Date(isoString);
    const dateLabel = date.toLocaleDateString("pt-BR");
    const timeLabel = date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
    });
    return `${dateLabel} às ${timeLabel}`;
}

function openHistoryModal() {
    renderHistoryList();
    elements.historyModal.classList.add("active");
}

function closeHistoryModal() {
    elements.historyModal.classList.remove("active");
}

function captureCurrentState() {
    return {
        values: {
            nameInput: elements.nameInput.value,
            birthInput: elements.birthInput.value,
            deathInput: elements.deathInput.value,
            wakeLocationInput: elements.wakeLocationInput.value,
            wakeDateInput: elements.wakeDateInput.value,
            wakeTimeInput: elements.wakeTimeInput.value,
            wakeAddressInput: elements.wakeAddressInput.value,
            burialLocationInput: elements.burialLocationInput.value,
            burialDateInput: elements.burialDateInput.value,
            burialTimeInput: elements.burialTimeInput.value,
            burialAddressInput: elements.burialAddressInput.value
        },
        toggles: {
            wakeEnabled: elements.wakeEnabled.checked,
            burialEnabled: elements.burialEnabled.checked,
            cremationMode: elements.cremationMode.checked
        },
        photo: {
            src: currentPhotoSrc,
            offsetX: photoState.offsetX,
            offsetY: photoState.offsetY,
            scale: photoState.scale,
            hasPhoto: Boolean(currentPhotoSrc)
        },
        format: currentFormat,
        wakePresetIndex: getActivePresetIndex(elements.wakePresets),
        burialPresetIndex: getActivePresetIndex(elements.burialPresets),
        openAccordions: Array.from(elements.accordionSections)
            .filter(section => section.classList.contains("is-open"))
            .map(section => section.id)
    };
}

function applyState(state) {
    Object.entries(state.values).forEach(([id, value]) => {
        const input = document.getElementById(id);
        if (input) {
            input.value = value;
        }
    });

    elements.wakeEnabled.checked = Boolean(state.toggles.wakeEnabled);
    elements.burialEnabled.checked = Boolean(state.toggles.burialEnabled);
    elements.cremationMode.checked = Boolean(state.toggles.cremationMode);

    updateWakeSectionState();
    updateBurialSectionState();
    updateCremationUI();

    setPhotoFormat(state.format || "circle");
    setActivePresetByIndex(elements.wakePresets, state.wakePresetIndex);
    setActivePresetByIndex(elements.burialPresets, state.burialPresetIndex);

    if (state.photo && state.photo.hasPhoto && state.photo.src) {
        applyPhotoSource(state.photo.src, { openEditor: false, resetPosition: true });
        photoState.offsetX = clamp(state.photo.offsetX || 0, PHOTO_OFFSET_MIN, PHOTO_OFFSET_MAX);
        photoState.offsetY = clamp(state.photo.offsetY || 0, PHOTO_OFFSET_MIN, PHOTO_OFFSET_MAX);
        photoState.scale = state.photo.scale || 1;
        updateEditorPreview();
        updatePhotoTransform();
    } else {
        clearPhoto();
    }

    if (Array.isArray(state.openAccordions)) {
        elements.accordionSections.forEach(section => {
            const shouldBeOpen = state.openAccordions.includes(section.id);
            section.classList.toggle("is-open", shouldBeOpen);
            const toggle = section.querySelector("[data-accordion-toggle]");
            if (toggle) {
                toggle.setAttribute("aria-expanded", shouldBeOpen ? "true" : "false");
            }
        });
    }

    syncAllDisplays();
}

function safeNameForFile() {
    const name = elements.nameInput.value || "nota-condolencias";
    return name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .toLowerCase() || "nota-condolencias";
}

async function generateImageBlob() {
    await document.fonts.ready;
    const offscreenRoot = document.createElement("div");
    offscreenRoot.style.position = "fixed";
    offscreenRoot.style.left = "-20000px";
    offscreenRoot.style.top = "0";
    offscreenRoot.style.width = `${CAPTURE_WIDTH}px`;
    offscreenRoot.style.height = `${CAPTURE_HEIGHT}px`;
    offscreenRoot.style.overflow = "hidden";
    offscreenRoot.style.opacity = "0";
    offscreenRoot.style.pointerEvents = "none";
    offscreenRoot.style.zIndex = "-1";

    const clonedCaptureArea = elements.captureArea.cloneNode(true);
    clonedCaptureArea.id = "captureAreaExportClone";
    clonedCaptureArea.style.width = `${CAPTURE_WIDTH}px`;
    clonedCaptureArea.style.maxWidth = "none";
    clonedCaptureArea.style.height = `${CAPTURE_HEIGHT}px`;
    clonedCaptureArea.style.aspectRatio = "auto";
    clonedCaptureArea.style.padding = "50px 60px";
    clonedCaptureArea.style.margin = "0";
    clonedCaptureArea.style.transform = "none";

    offscreenRoot.appendChild(clonedCaptureArea);
    document.body.appendChild(offscreenRoot);
    document.body.classList.add("is-capturing");

    try {
        await new Promise(resolve => requestAnimationFrame(resolve));

        const canvas = await html2canvas(clonedCaptureArea, {
            scale: 1,
            backgroundColor: "transparent",
            logging: false,
            useCORS: true,
            allowTaint: true
        });

        return await new Promise((resolve, reject) => {
            canvas.toBlob(blob => {
                if (!blob) {
                    reject(new Error("Falha ao gerar a imagem (toBlob retornou null)."));
                    return;
                }
                resolve(blob);
            }, "image/png");
        });
    } finally {
        offscreenRoot.remove();
        document.body.classList.remove("is-capturing");
    }
}

async function blobToDataURL(blob) {
    return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Falha ao gerar miniatura."));
        reader.readAsDataURL(blob);
    });
}

function downloadBlob(blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.download = `nota-${safeNameForFile()}-${Date.now()}.png`;
    link.href = url;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function isClipboardPermissionError(error) {
    if (!error) return false;
    return error.name === "NotAllowedError" || error.name === "SecurityError";
}

async function tryLegacyCopyWithExecCommand(blob) {
    const dataUrl = await blobToDataURL(blob);
    const container = document.createElement("div");
    container.contentEditable = "true";
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.opacity = "0";

    const image = document.createElement("img");
    image.src = dataUrl;
    container.appendChild(image);
    document.body.appendChild(container);

    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNode(image);

    selection.removeAllRanges();
    selection.addRange(range);

    const copied = document.execCommand("copy");
    selection.removeAllRanges();
    container.remove();

    if (!copied) {
        throw new Error("Não foi possível copiar imagem com fallback legado.");
    }
}

async function downloadNote(button) {
    await toggleButtonLoading(button, {
        pendingHTML: '<i class="fas fa-spinner fa-spin"></i> Gerando...',
        successHTML: '<i class="fas fa-check"></i> Baixado!',
        errorHTML: '<i class="fas fa-exclamation-triangle"></i> Erro',
        action: async () => {
            const blob = await generateImageBlob();
            downloadBlob(blob);
        }
    });
}

async function copyImageToClipboard(button) {
    const originalHTML = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Copiando...';

    try {
        const blobPromise = generateImageBlob();
        let copied = false;

        if (navigator.clipboard && typeof ClipboardItem !== "undefined") {
            try {
                await navigator.clipboard.write([
                    new ClipboardItem({
                        "image/png": blobPromise
                    })
                ]);
                copied = true;
            } catch (error) {
                if (!isClipboardPermissionError(error)) {
                    throw error;
                }
            }
        }

        if (!copied) {
            const blob = await blobPromise;
            try {
                await tryLegacyCopyWithExecCommand(blob);
                copied = true;
            } catch (legacyError) {
                console.warn("Fallback de cópia falhou, iniciando download automático:", legacyError);
            }
        }

        if (copied) {
            button.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        } else {
            const blob = await blobPromise;
            downloadBlob(blob);
            button.innerHTML = '<i class="fas fa-download"></i> Sem permissão: baixado';
        }

        await wait(1800);
    } catch (error) {
        console.error("Falha ao copiar imagem:", error);
        button.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Erro';
        await wait(2200);
    } finally {
        button.innerHTML = originalHTML;
        button.disabled = false;
    }
}

function renderHistoryList() {
    elements.historyList.innerHTML = "";

    if (!noteHistory.length) {
        elements.historyEmpty.style.display = "block";
        selectedHistoryIds.clear();
        updateHistoryActionControls();
        return;
    }

    elements.historyEmpty.style.display = "none";
    selectedHistoryIds.forEach(id => {
        const exists = noteHistory.some(entry => entry.id === id);
        if (!exists) {
            selectedHistoryIds.delete(id);
        }
    });

    noteHistory.forEach(entry => {
        const row = document.createElement("div");
        row.className = "history-item-row";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "history-item-check";
        checkbox.checked = selectedHistoryIds.has(entry.id);
        checkbox.setAttribute("aria-label", `Selecionar ${entry.label}`);

        const item = document.createElement("button");
        item.type = "button";
        item.className = "history-item";
        item.classList.toggle("selected", checkbox.checked);

        const thumb = document.createElement("img");
        thumb.className = "history-item-thumb";
        thumb.src = entry.thumbnail;
        thumb.alt = `Miniatura de ${entry.label}`;

        const meta = document.createElement("div");
        meta.className = "history-item-meta";

        const title = document.createElement("div");
        title.className = "history-item-name";
        title.textContent = entry.label;

        const time = document.createElement("div");
        time.className = "history-item-time";
        time.textContent = formatTimeForHistory(entry.createdAt);

        const details = document.createElement("div");
        details.className = "history-item-details";
        details.textContent = `${entry.state.toggles.wakeEnabled ? "Velório" : "Sem velório"} • ${entry.state.toggles.burialEnabled ? entry.state.toggles.cremationMode ? "Cremação" : "Sepultamento" : "Sem sepultamento"}`;

        meta.append(title, time, details);
        item.append(thumb, meta);

        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
                selectedHistoryIds.add(entry.id);
            } else {
                selectedHistoryIds.delete(entry.id);
            }
            item.classList.toggle("selected", checkbox.checked);
            updateHistoryActionControls();
        });

        item.addEventListener("click", () => {
            applyState(cloneState(entry.state));
            closeHistoryModal();
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "history-item-delete";
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.title = "Apagar este item do histórico";

        deleteButton.addEventListener("click", event => {
            event.stopPropagation();
            deleteHistoryEntries(new Set([entry.id]));
        });

        row.append(checkbox, item, deleteButton);
        elements.historyList.appendChild(row);
    });

    updateHistoryActionControls();
}

async function saveToHistory(button) {
    await toggleButtonLoading(button, {
        pendingHTML: '<i class="fas fa-spinner fa-spin"></i> Salvando...',
        successHTML: '<i class="fas fa-check"></i> Salvo!',
        errorHTML: '<i class="fas fa-exclamation-triangle"></i> Erro',
        action: async () => {
            const state = captureCurrentState();
            const blob = await generateImageBlob();
            const thumbnail = await blobToDataURL(blob);

            noteHistory.unshift({
                id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                createdAt: new Date().toISOString(),
                label: state.values.nameInput || "Sem nome",
                state,
                thumbnail
            });

            if (noteHistory.length > HISTORY_LIMIT) {
                noteHistory = noteHistory.slice(0, HISTORY_LIMIT);
            }

            selectedHistoryIds = new Set();
            persistHistory();
            renderHistoryList();
        }
    });
}

async function readFileAsDataURL(file) {
    return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => resolve(event.target.result);
        reader.onerror = () => reject(new Error("Não foi possível carregar a imagem."));
        reader.readAsDataURL(file);
    });
}

async function handleImageFile(file, options = { openEditor: true }) {
    if (!file || !file.type.startsWith("image/")) return;

    const photoDataUrl = await readFileAsDataURL(file);
    applyPhotoSource(photoDataUrl, {
        openEditor: Boolean(options.openEditor),
        resetPosition: true
    });
}

async function handlePaste(event) {
    if (!event.clipboardData || !event.clipboardData.items) return;

    const imageItem = Array.from(event.clipboardData.items).find(item => item.type.startsWith("image/"));
    if (!imageItem) return;

    const file = imageItem.getAsFile();
    if (!file) return;

    event.preventDefault();

    try {
        await handleImageFile(file, { openEditor: true });
    } catch (error) {
        console.error(error);
    }
}

function setupDragAndDrop() {
    const target = elements.photoDropTarget;

    ["dragenter", "dragover"].forEach(eventName => {
        target.addEventListener(eventName, event => {
            event.preventDefault();
            target.classList.add("drag-over");
        });
    });

    ["dragleave", "dragend", "drop"].forEach(eventName => {
        target.addEventListener(eventName, event => {
            event.preventDefault();
            target.classList.remove("drag-over");
        });
    });

    target.addEventListener("drop", async event => {
        const file = event.dataTransfer?.files?.[0];
        if (!file) return;

        try {
            await handleImageFile(file, { openEditor: true });
        } catch (error) {
            console.error(error);
        }
    });
}

function setupAccordions() {
    elements.accordionSections.forEach(section => {
        const toggle = section.querySelector("[data-accordion-toggle]");
        if (!toggle) return;

        toggle.addEventListener("click", () => {
            const isOpen = section.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    });
}

function setTheme(themeName) {
    const normalizedTheme = themeName === "theme-cortel" ? "theme-cortel" : "theme-cortel";

    elements.noteCard.className = `note-card ${normalizedTheme}`;
    if (currentPhotoSrc) {
        elements.noteCard.classList.add("has-photo");
    }

    adjustNameSize();
}

function resetToDefault() {
    if (!defaultState) return;

    applyState(cloneState(defaultState));
    closeHistoryModal();
    closePhotoEditor();
}

function bindEvents() {
    elements.nameInput.addEventListener("input", adjustNameSize);

    elements.birthInput.addEventListener("change", () => {
        elements.displayBirth.textContent = formatDateBR(elements.birthInput.value);
    });

    elements.deathInput.addEventListener("change", () => {
        elements.displayDeath.textContent = formatDateBR(elements.deathInput.value);
    });

    elements.wakeDateInput.addEventListener("change", () => {
        elements.displayWakeDate.textContent = formatDateBR(elements.wakeDateInput.value);
    });

    elements.burialDateInput.addEventListener("change", () => {
        elements.displayBurialDate.textContent = formatDateBR(elements.burialDateInput.value);
    });

    if (elements.guidedModeBtn) {
        elements.guidedModeBtn.addEventListener("click", openGuidedModal);
    }

    if (elements.guidedCloseBtn) {
        elements.guidedCloseBtn.addEventListener("click", closeGuidedModal);
    }

    if (elements.guidedModal) {
        elements.guidedModal.addEventListener("keydown", event => {
            const currentStepId = guidedVisibleStepIds[guidedCurrentStepIndex];
            const isTextField = event.target instanceof HTMLInputElement
                && event.target.type !== "radio"
                && event.target.type !== "file";

            if (event.key === "Enter" && isTextField && currentStepId !== "finish") {
                event.preventDefault();
                goToNextGuidedStep();
            }
        });
    }

    if (elements.guidedPrevBtn) {
        elements.guidedPrevBtn.addEventListener("click", goToPreviousGuidedStep);
    }

    if (elements.guidedNextBtn) {
        elements.guidedNextBtn.addEventListener("click", goToNextGuidedStep);
    }

    if (elements.guidedFinishBtn) {
        elements.guidedFinishBtn.addEventListener("click", () => {
            guidedCurrentStepIndex = 0;
            renderGuidedStep();
        });
    }

    if (elements.guidedDownloadBtn) {
        elements.guidedDownloadBtn.addEventListener("click", () => downloadNote(elements.guidedDownloadBtn));
    }

    if (elements.guidedCopyBtn) {
        elements.guidedCopyBtn.addEventListener("click", () => copyImageToClipboard(elements.guidedCopyBtn));
    }

    if (elements.guidedPhotoInput) {
        elements.guidedPhotoInput.addEventListener("change", async event => {
            const file = event.target.files?.[0];
            if (!file) return;

            try {
                await handleImageFile(file, { openEditor: false });
            } catch (error) {
                console.error(error);
            } finally {
                event.target.value = "";
                updateGuidedPhotoStatus();
            }
        });
    }

    if (elements.guidedOpenEditorBtn) {
        elements.guidedOpenEditorBtn.addEventListener("click", () => {
            if (!currentPhotoSrc) return;
            openPhotoEditor();
        });
    }

    if (elements.guidedZoomSlider) {
        elements.guidedZoomSlider.addEventListener("input", () => {
            if (!currentPhotoSrc) return;
            photoState.scale = elements.guidedZoomSlider.value / 100;
            updateEditorPreview();
            updatePhotoTransform();
        });
    }

    if (elements.guidedPosXSlider) {
        elements.guidedPosXSlider.addEventListener("input", () => {
            if (!currentPhotoSrc) return;
            photoState.offsetX = clamp(parseInt(elements.guidedPosXSlider.value, 10), PHOTO_OFFSET_MIN, PHOTO_OFFSET_MAX);
            updateEditorPreview();
            updatePhotoTransform();
        });
    }

    if (elements.guidedPosYSlider) {
        elements.guidedPosYSlider.addEventListener("input", () => {
            if (!currentPhotoSrc) return;
            photoState.offsetY = clamp(parseInt(elements.guidedPosYSlider.value, 10), PHOTO_OFFSET_MIN, PHOTO_OFFSET_MAX);
            updateEditorPreview();
            updatePhotoTransform();
        });
    }

    if (elements.guidedRemovePhotoBtn) {
        elements.guidedRemovePhotoBtn.addEventListener("click", () => {
            clearPhoto();
            updateGuidedPhotoStatus();
        });
    }

    if (elements.guidedNameInput) {
        elements.guidedNameInput.addEventListener("input", () => {
            elements.nameInput.value = elements.guidedNameInput.value;
            emitElementEvent(elements.nameInput, "input");
        });
    }

    if (elements.guidedBirthInput) {
        elements.guidedBirthInput.addEventListener("change", () => {
            elements.birthInput.value = elements.guidedBirthInput.value;
            emitElementEvent(elements.birthInput, "change");
        });
    }

    if (elements.guidedDeathInput) {
        elements.guidedDeathInput.addEventListener("change", () => {
            elements.deathInput.value = elements.guidedDeathInput.value;
            emitElementEvent(elements.deathInput, "change");
        });
    }

    if (elements.guidedWakeLocationInput) {
        elements.guidedWakeLocationInput.addEventListener("input", () => {
            elements.wakeLocationInput.value = elements.guidedWakeLocationInput.value;
            emitElementEvent(elements.wakeLocationInput, "input");
            updateGuidedPresetButtons("wake");
            setGuidedPresetFeedback("wake", "");
        });
    }

    if (elements.guidedWakeDateInput) {
        elements.guidedWakeDateInput.addEventListener("change", () => {
            elements.wakeDateInput.value = elements.guidedWakeDateInput.value;
            emitElementEvent(elements.wakeDateInput, "change");
        });
    }

    if (elements.guidedWakeTimeInput) {
        elements.guidedWakeTimeInput.addEventListener("input", () => {
            elements.wakeTimeInput.value = elements.guidedWakeTimeInput.value;
            emitElementEvent(elements.wakeTimeInput, "input");
        });
    }

    if (elements.guidedWakeAddressInput) {
        elements.guidedWakeAddressInput.addEventListener("input", () => {
            elements.wakeAddressInput.value = elements.guidedWakeAddressInput.value;
            emitElementEvent(elements.wakeAddressInput, "input");
            updateGuidedPresetButtons("wake");
            setGuidedPresetFeedback("wake", "");
        });
    }

    if (elements.guidedBurialLocationInput) {
        elements.guidedBurialLocationInput.addEventListener("input", () => {
            elements.burialLocationInput.value = elements.guidedBurialLocationInput.value;
            emitElementEvent(elements.burialLocationInput, "input");
            updateGuidedPresetButtons("burial");
            setGuidedPresetFeedback("burial", "");
        });
    }

    if (elements.guidedBurialDateInput) {
        elements.guidedBurialDateInput.addEventListener("change", () => {
            elements.burialDateInput.value = elements.guidedBurialDateInput.value;
            emitElementEvent(elements.burialDateInput, "change");
        });
    }

    if (elements.guidedBurialTimeInput) {
        elements.guidedBurialTimeInput.addEventListener("input", () => {
            elements.burialTimeInput.value = elements.guidedBurialTimeInput.value;
            emitElementEvent(elements.burialTimeInput, "input");
        });
    }

    if (elements.guidedBurialAddressInput) {
        elements.guidedBurialAddressInput.addEventListener("input", () => {
            elements.burialAddressInput.value = elements.guidedBurialAddressInput.value;
            emitElementEvent(elements.burialAddressInput, "input");
            updateGuidedPresetButtons("burial");
            setGuidedPresetFeedback("burial", "");
        });
    }

    elements.guidedWakePresetButtons.forEach(button => {
        button.addEventListener("click", () => {
            applyGuidedPreset({
                target: "wake",
                location: button.dataset.location || "",
                address: button.dataset.address || ""
            });
        });
    });

    elements.guidedBurialPresetButtons.forEach(button => {
        button.addEventListener("click", () => {
            applyGuidedPreset({
                target: "burial",
                location: button.dataset.location || "",
                address: button.dataset.address || ""
            });
        });
    });

    if (elements.guidedCopyWakeInfoBtn) {
        elements.guidedCopyWakeInfoBtn.addEventListener("click", copyGuidedWakeDataToBurial);
    }

    elements.guidedWakeChoices.forEach(choice => {
        choice.addEventListener("change", applyGuidedWakeChoice);
    });

    elements.guidedBurialChoices.forEach(choice => {
        choice.addEventListener("change", applyGuidedBurialChoice);
    });

    elements.photoInput.addEventListener("change", async event => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            await handleImageFile(file, { openEditor: true });
        } catch (error) {
            console.error(error);
        }
    });

    elements.editPhotoBtn.addEventListener("click", openPhotoEditor);
    elements.removePhotoBtn.addEventListener("click", clearPhoto);

    elements.photoEditorClose.addEventListener("click", closePhotoEditor);
    elements.editorResetBtn.addEventListener("click", resetPhotoPosition);
    elements.editorConfirmBtn.addEventListener("click", () => {
        updatePhotoTransform();
        closePhotoEditor();
    });

    elements.photoEditorModal.addEventListener("click", event => {
        if (event.target === elements.photoEditorModal) {
            closePhotoEditor();
        }
    });

    elements.editorZoomSlider.addEventListener("input", () => {
        photoState.scale = elements.editorZoomSlider.value / 100;
        updateEditorPreview();
    });

    elements.editorPosXSlider.addEventListener("input", () => {
        photoState.offsetX = clamp(parseInt(elements.editorPosXSlider.value, 10), PHOTO_OFFSET_MIN, PHOTO_OFFSET_MAX);
        updateEditorPreview();
    });

    elements.editorPosYSlider.addEventListener("input", () => {
        photoState.offsetY = clamp(parseInt(elements.editorPosYSlider.value, 10), PHOTO_OFFSET_MIN, PHOTO_OFFSET_MAX);
        updateEditorPreview();
    });

    elements.photoEditorPreview.addEventListener("wheel", event => {
        event.preventDefault();
        const delta = -Math.sign(event.deltaY) * 0.1;
        photoState.scale = parseFloat(clamp(photoState.scale + delta, 0.1, 3).toFixed(2));
        updateEditorPreview();
    });

    elements.photoEditorPreview.addEventListener("mousedown", startDrag);
    document.addEventListener("mousemove", doDrag);
    document.addEventListener("mouseup", stopDrag);

    elements.photoEditorPreview.addEventListener("touchstart", startDrag, { passive: false });
    document.addEventListener("touchmove", doDrag, { passive: false });
    document.addEventListener("touchend", stopDrag);

    elements.formatOptions.forEach(option => {
        option.addEventListener("click", () => {
            setPhotoFormat(option.dataset.format);
        });
    });

    elements.wakeEnabled.addEventListener("change", updateWakeSectionState);
    elements.burialEnabled.addEventListener("change", updateBurialSectionState);
    elements.cremationMode.addEventListener("change", updateCremationUI);

    elements.wakePresets.querySelectorAll(".location-preset-btn").forEach(button => {
        button.addEventListener("click", () => {
            setActivePreset(elements.wakePresets, button);
            applyPresetValue({
                target: "wake",
                location: button.dataset.location,
                address: button.dataset.address || ""
            });
        });
    });

    elements.burialPresets.querySelectorAll(".location-preset-btn").forEach(button => {
        button.addEventListener("click", () => {
            setActivePreset(elements.burialPresets, button);
            applyPresetValue({
                target: "burial",
                location: button.dataset.location,
                address: button.dataset.address || ""
            });
        });
    });

    elements.wakeLocationInput.addEventListener("input", () => setPresetToCustom(elements.wakePresets));
    elements.wakeAddressInput.addEventListener("input", () => setPresetToCustom(elements.wakePresets));
    elements.burialLocationInput.addEventListener("input", () => setPresetToCustom(elements.burialPresets));
    elements.burialAddressInput.addEventListener("input", () => setPresetToCustom(elements.burialPresets));

    elements.copyWakeToBurialBtn.addEventListener("click", copyWakeToBurial);

    elements.downloadBtn.addEventListener("click", () => downloadNote(elements.downloadBtn));
    elements.copyImageBtn.addEventListener("click", () => copyImageToClipboard(elements.copyImageBtn));
    elements.saveHistoryBtn.addEventListener("click", () => saveToHistory(elements.saveHistoryBtn));

    elements.historyBtn.addEventListener("click", openHistoryModal);
    elements.historyCloseBtn.addEventListener("click", closeHistoryModal);
    elements.historyModal.addEventListener("click", event => {
        if (event.target === elements.historyModal) {
            closeHistoryModal();
        }
    });
    elements.historySelectAll.addEventListener("change", () => {
        if (elements.historySelectAll.checked) {
            selectedHistoryIds = new Set(noteHistory.map(entry => entry.id));
        } else {
            selectedHistoryIds.clear();
        }
        renderHistoryList();
    });
    elements.historyDeleteSelectedBtn.addEventListener("click", () => {
        if (!selectedHistoryIds.size) return;
        deleteHistoryEntries(new Set(selectedHistoryIds));
    });
    if (elements.darkModeToggle) {
        elements.darkModeToggle.addEventListener("change", event => {
            setDarkMode(event.target.checked);
        });
    }

    elements.resetBtn.addEventListener("click", async () => {
        const originalHTML = elements.resetBtn.innerHTML;
        elements.resetBtn.disabled = true;
        resetToDefault();
        elements.resetBtn.innerHTML = '<i class="fas fa-check"></i> Novo';
        await wait(900);
        elements.resetBtn.innerHTML = originalHTML;
        elements.resetBtn.disabled = false;
    });

    document.addEventListener("paste", handlePaste);
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeHistoryModal();
            closePhotoEditor();
        }
    });
    window.addEventListener("resize", () => {
        updatePreviewScale();
        if (elements.photoEditorModal.classList.contains("active")) {
            syncPhotoEditorFrame();
            updateEditorPreview();
        }
    });
    window.addEventListener("load", updatePreviewScale);

    setupDragAndDrop();
}

function initialize() {
    restoreHistory();
    initializeDarkMode();
    applyTextSync();
    setupAccordions();
    bindEvents();

    setTheme("theme-cortel");
    setPhotoFormat("circle");

    syncAllDisplays();
    updateWakeSectionState();
    updateBurialSectionState();
    updateCremationUI();
    clearPhoto();
    updatePreviewScale();

    defaultState = captureCurrentState();
}

window.setTheme = setTheme;
window.addEventListener("DOMContentLoaded", initialize);
