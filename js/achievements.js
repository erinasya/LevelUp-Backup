document.addEventListener('DOMContentLoaded', () => {
    const s = LevelUpAuth.currentSession();
    const earned = LS.get('earnedAchievements', []).filter(
        a => a.userId === s.userId
    );
    const catalog = LevelUpData.getAchievements();
    let mode = 'all';

    const grid = document.getElementById('achievement-grid');
    const earnedIds = earned.map(x => x.achievementId);

    document.getElementById('achievement-count').textContent =
        `${earned.length} earned`;

    const xp = LevelUpData.getXP();

    document.getElementById('achievement-xp').textContent = xp + ' XP';

    const level = Math.floor(xp / 250) + 1;

    document.getElementById('achievement-level').textContent =
        `Level ${level}`;

    document.getElementById('achievement-xp-bar').style.width =
        (xp % 250 / 250 * 100) + '%';

    function render() {
        const list = catalog.filter(
            a =>
                mode === 'all' ||
                (mode === 'earned'
                    ? earnedIds.includes(a.id)
                    : !earnedIds.includes(a.id))
        );

        grid.innerHTML = list
            .map(a => {
                const own = earned.find(e => e.achievementId === a.id);

                return `<article class="card achievement-card ${own ? '' : 'locked'}"><div class="achievement-art"><img src="${a.art}" alt="" onerror="this.style.display='none'"><span>${a.icon}</span></div><h3>${a.title}</h3><p>${a.description}</p>${own ? `<span class="badge green">Earned ${LevelUpUI.formatDate(own.earnedAt)}</span>` : `<span class="badge gray">Locked</span>`}<details style="width:100%;text-align:left;margin-top:8px"><summary class="link">${own ? 'Achievement details' : 'How to unlock'}</summary><p style="margin-top:9px">${a.criteria}</p>${a.unlock ? `<p class="small">Unlocks: ${LevelUpData.challengeById(a.unlock)?.title || 'advanced challenge'}</p>` : ''}</details></article>`;
            })
            .join('');
    }

    document.querySelectorAll('[data-achievement-filter]').forEach(b => {
        b.addEventListener('click', () => {
            mode = b.dataset.achievementFilter;

            document.querySelectorAll('[data-achievement-filter]').forEach(x => {
                x.classList.toggle('active', x === b);
            });

            render();
        });
    });

    const unlocks = catalog
        .filter(a => earnedIds.includes(a.id) && a.unlock)
        .map(a => LevelUpData.challengeById(a.unlock))
        .filter(Boolean);

    document.getElementById('achievement-unlocks').innerHTML =
        unlocks.length
            ? unlocks.map(LevelUpUI.challengeCard).join('')
            : LevelUpUI.emptyState(
                'The next step is waiting',
                'Complete the right milestone to unlock the next challenge.',
                '<a class="btn btn-primary" href="challenges.html">Explore Challenges</a>'
            );

    render();
});