document.addEventListener('DOMContentLoaded', () => {
    const s = LevelUpAuth.currentSession();
    const listEl = document.getElementById('progress-list');
    const empty = document.getElementById('progress-empty');
    const search = document.getElementById('progress-search');
    const filter = document.getElementById('progress-filter');

    function render() {
        const user = s.userId;

        const ens = LevelUpData.getEnrollments().filter(
            e => e.userId === user
        );

        const subs = LevelUpData.getSubmissions().filter(
            x => x.userId === user
        );

        const completed = ens.filter(
            e => e.status === 'completed'
        ).length;

        document.getElementById('progress-active-count').textContent =
            ens.filter(e => e.status === 'in-progress').length;

        document.getElementById('progress-completed-count').textContent =
            completed +
            subs.filter(
                x =>
                    x.status === 'approved' &&
                    !ens.some(
                        e =>
                            e.challengeId === x.challengeId &&
                            e.status === 'completed'
                    )
            ).length;

        document.getElementById('progress-pending-count').textContent =
            subs.filter(
                x =>
                    x.status === 'pending' ||
                    x.status === 'needs-review'
            ).length;

        document.getElementById('progress-rejected-count').textContent =
            subs.filter(x => x.status === 'rejected').length;

        let items = [];

        ens.forEach(e => {
            const c = LevelUpData.challengeById(e.challengeId);

            if (c) {
                items.push({
                    type: 'enrollment',
                    e,
                    c,
                    status: e.status === 'completed'
                        ? 'approved'
                        : 'in-progress'
                });
            }
        });

        subs.forEach(sub => {
            const c = LevelUpData.challengeById(sub.challengeId);

            if (c) {
                const ix = items.findIndex(x => x.c.id === c.id);

                if (ix >= 0) {
                    if (
                        sub.status !== 'pending' &&
                        sub.status !== 'needs-review'
                    ) {
                        items[ix].status = sub.status;
                    }

                    items[ix].submission = sub;
                } else {
                    items.push({
                        type: 'submission',
                        e: null,
                        c,
                        status: sub.status,
                        submission: sub
                    });
                }
            }
        });

        const q = search.value.toLowerCase();

        items = items.filter(
            x => (x.c.title + ' ' + x.c.category).toLowerCase().includes(q)
        );

        if (filter.value !== 'all') {
            items = items.filter(x => x.status === filter.value);
        }

        listEl.innerHTML = items
            .map(x => {
                const pct = x.status === 'approved'
                    ? 100
                    : (x.e?.progress || 0);

                const action = x.status === 'in-progress'
                    ? `<a class="btn btn-primary btn-sm" href="challenge-session.html?id=${x.c.id}">Lanjutkan</a>`
                    : x.status === 'pending' || x.status === 'needs-review'
                        ? `<a class="btn btn-secondary btn-sm" href="submission-status.html?id=${x.submission?.id || ''}">Lihat Status</a>`
                        : x.status === 'rejected'
                            ? `<a class="btn btn-secondary btn-sm" href="proof-submission.html?id=${x.c.id}">Perbaiki</a>`
                            : `<a class="btn btn-secondary btn-sm" href="challenge-detail.html?id=${x.c.id}">Detail</a>`;

                return `<article class="progress-item"><div class="item-icon" style="background:${x.c.categoryKey === 'learning' ? '#F0E6F6' : x.c.categoryKey === 'creative' ? '#FFF0E6' : '#E7F2E7'}">${x.c.icon}</div><div><div class="between"><h3>${LevelUpUI.escapeHTML(x.c.title)}</h3>${LevelUpUI.statusBadge(x.status)}</div><p>${x.c.category} · ${x.c.duration}</p><div class="progress-meta" style="margin-top:8px"><span>Progress</span><strong>${pct}%</strong></div><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div></div><div class="item-end">${action}</div></article>`;
            })
            .join('');

        empty.classList.toggle('hidden', items.length > 0);

        if (!items.length) {
            empty.innerHTML = LevelUpUI.emptyState(
                'Belum ada hasil',
                'Coba ubah filter atau mulai challenge baru.',
                '<a href="challenges.html" class="btn btn-primary">Explore Challenges</a>'
            );
        }
    }

    search.addEventListener('input', render);
    filter.addEventListener('change', render);

    render();
});