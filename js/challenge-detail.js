document.addEventListener('DOMContentLoaded', () => {
    const id = new URLSearchParams(location.search).get('id') || 'reading-01';
    const c = LevelUpData.challengeById(id) || LevelUpData.getChallenges()[0];
    const user = LevelUpProgression.currentUser();
    const enroll = LevelUpData.enrollmentFor(user?.id, c.id);

    const approved = LevelUpData.getSubmissions().some(
        s =>
            s.userId === user?.id &&
            s.challengeId === c.id &&
            s.status === 'approved'
    );

    const isDone = enroll?.status === 'completed' || approved;

    let locked = false;

    if (c.prerequisite) {
        locked =
            !LevelUpData.getEnrollments().some(
                e =>
                    e.userId === user?.id &&
                    e.challengeId === c.prerequisite &&
                    e.status === 'completed'
            ) &&
            !LevelUpData.getSubmissions().some(
                s =>
                    s.userId === user?.id &&
                    s.challengeId === c.prerequisite &&
                    s.status === 'approved'
            );
    }

    document.getElementById('challenge-detail-root').innerHTML = `<section class="challenge-detail-hero card"><div><div class="quick-stats"><span class="badge ${c.categoryKey === 'learning' ? 'lavender' : c.categoryKey === 'creative' ? 'peach' : 'green'}">${c.category}</span>${LevelUpUI.statusBadge(isDone ? 'completed' : locked ? 'locked' : enroll ? 'in-progress' : 'active')}</div><h1 style="margin-top:15px">${LevelUpUI.escapeHTML(c.title)}</h1><p>${LevelUpUI.escapeHTML(c.description)}</p><div class="quick-stats"><span class="badge">◷ ${c.duration}</span><span class="badge">${c.difficulty}</span><span class="badge yellow">✦ ${c.xp} XP</span></div><button class="btn ${isDone ? 'btn-secondary' : 'btn-primary'}" id="join-challenge-btn" style="margin-top:16px" ${locked || isDone ? 'disabled' : ''}>${isDone ? 'Challenge Completed' : locked ? '🔒 Prerequisite Not Met' : enroll ? 'Continue Challenge' : 'Join Challenge'} ↗</button></div><img src="${c.art}" alt=""></section>`;

    document.getElementById('detail-about').innerHTML =
        `<p>${LevelUpUI.escapeHTML(c.objective || c.description)}</p><p>${LevelUpUI.escapeHTML(c.description)}</p>`;

    document.getElementById('detail-tasks').innerHTML = c.tasks
        .map(
            t =>
                `<div class="criteria-row"><span class="check">✓</span><span>${LevelUpUI.escapeHTML(t)}</span></div>`
        )
        .join('');

    document.getElementById('detail-criteria').innerHTML =
        `<p>${LevelUpUI.escapeHTML(c.criteria)}</p>`;

    document.getElementById('detail-proof').innerHTML =
        `<span class="badge lavender">${LevelUpUI.escapeHTML(c.proofType)}</span><p class="small" style="margin-top:10px">Verification: ${LevelUpUI.escapeHTML(c.verification)}. Proof is checked against challenge criteria; uploading a file alone is not automatic proof that the activity was completed.</p>`;

    document.getElementById('detail-reward').innerHTML =
        `<div class="row"><div class="icon-tile">✦</div><div><strong>${c.xp} XP</strong><p class="small">XP is awarded according to the demo rules after a valid decision.</p></div></div>${c.prerequisite ? `<div class="notice warning" style="margin-top:12px">Prerequisite: ${LevelUpData.challengeById(c.prerequisite)?.title || c.prerequisite}</div>` : '<div class="notice success" style="margin-top:12px">No prerequisite required.</div>'}`;

    const link = document.getElementById('detail-bottom-cta');

    link.href = `challenge-session.html?id=${c.id}`;
    link.textContent = enroll ? 'Continue Session ↗' : 'Start Session ↗';
    link.classList.toggle('hidden', locked || isDone);

    document.getElementById('join-challenge-btn')?.addEventListener('click', () => {
        const e = LevelUpProgression.createEnrollment(c.id);

        if (e) {
            LevelUpUI.toast('Successfully joined the challenge.');
            location.href = `challenge-session.html?id=${c.id}`;
        }
    });

    if (isDone) {
        link.textContent = 'View Progress ↗';
        link.href = 'progress.html';
        link.classList.remove('hidden');
    }
});