document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('challenge-search');
    const difficultyFilter = document.getElementById('difficulty-filter');
    const durationFilter = document.getElementById('duration-filter');
    const sortFilter = document.getElementById('sort-filter');

    const categoryFilters = document.querySelectorAll(
        '#category-filters [data-category]'
    );

    const challengeCount = document.getElementById('challenge-count');
    const challengeGrid = document.getElementById('challenge-grid');
    const challengeEmpty = document.getElementById('challenge-empty');
    const pathGrid = document.getElementById('challenge-path-grid');

    let selectedCategory = 'all';

    function getDurationDays(challenge) {
        const days = Number(challenge.durationDays);

        if (Number.isFinite(days) && days > 0) {
            return days;
        }

        const match = String(challenge.duration || '').match(/\d+/);

        return match ? Number(match[0]) : 0;
    }

    function matchesDuration(challenge, duration) {
        const days = getDurationDays(challenge);

        if (duration === 'short') {
            return days >= 1 && days <= 3;
        }

        if (duration === 'medium') {
            return days >= 4 && days <= 7;
        }

        if (duration === 'long') {
            return days > 7;
        }

        return true;
    }

    function renderChallenges() {
        const allChallenges = LevelUpData.getChallenges().filter(
            challenge => challenge.status === 'active'
        );

        const query = searchInput.value.trim().toLowerCase();

        let filtered = allChallenges.filter(challenge => {
            const searchableText = [
                challenge.title,
                challenge.description,
                challenge.category,
                challenge.difficulty
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            const matchesSearch = searchableText.includes(query);

            const matchesDifficulty =
                difficultyFilter.value === 'all' ||
                challenge.difficulty === difficultyFilter.value;

            const matchesCategory =
                selectedCategory === 'all' ||
                challenge.categoryKey === selectedCategory;

            const matchesDurationFilter = matchesDuration(
                challenge,
                durationFilter.value
            );

            return (
                matchesSearch &&
                matchesDifficulty &&
                matchesCategory &&
                matchesDurationFilter
            );
        });

        if (sortFilter.value === 'duration') {
            filtered.sort(
                (a, b) => getDurationDays(a) - getDurationDays(b)
            );
        } else if (sortFilter.value === 'xp') {
            filtered.sort(
                (a, b) => Number(b.xp || 0) - Number(a.xp || 0)
            );
        } else {
            const originalOrder = new Map(
                allChallenges.map((challenge, index) => [
                    challenge.id,
                    index
                ])
            );

            filtered.sort((a, b) => {
                const featuredDifference =
                    Number(Boolean(b.featured)) -
                    Number(Boolean(a.featured));

                if (featuredDifference !== 0) {
                    return featuredDifference;
                }

                return originalOrder.get(a.id) - originalOrder.get(b.id);
            });
        }

        challengeCount.textContent =
            `Showing ${filtered.length} of ${allChallenges.length} challenges`;

        challengeGrid.innerHTML = filtered
            .map(challenge => LevelUpUI.challengeCard(challenge))
            .join('');

        challengeEmpty.classList.toggle(
            'hidden',
            filtered.length > 0
        );

        if (filtered.length === 0) {
            challengeEmpty.innerHTML = LevelUpUI.emptyState(
                'No challenges found',
                'Try changing your search or filters.',
                '<button type="button" class="btn btn-primary" id="reset-challenge-filters">Clear filters</button>'
            );
        } else {
            challengeEmpty.innerHTML = '';
        }
    }

    function renderGrowthPaths() {
        const paths = LevelUpData.getPaths().filter(
            path => path.status === 'active'
        );

        pathGrid.innerHTML = paths.map(path => {
            const stageCount = (path.challengeIds || []).length;

            const background = path.categoryKey === 'learning'
                ? '#F0E6F6'
                : path.categoryKey === 'creative'
                    ? '#FFF0E6'
                    : '#E7F2E7';

            return `
                <article class="card path-card">
                    <div
                        class="path-art"
                        style="background:${background}"
                    >
                        <img
                            src="${LevelUpUI.rootPrefix()}${LevelUpUI.escapeHTML(path.art || '')}"
                            alt=""
                            onerror="this.style.display='none'"
                        >
                    </div>

                    <div class="between">
                        <span class="badge">
                            ${LevelUpUI.escapeHTML(path.category || '')}
                        </span>

                        <span class="small muted">
                            ${stageCount} stages
                        </span>
                    </div>

                    <h3>${LevelUpUI.escapeHTML(path.title || '')}</h3>

                    <p class="small">
                        ${LevelUpUI.escapeHTML(path.description || '')}
                    </p>

                    <a
                        class="btn btn-secondary"
                        href="growth-path.html?id=${encodeURIComponent(path.id)}"
                    >
                        View Journey ↗
                    </a>
                </article>
            `;
        }).join('');
    }

    function resetFilters() {
        searchInput.value = '';
        difficultyFilter.value = 'all';
        durationFilter.value = 'all';
        sortFilter.value = 'recommended';

        selectedCategory = 'all';

        categoryFilters.forEach(button => {
            const isActive = button.dataset.category === 'all';

            button.classList.toggle('active', isActive);
            button.setAttribute(
                'aria-pressed',
                isActive ? 'true' : 'false'
            );
        });

        renderChallenges();
    }

    searchInput.addEventListener('input', renderChallenges);
    difficultyFilter.addEventListener('change', renderChallenges);
    durationFilter.addEventListener('change', renderChallenges);
    sortFilter.addEventListener('change', renderChallenges);

    categoryFilters.forEach(button => {
        button.addEventListener('click', () => {
            selectedCategory = button.dataset.category;

            categoryFilters.forEach(categoryButton => {
                const isActive =
                    categoryButton === button;

                categoryButton.classList.toggle(
                    'active',
                    isActive
                );

                categoryButton.setAttribute(
                    'aria-pressed',
                    isActive ? 'true' : 'false'
                );
            });

            renderChallenges();
        });
    });

    challengeEmpty.addEventListener('click', event => {
        if (event.target.closest('#reset-challenge-filters')) {
            resetFilters();
        }
    });

    renderChallenges();
    renderGrowthPaths();
});