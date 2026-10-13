document.addEventListener('DOMContentLoaded', () => {
    const user = LevelUpAuth.currentSession().userId;
    const specific = new URLSearchParams(location.search).get('id');

    let list = LevelUpData.getSubmissions().filter(
        s => s.userId === user
    );

    if (specific) {
        list = list.filter(s => s.id === specific);
    }

    const root = document.getElementById('submission-status-list');
    const empty = document.getElementById('submission-status-empty');

    if (!list.length) {
        empty.classList.remove('hidden');

        empty.innerHTML = LevelUpUI.emptyState(
            'No submissions yet',
            'Submit proof after meeting the challenge criteria.',
            '<a class="btn btn-primary" href="progress.html">My Progress</a>'
        );

        return;
    }

    root.innerHTML = list
        .map(s => {
            const c = LevelUpData.challengeById(s.challengeId);

            const statusText = {
                pending: [
                    'Awaiting review',
                    'Your submission has been saved. It is still waiting for review.',
                    '◷',
                    'warning'
                ],
                'needs-review': [
                    'Needs review',
                    'This submission needs additional review. This is not a final rule violation decision.',
                    '⌕',
                    'warning'
                ],
                approved: [
                    'Submission approved',
                    'The submission criteria have been met. Check your achievement or next step.',
                    '✓',
                    'success'
                ],
                rejected: [
                    'Submission needs revision',
                    s.reviewReason || 'Review the challenge criteria again before resubmitting.',
                    '↻',
                    'error'
                ]
            }[s.status] || [
                'Status unknown',
                '',
                '•',
                ''
            ];

            return `<article class="card"><div class="submission-status-hero ${statusText[3] === 'success' ? '' : statusText[3] === 'error' ? '' : ''}"><div class="submission-status-icon">${statusText[2]}</div><div style="flex:1"><div class="between"><h2>${c?.title || 'Challenge'}</h2>${LevelUpUI.statusBadge(s.status)}</div><p>${statusText[0]} · Submitted ${LevelUpUI.formatDate(s.submittedAt)}</p><p class="small mb-0">${statusText[1]}</p></div></div><div class="grid grid-2 section"><div><span class="eyebrow">SUBMITTED FILE</span><p>${LevelUpUI.escapeHTML(s.filename || 'No file attached')}</p><span class="eyebrow">REFLECTION</span><p>${LevelUpUI.escapeHTML(s.reflection || '—')}</p></div><div><span class="eyebrow">REVIEW FEEDBACK</span><p>${LevelUpUI.escapeHTML(s.reviewReason || 'No review notes yet.')}</p>${s.status === 'approved' ? `<a href="achievements.html" class="btn btn-primary">View Achievement ↗</a>` : ''}${s.status === 'rejected' ? `<a href="proof-submission.html?id=${s.challengeId}" class="btn btn-secondary">Revise Submission ↗</a>` : ''}</div></div></article>`;
        })
        .join('');
});