const defaultPreviewId = "preview-0";
const workMenu = document.getElementById("workmenu");
const previewImages = document.getElementById("previewimages");
const previews = document.querySelectorAll(".previewimg");
const descriptionText = document.querySelector("#desctext .desctext");
const workDropdown = document.querySelector("details#work");
const defaultDescription = descriptionText?.innerHTML;
const projectImages = document.getElementById("projectpageimages");
const projectScroller = projectImages?.closest("#right");
const aboutScroller = document.body.classList.contains("about-page")
    ? document.getElementById("left")
    : null;

document.addEventListener("wheel", (event) => {
    if (window.matchMedia("(max-width: 768px)").matches) return;
    const activeScroller = aboutScroller || projectScroller;
    if (!activeScroller || activeScroller.contains(event.target) || event.ctrlKey) return;

    const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? 16
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? activeScroller.clientHeight
            : 1;

    activeScroller.scrollBy({
        top: event.deltaY * unit,
        left: event.deltaX * unit
    });
    event.preventDefault();
}, { passive: false });

document.addEventListener("click", (event) => {
    if (workDropdown && !workDropdown.contains(event.target)) workDropdown.open = false;
});
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && workDropdown?.open) {
        workDropdown.open = false;
        workDropdown.querySelector("summary").focus();
    }
});

let pageNavigationPending = false;
document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
        link.hasAttribute("download") || (link.target && link.target !== "_self")) return;

    const destination = new URL(link.href, window.location.href);
    const current = new URL(window.location.href);
    if (!["http:", "https:", "file:"].includes(destination.protocol) ||
        destination.origin !== current.origin ||
        (destination.pathname === current.pathname && destination.search === current.search)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    event.preventDefault();
    if (pageNavigationPending) return;
    pageNavigationPending = true;
    document.body.classList.add("page-leaving");
    window.setTimeout(() => window.location.assign(destination.href), 500);
});
window.addEventListener("pageshow", () => {
    pageNavigationPending = false;
    document.body.classList.remove("page-leaving");
});

const kineticPoster = document.querySelector(".kinetic-poster");
if (kineticPoster && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const kineticStateCount = 4;
    let kineticState = 0;

    window.setInterval(() => {
        document.body.classList.remove(`kinetic-state-${kineticState}`);
        kineticState = (kineticState + 1) % kineticStateCount;
        document.body.classList.add(`kinetic-state-${kineticState}`);
    }, 5600);
}

const subwayIndexBlock = document.querySelector(".subway-index-block");
const subwaySelected = document.querySelector(".subway-selected");
const subwayCaption = document.querySelector(".subway-caption-copy");
const subwayVideo = document.querySelector(".subway-video");
const subwayFigure = document.querySelector(".subway-figure");
const subwayMenuToggle = document.querySelector(".subway-menu-toggle");
const subwayMenu = document.querySelector("body.subway-home #menu");

if (subwayIndexBlock && subwaySelected && subwayCaption) {
    const alignSubwayIndex = () => {
        const captionTop = subwayCaption.getBoundingClientRect().top;
        subwayIndexBlock.style.top = `${captionTop - subwaySelected.offsetTop}px`;
    };

    alignSubwayIndex();
    window.addEventListener("resize", alignSubwayIndex);
    subwayVideo?.addEventListener("loadedmetadata", alignSubwayIndex);

    if (window.ResizeObserver) {
        new ResizeObserver(alignSubwayIndex).observe(subwayCaption);
    }
}

if (subwayFigure && subwayMenuToggle && subwayMenu) {
    const alignSubwayMenu = () => {
        document.body.style.setProperty("--subway-menu-left", `${subwayFigure.getBoundingClientRect().left}px`);
    };
    const closeSubwayMenu = () => {
        document.body.classList.remove("subway-menu-open");
        subwayMenuToggle.setAttribute("aria-expanded", "false");
    };

    alignSubwayMenu();
    window.addEventListener("resize", alignSubwayMenu);
    subwayVideo?.addEventListener("loadedmetadata", alignSubwayMenu);
    subwayMenuToggle.addEventListener("click", () => {
        document.body.classList.add("subway-menu-open");
        subwayMenuToggle.setAttribute("aria-expanded", "true");
    });
    document.querySelector(".subway-content")?.addEventListener("click", () => {
        if (document.body.classList.contains("subway-menu-open")) closeSubwayMenu();
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeSubwayMenu();
    });

    if (window.ResizeObserver) {
        new ResizeObserver(alignSubwayMenu).observe(subwayFigure);
    }
}

function showPreview(previewId) {
    previews.forEach((preview) => {
        preview.classList.toggle("active", preview.id === previewId);
    });

    previewImages?.classList.toggle("showing-default", previewId === defaultPreviewId);
}

function showDescription(description) {
    if (!descriptionText || !defaultDescription) return;

    descriptionText.innerHTML = description || defaultDescription;
}

showPreview(defaultPreviewId);
showDescription(defaultDescription);

workMenu?.addEventListener("mouseover", (event) => {
    const button = event.target.closest(".projbtn");

    if (!button) {
        return;
    }

    showPreview(button.dataset.preview);
    showDescription(button.dataset.description);
});

workMenu?.addEventListener("mouseout", (event) => {
    const leavingButton = event.target.closest(".projbtn");
    const enteringButton = event.relatedTarget?.closest(".projbtn");

    if (leavingButton && leavingButton !== enteringButton) {
        showPreview(defaultPreviewId);
        showDescription(defaultDescription);
    }
});

document.querySelectorAll(".insta-video").forEach((player) => {
    const video = player.querySelector(".instacontrols");
    const soundToggle = player.querySelector(".insta-sound-toggle");

    video.controls = false;
    video.muted = true;
    video.play().catch(() => {});

    soundToggle.addEventListener("click", () => {
        video.muted = !video.muted;
        soundToggle.textContent = video.muted ? "MUTED" : "SOUND";
        soundToggle.setAttribute("aria-label", video.muted ? "Turn sound on" : "Mute video");
    });
});

const archiveUsesTouchControls = window.matchMedia("(max-width: 768px), (pointer: coarse)").matches;
document.querySelectorAll(".archive-grid video").forEach((video) => {
    const endTrim = Number(video.dataset.endTrim) || 0;

    if (archiveUsesTouchControls) video.controls = true;

    if (endTrim > 0) {
        video.addEventListener("timeupdate", () => {
            if (Number.isFinite(video.duration) && video.currentTime >= video.duration - endTrim) {
                video.currentTime = 0;
                if (archiveUsesTouchControls ? !video.paused : video.matches(":hover")) video.play().catch(() => {});
                else video.pause();
            }
        });
    }

    if (!archiveUsesTouchControls) {
        video.addEventListener("mouseenter", () => video.play().catch(() => {}));
        video.addEventListener("mouseleave", () => video.pause());
    }
});

document.querySelectorAll(".archive-hover-slideshow").forEach((slideshow) => {
    const image = slideshow.querySelector("img");
    const prefix = slideshow.dataset.prefix;
    const count = Number(slideshow.dataset.count);
    const extension = slideshow.dataset.extension || "jpg";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let index = 1;
    let timer;
    const controls = document.createElement("div");
    const previous = document.createElement("button");
    const counter = document.createElement("span");
    const next = document.createElement("button");

    controls.className = "archive-mobile-controls";
    previous.type = "button";
    previous.className = "archive-mobile-prev";
    previous.setAttribute("aria-label", "Previous Sneaker Pimps page");
    previous.textContent = "<";
    counter.className = "archive-mobile-count";
    next.type = "button";
    next.className = "archive-mobile-next";
    next.setAttribute("aria-label", "Next Sneaker Pimps page");
    next.textContent = ">";
    controls.append(previous, counter, next);
    slideshow.closest(".archive-item")?.querySelector(".archive-caption")?.before(controls);

    for (let preloadIndex = 2; preloadIndex <= count; preloadIndex += 1) {
        const preload = new Image();
        preload.src = `${prefix}${preloadIndex}.${extension}`;
    }

    const show = (nextIndex) => {
        index = (nextIndex - 1 + count) % count + 1;
        image.src = `${prefix}${index}.${extension}`;
        image.alt = `Sneaker Pimps zine page ${index}`;
        counter.textContent = `${String(index).padStart(2, "0")} / ${String(count).padStart(2, "0")}`;
    };
    const advance = () => show(index + 1);
    const start = () => {
        if (timer || reducedMotion.matches || window.matchMedia("(max-width: 768px)").matches) return;
        timer = window.setInterval(advance, 700);
    };
    const stop = () => {
        window.clearInterval(timer);
        timer = undefined;
    };

    slideshow.addEventListener("pointerenter", start);
    slideshow.addEventListener("pointerleave", stop);
    slideshow.addEventListener("focus", start);
    slideshow.addEventListener("blur", stop);
    previous.addEventListener("click", () => show(index - 1));
    next.addEventListener("click", () => show(index + 1));
    show(index);
});

document.querySelectorAll(".archive-swap").forEach((swap) => {
    const controls = document.createElement("div");
    const previous = document.createElement("button");
    const counter = document.createElement("span");
    const next = document.createElement("button");
    let showingSecond = false;

    controls.className = "archive-mobile-controls";
    previous.type = "button";
    previous.className = "archive-mobile-prev";
    previous.setAttribute("aria-label", "Show previous image");
    previous.textContent = "<";
    counter.className = "archive-mobile-count";
    next.type = "button";
    next.className = "archive-mobile-next";
    next.setAttribute("aria-label", "Show next image");
    next.textContent = ">";
    controls.append(previous, counter, next);
    swap.closest(".archive-item")?.querySelector(".archive-caption")?.before(controls);

    const show = (second) => {
        showingSecond = second;
        swap.classList.toggle("archive-swap-show-second", showingSecond);
        counter.textContent = showingSecond ? "02 / 02" : "01 / 02";
    };

    previous.addEventListener("click", () => show(false));
    next.addEventListener("click", () => show(true));
    show(false);
});

const archiveGallery = document.querySelector(".archive-grid");
if (archiveGallery) {
    const archiveItems = [...archiveGallery.querySelectorAll(":scope > .archive-item")];
    const mediaFor = (item) => item.matches("img, video") ? item : item.querySelector("img, video");
    const mediaReady = archiveItems.map((item) => new Promise((resolve) => {
        const media = mediaFor(item);
        if (!media) return resolve();
        if (media.matches("img") && media.complete) return resolve();
        if (media.matches("video") && media.readyState >= 1) return resolve();
        media.addEventListener(media.matches("video") ? "loadedmetadata" : "load", resolve, { once: true });
        media.addEventListener("error", resolve, { once: true });
    }));

    const ratioFor = (item) => {
        const media = mediaFor(item);
        const width = media?.naturalWidth || media?.videoWidth || 1;
        const height = media?.naturalHeight || media?.videoHeight || 1;
        return width / height;
    };

    const featureTall = archiveItems.find((item) => item.classList.contains("archive-feature-tall"));
    const featureStack = archiveItems.filter((item) => item.classList.contains("archive-feature-stack"));

    let archiveLayoutFrame;
    const layoutArchive = () => {
        cancelAnimationFrame(archiveLayoutFrame);
        archiveLayoutFrame = requestAnimationFrame(() => {
            const galleryWidth = archiveGallery.clientWidth;
            if (!galleryWidth) return;

            const gap = window.innerWidth <= 1100 ? 20 : 25;
            const maxItems = window.innerWidth <= 700 ? 1 : 3;
            const targetHeight = galleryWidth >= 1000 ? 360 : 320;
            const fragment = document.createDocumentFragment();
            let pending = [];

            const useFeatureMosaic = window.innerWidth > 700 && featureTall && featureStack.length === 2;
            const layoutItems = useFeatureMosaic
                ? archiveItems.filter((item) => item !== featureTall && !featureStack.includes(item))
                : archiveItems;

            if (useFeatureMosaic) {
                const captionSpace = 24;
                const availableHeight = window.innerHeight - archiveGallery.getBoundingClientRect().top - 15;
                const tallCrop = Number(featureTall.dataset.sideCrop) || 0;
                const tallRatio = ratioFor(featureTall);
                const stackRatio = featureStack.reduce((sum, item) => sum + ratioFor(item), 0) / featureStack.length;
                const fittedHeight = (
                    galleryWidth + tallCrop - gap + captionSpace * tallRatio
                    + (gap / 2 + captionSpace) * stackRatio
                ) / (tallRatio + stackRatio / 2);
                const featureHeight = Math.min(availableHeight, fittedHeight);
                const stackMediaHeight = (featureHeight - gap) / 2 - captionSpace;
                const tallWidth = Math.max(180, (featureHeight - captionSpace) * tallRatio - tallCrop);
                const stackWidth = stackMediaHeight * stackRatio;
                const featureWidth = tallWidth + gap + stackWidth;
                const feature = document.createElement("div");

                feature.className = "archive-feature-mosaic";
                feature.style.setProperty("--archive-feature-height", `${featureHeight}px`);
                feature.style.setProperty("--archive-feature-left-width", `${tallWidth}px`);
                feature.style.setProperty("--archive-feature-right-width", `${stackWidth}px`);
                feature.style.setProperty("--archive-feature-width", `${featureWidth}px`);
                featureTall.style.setProperty("--archive-media-height", `${featureHeight - captionSpace}px`);
                featureStack.forEach((item) => {
                    item.style.setProperty("--archive-media-height", `${stackMediaHeight}px`);
                });
                feature.append(featureTall, ...featureStack);
                fragment.append(feature);
            }

            const addRow = (items, full = false) => {
                if (!items.length) return;
                const row = document.createElement("div");
                row.className = `archive-row${full ? " archive-row-full" : ""}`;
                const ratios = items.map(ratioFor);
                const crops = items.map((item) => Number(item.dataset.sideCrop) || 0);
                const rowGap = full ? 0 : gap * (items.length - 1);
                const height = (galleryWidth - rowGap + crops.reduce((sum, crop) => sum + crop, 0))
                    / ratios.reduce((sum, ratio) => sum + ratio, 0);

                items.forEach((item, index) => {
                    item.style.width = `${height * ratios[index] - crops[index]}px`;
                    item.style.height = "auto";
                    item.style.setProperty("--archive-media-height", `${height}px`);
                    row.append(item);
                });
                fragment.append(row);
            };

            const flush = () => {
                addRow(pending);
                pending = [];
            };

            layoutItems.forEach((item) => {
                if (item.classList.contains("archive-full")) {
                    flush();
                    addRow([item], true);
                    return;
                }

                pending.push(item);
                const ratios = pending.map(ratioFor);
                const crops = pending.map((pendingItem) => Number(pendingItem.dataset.sideCrop) || 0);
                const projectedHeight = (galleryWidth - gap * (pending.length - 1)
                    + crops.reduce((sum, crop) => sum + crop, 0))
                    / ratios.reduce((sum, ratio) => sum + ratio, 0);
                if (pending.length >= maxItems || (pending.length >= 2 && projectedHeight <= targetHeight)) flush();
            });
            flush();
            archiveGallery.replaceChildren(fragment);
        });
    };

    Promise.all(mediaReady).then(() => {
        layoutArchive();
        window.addEventListener("resize", layoutArchive);
    });

    archiveGallery.addEventListener("pointerover", (event) => {
        const item = event.target.closest(".archive-item[data-description]");
        if (!item || item.contains(event.relatedTarget)) return;
        if (descriptionText) descriptionText.innerHTML = item.dataset.description;
    });

    archiveGallery.addEventListener("pointerout", (event) => {
        const item = event.target.closest(".archive-item[data-description]");
        if (!item || item.contains(event.relatedTarget)) return;
        showDescription(defaultDescription);
    });
}

document.querySelectorAll(".dual-thesis-slideshow").forEach((group) => {
    const slideshows = [...group.querySelectorAll(".thesis-slideshow")].map((slideshow) => {
        const image = slideshow.querySelector("img");
        const counter = slideshow.querySelector(".thesis-slide-count");
        const total = Number(slideshow.dataset.count);
        const prefix = slideshow.dataset.prefix;
        const extension = slideshow.dataset.extension || "jpg";
        const label = slideshow.dataset.label;
        const pad = Number(slideshow.dataset.pad) || 0;
        let index = 1;

        const sourceFor = (imageIndex) => `${prefix}${String(imageIndex).padStart(pad, "0")}.${extension}`;

        const show = (nextIndex) => {
            index = (nextIndex - 1 + total) % total + 1;
            image.src = sourceFor(index);
            image.alt = `${label} page ${index}`;
            counter.textContent = `${String(index).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;

            const preloadIndex = index % total + 1;
            const preload = new Image();
            preload.src = sourceFor(preloadIndex);
        };

        slideshow.querySelector(".thesis-slide-prev").addEventListener("click", () => show(index - 1));
        slideshow.querySelector(".thesis-slide-next").addEventListener("click", () => show(index + 1));

        return { next: () => show(index + 1) };
    });

    group.querySelector(".thesis-slide-both")?.addEventListener("click", () => {
        slideshows.forEach((slideshow) => slideshow.next());
    });
    window.lucide?.createIcons();
});

document.querySelectorAll(".video-player").forEach((player) => {
    const video = player.querySelector("video");
    const controls = player.querySelector(".video-controls");
    const play = player.querySelector(".video-play");
    const mute = player.querySelector(".video-mute");
    const seek = player.querySelector(".video-seek");
    const fullscreen = player.querySelector(".video-fullscreen");
    const volume = player.querySelector(".video-volume");
    const previewTime = Number(video.dataset.previewTime);
    let showingPreviewFrame = Number.isFinite(previewTime) && previewTime > 0;
    const setIcon = (button, name) => {
        button.innerHTML = `<i data-lucide="${name}"></i>`;
        window.lucide?.createIcons();
    };
    window.lucide?.createIcons();

    video.controls = false;
    controls.hidden = false;
    const showPreviewFrame = () => {
        if (!showingPreviewFrame || !Number.isFinite(video.duration)) return;
        video.currentTime = Math.min(previewTime, Math.max(0, video.duration - 0.1));
    };
    if (video.readyState >= 1) showPreviewFrame();
    else video.addEventListener("loadedmetadata", showPreviewFrame, { once: true });

    play.addEventListener("click", () => {
        if (video.paused) {
            if (showingPreviewFrame) {
                video.currentTime = 0;
                showingPreviewFrame = false;
            }
            video.play().catch(() => {});
        }
        else video.pause();
    });
    const updatePlay = () => {
        setIcon(play, video.paused ? "play" : "pause");
        play.title = video.paused ? "Play" : "Pause";
        play.setAttribute("aria-label", play.title);
    };
    video.addEventListener("play", updatePlay);
    video.addEventListener("pause", updatePlay);
    video.addEventListener("timeupdate", () => {
        seek.value = showingPreviewFrame || !video.duration
            ? 0
            : video.currentTime / video.duration * 100;
    });
    seek.addEventListener("input", () => {
        if (Number.isFinite(video.duration)) {
            showingPreviewFrame = false;
            video.currentTime = seek.value / 100 * video.duration;
        }
    });
    mute.addEventListener("click", () => {
        if (video.volume === 0) video.volume = 1;
        video.muted = !video.muted;
    });
    volume.value = video.volume;
    volume.addEventListener("input", () => {
        video.volume = Number(volume.value);
        video.muted = video.volume === 0;
    });
    video.addEventListener("volumechange", () => {
        const silent = video.muted || video.volume === 0;
        setIcon(mute, silent ? "volume-x" : "volume-2");
        volume.value = video.muted ? 0 : video.volume;
        mute.title = silent ? "Unmute" : "Mute";
        mute.setAttribute("aria-label", mute.title);
    });
    fullscreen.addEventListener("click", async () => {
        try {
            if (document.fullscreenElement) await document.exitFullscreen();
            else if (player.requestFullscreen) await player.requestFullscreen();
            else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
        } catch (error) {
            console.warn("Fullscreen unavailable", error);
        }
    });
});
