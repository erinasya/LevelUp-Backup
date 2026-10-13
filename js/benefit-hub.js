document.addEventListener('DOMContentLoaded', () => {
    const s = LevelUpAuth.currentSession();
    const earned = LS.get('earnedAchievements', []).filter(
        a => a.userId === s.userId
    );
    const earnedIds = earned.map(a => a.achievementId);

    const benefits = [
        {
            id: 'guide-reading',
            title: 'Reading Reflection Guide',
            desc: 'A quick guide to writing a reading summary and reflection.',
            icon: '📘',
            category: 'learning',
            condition: 'Available as a learning resource.',
            available: true,
            action: 'Open Guide',
            href: 'growth-path.html?id=reading-path'
        },
        {
            id: 'creative-brief',
            title: 'Creative Practice Pack',
            desc: 'A set of practice briefs to develop your creative process.',
            icon: '🎨',
            category: 'creative',
            condition: 'Complete Creative Mind.',
            available: earnedIds.includes('creative-mind'),
            action: 'View Creative Path',
            href: 'growth-path.html?id=creative-path'
        },
        {
            id: 'critical-path',
            title: 'Critical Thinking Path',
            desc: 'Continue practicing reading and evaluating arguments.',
            icon: '🧠',
            category: 'learning',
            condition: 'Complete the Reading Reflection stage.',
            available: earnedIds.includes('book-explorer'),
            action: 'Open Path',
            href: 'growth-path.html?id=reading-path'
        },
        {
            id: 'focus-planner',
            title: 'Weekly Focus Planner',
            desc: 'A template for planning weekly study and review sessions.',
            icon: '🗓️',
            category: 'learning',
            condition: 'Available as a planning resource.',
            available: true,
            action: 'View Growth Plan',
            href: 'growth-plan.html'
        }
    ];

    let mode = 'all';

    const grid = document.getElementById('benefit-grid');

    function render() {
        const list = benefits.filter(
            b =>
                mode === 'all' ||
                (mode === 'available' ? b.available : !b.available)
        );

        grid.innerHTML = list
            .map(
                b => `<article class="card benefit-card ${b.available ? '' : 'locked'}"><div class="reward-symbol" style="font-size:32px">${b.icon}</div><span class="badge ${b.available ? 'green' : 'gray'}">${b.available ? 'Available' : 'Locked'}</span><h3>${b.title}</h3><p>${b.desc}</p><div class="benefit-condition">${b.available ? 'Available now.' : b.condition}</div><a class="btn ${b.available ? 'btn-primary' : 'btn-secondary'}" href="${b.available ? b.href : 'achievements.html'}">${b.available ? b.action : 'View Requirements ↗'}</a></article>`
            )
            .join('');
    }

    document.querySelectorAll('[data-benefit-filter]').forEach(b => {
        b.addEventListener('click', () => {
            mode = b.dataset.benefitFilter;

            document.querySelectorAll('[data-benefit-filter]').forEach(x => {
                x.classList.toggle('active', x === b);
            });

            render();
        });
    });

    render();
});