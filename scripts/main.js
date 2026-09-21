const hero = document.querySelector('[data-hero]');
const siteHeader = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const aboutItem = document.querySelector('.nav-item--dropdown');
const aboutToggle = aboutItem?.querySelector('.nav-link--menu');

const updateHeaderState = () => {
	siteHeader?.classList.toggle('is-scrolled', window.scrollY > 24);
};

updateHeaderState();
window.addEventListener('scroll', updateHeaderState, { passive: true });
window.addEventListener('pageshow', updateHeaderState);
window.requestAnimationFrame(updateHeaderState);

const closeAboutMenu = () => {
	aboutItem?.classList.remove('is-open');
	aboutToggle?.setAttribute('aria-expanded', 'false');
	if (document.activeElement === aboutToggle) {
		aboutToggle.blur();
	}
};

const updateAboutRegion = (event) => {
	if (!aboutItem || !aboutToggle) {
		return;
	}

	// skip the layout read entirely unless the pointer is actually near the nav or the menu is open
	if (event.clientY > 260 && !aboutItem.classList.contains('is-open')) {
		return;
	}

	const itemBounds = aboutItem.getBoundingClientRect();
	const dropdownBounds = aboutItem.querySelector('.nav-dropdown')?.getBoundingClientRect();

	if (!dropdownBounds) {
		return;
	}

	const left = Math.min(itemBounds.left, dropdownBounds.left);
	const right = Math.max(itemBounds.right, dropdownBounds.right);
	const top = Math.min(itemBounds.top, dropdownBounds.top);
	const bottom = Math.max(itemBounds.bottom, dropdownBounds.bottom);
	const isInside = event.clientX >= left && event.clientX <= right && event.clientY >= top && event.clientY <= bottom;

	if (isInside) {
		aboutItem.classList.add('is-open');
		aboutToggle.setAttribute('aria-expanded', 'true');
		return;
	}

	closeAboutMenu();
};

navToggle?.addEventListener('click', () => {
	const isOpen = siteHeader?.classList.toggle('nav-open') ?? false;
	navToggle.setAttribute('aria-expanded', String(isOpen));
});

siteNav?.addEventListener('pointerenter', () => siteHeader?.classList.add('nav-is-hovered'));
siteNav?.addEventListener('mouseleave', () => {
	siteHeader?.classList.remove('nav-is-hovered');
});
siteNav?.addEventListener('focusin', () => siteHeader?.classList.add('nav-is-hovered'));
siteNav?.addEventListener('focusout', (event) => {
	if (!siteNav.contains(event.relatedTarget)) {
		siteHeader?.classList.remove('nav-is-hovered');
	}
});

aboutItem?.addEventListener('focusin', () => {
	aboutItem.classList.add('is-open');
	aboutToggle?.setAttribute('aria-expanded', 'true');
});

aboutItem?.addEventListener('focusout', (event) => {
	if (!aboutItem.contains(event.relatedTarget)) {
		closeAboutMenu();
	}
});

document.addEventListener('pointermove', updateAboutRegion);

document.querySelectorAll('.site-nav a').forEach((link) => {
	link.addEventListener('click', () => {
		siteHeader?.classList.remove('nav-open');
		navToggle?.setAttribute('aria-expanded', 'false');
		closeAboutMenu();
	});
});

if (!document.body.classList.contains('solution-detail-page')) {
	document.querySelectorAll('a[href^="#"]').forEach((link) => {
		link.addEventListener('click', (event) => {
			const target = document.getElementById(link.getAttribute('href').slice(1));

			if (!target) {
				return;
			}

			event.preventDefault();
			const solutionsOwner = target.closest('[data-solutions]');
			const previousTransition = solutionsOwner?.style.transition;
			if (solutionsOwner) {
				solutionsOwner.style.transition = 'none';
				solutionsOwner.classList.add('is-visible');
				solutionsOwner.querySelectorAll('.solution-domain').forEach((scene) => scene.classList.add('is-visible'));
				solutionsOwner.offsetWidth;
			}

			const headerHeight = siteHeader?.getBoundingClientRect().height || 0;
			const documentTop = target.id === 'solutions-feed'
				? target.getBoundingClientRect().top + window.scrollY
				: target.offsetTop;
			const targetTop = documentTop - headerHeight - 12;
			window.history.replaceState(null, '', link.getAttribute('href'));
			window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
			if (solutionsOwner) {
				solutionsOwner.style.transition = previousTransition;
			}
		});
	});
}

document.addEventListener('click', (event) => {
	if (aboutItem && !aboutItem.contains(event.target)) {
		closeAboutMenu();
	}
});

document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape') {
		closeAboutMenu();
	}
});

if (hero) {
	const scenes = [...hero.querySelectorAll('[data-scene]')];
	const copies = [...hero.querySelectorAll('[data-copy]')];
	const steps = [...hero.querySelectorAll('[data-scene-step]')];
	const scene4 = scenes[3];
	const scene4Video = scene4?.querySelector('.hero-scene__video');
	const progress = hero.querySelector('.hero-progress');
	const nextButton = hero.querySelector('.hero-next');
	const currentLabel = hero.querySelector('.hero-status__label');
	const sceneDuration = 4000;
	const scene4PlaybackRate = 1.25;
	const copyExitDuration = 720;
	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	let activeIndex = 0;
	let timer;
	let transitionId = 0;
	let scene4VideoReady = false;
	let scene4VideoFailed = false;

	const getSceneDuration = (index = activeIndex) => {
		if (index === 3 && scene4VideoReady && !scene4VideoFailed && Number.isFinite(scene4Video?.duration)) {
			return Math.max(1000, (scene4Video.duration / scene4PlaybackRate) * 1000);
		}

		return sceneDuration;
	};

	const scheduleSequence = () => {
		window.clearTimeout(timer);
		timer = window.setTimeout(() => updateScene((activeIndex + 1) % scenes.length), getSceneDuration());
	};

	const resetProgress = () => {
		const duration = getSceneDuration();
		progress?.style.setProperty('--scene-duration', `${duration}ms`);
		progress?.classList.remove('is-running');
		window.requestAnimationFrame(() => progress?.classList.add('is-running'));
	};

	const loadScene4Video = () => {
		if (!scene4Video || reducedMotion || scene4Video.dataset.loaded === 'true') {
			return;
		}

		scene4Video.dataset.loaded = 'true';
		scene4Video.addEventListener('loadedmetadata', () => {
			if (activeIndex === 3) {
				resetProgress();
				scheduleSequence();
			}
		}, { once: true });
		scene4Video.addEventListener('canplay', () => {
			scene4VideoReady = true;
			if (activeIndex === 3) {
				startScene4Video();
			}
		}, { once: true });
		scene4Video.addEventListener('error', () => {
			scene4VideoFailed = true;
			scene4?.classList.remove('has-video');
			if (activeIndex === 3) {
				resetProgress();
				scheduleSequence();
			}
		}, { once: true });
		scene4Video.load();
	};

	const startScene4Video = () => {
		if (!scene4VideoReady || scene4VideoFailed || reducedMotion || activeIndex !== 3) {
			return;
		}

		scene4Video.playbackRate = scene4PlaybackRate;
		scene4Video.currentTime = 0;
		scene4Video.play().then(() => {
			scene4?.classList.add('has-video');
			resetProgress();
			scheduleSequence();
		}).catch(() => {
			scene4VideoFailed = true;
			scene4?.classList.remove('has-video');
			resetProgress();
			scheduleSequence();
		});
	};

	const stopScene4Video = () => {
		if (scene4Video) {
			scene4Video.pause();
			scene4Video.currentTime = 0;
		}
		scene4?.classList.remove('has-video');
	};

	const preloadScene = (index) => {
		if (index === 3) {
			loadScene4Video();
			return;
		}

		const image = scenes[index]?.querySelector('img');

		if (image) {
			const preload = new Image();
			preload.decoding = 'async';
			preload.src = image.src;
		}
	};

	const updateScene = (nextIndex) => {
		if (nextIndex === activeIndex) {
			resetProgress();
			return;
		}

		const currentTransitionId = ++transitionId;
		if (activeIndex === 3) {
			stopScene4Video();
		}
		if (nextIndex === 3) {
			loadScene4Video();
		}
		scenes[activeIndex]?.classList.remove('is-active');
		scenes[activeIndex]?.setAttribute('aria-hidden', 'true');
		copies[activeIndex]?.classList.remove('is-active');
		copies[activeIndex]?.setAttribute('aria-hidden', 'true');

		window.setTimeout(() => {
			if (currentTransitionId !== transitionId) {
				return;
			}

			activeIndex = nextIndex;
			scenes[activeIndex]?.classList.add('is-active');
			scenes[activeIndex]?.setAttribute('aria-hidden', 'false');
			copies[activeIndex]?.classList.add('is-active');
			copies[activeIndex]?.setAttribute('aria-hidden', 'false');
			if (activeIndex === 3) {
				startScene4Video();
			} else {
				resetProgress();
				scheduleSequence();
			}
			steps.forEach((step, index) => {
				const isActive = index === activeIndex;
				step.classList.toggle('is-active', isActive);
				step.setAttribute('aria-pressed', String(isActive));
			});

			if (currentLabel) {
				currentLabel.textContent = String(activeIndex + 1).padStart(2, '0');
			}

			preloadScene((activeIndex + 1) % scenes.length);
		}, reducedMotion ? 0 : copyExitDuration);
	};

	const selectScene = (nextIndex) => {
		window.clearTimeout(timer);
		updateScene(nextIndex);
	};

	steps.forEach((step) => {
		step.addEventListener('click', () => selectScene(Number(step.dataset.sceneStep)));
	});

	nextButton?.addEventListener('click', () => selectScene((activeIndex + 1) % scenes.length));

	const startSequence = () => {
		resetProgress();
		preloadScene(1);
		scheduleSequence();
	};

	startSequence();
	window.addEventListener('pagehide', () => {
		window.clearTimeout(timer);
		stopScene4Video();
	}, { once: true });
}

const solutionsSection = document.querySelector('[data-solutions]');
const solutionSlugs = ['electric-drive-systems', 'energy-systems', 'intelligent-control', 'advanced-materials', 'multi-physics', 'integrated-engineering'];

const openSolutionDetail = (control) => {
	const scene = control.closest('.solution-domain');
	const sceneIndex = [...(solutionsSection?.querySelectorAll('.solution-domain') || [])].indexOf(scene);
	const slug = solutionSlugs[sceneIndex];

	if (slug) {
		window.location.href = `solution.html?solution=${slug}`;
	}
};

if (solutionsSection && 'IntersectionObserver' in window) {
	const revealSolutions = new IntersectionObserver((entries, observer) => {
		if (entries.some((entry) => entry.isIntersecting)) {
			solutionsSection.classList.add('is-visible');
			observer.disconnect();
		}
	}, { threshold: 0.14 });

	revealSolutions.observe(solutionsSection);

	const solutionScenes = [...solutionsSection.querySelectorAll('.solution-domain')];
	const revealScene = new IntersectionObserver((entries, observer) => {
		entries.forEach((entry) => {
			if (!entry.isIntersecting) {
				return;
			}

			entry.target.classList.add('is-visible');
			observer.unobserve(entry.target);
		});
	}, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

	solutionScenes.forEach((scene, index) => {
		scene.style.transitionDelay = `${Math.min(index * 80, 400)}ms`;
		revealScene.observe(scene);
	});

	solutionsSection.querySelectorAll('.solution-domain__explore').forEach((button) => button.addEventListener('click', () => openSolutionDetail(button)));
} else {
	solutionsSection?.classList.add('is-visible');
	solutionsSection?.querySelectorAll('.solution-domain').forEach((scene) => scene.classList.add('is-visible'));
	solutionsSection?.querySelectorAll('.solution-domain__explore').forEach((button) => button.addEventListener('click', () => openSolutionDetail(button)));
}
