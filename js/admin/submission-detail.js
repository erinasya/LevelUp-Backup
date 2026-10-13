
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(location.search),
        all = LevelUpData.getSubmissions();

    let sub = all.find(s => s.id === params.get('id'));

    if (!sub) {
        sub = all.find(s => s.status === 'pending' || s.status === 'needs-review') || all[0];
    }

    if (!sub) {
        document.getElementById('admin-review-notice').innerHTML = LevelUpUI.emptyState(
            'No submissions found',
            'Submissions will appear here after users submit proof.',
            '<a href="submissions.html" class="btn btn-secondary">Back to Queue</a>'
        );

        document.getElementById('admin-review-form').classList.add('hidden');
        return;
    }

    const c = LevelUpData.challengeById(sub.challengeId),
        u = LevelUpData.getUsers().find(x => x.id === sub.userId);

    document.getElementById('review-challenge-title').textContent = c?.title || 'Challenge';

    document.getElementById('review-user-meta').textContent =
        `${u?.name || 'User'} · ${u?.email || ''} · ${LevelUpUI.formatDate(sub.submittedAt)}`;

    document.getElementById('review-status-badge').outerHTML =
        LevelUpUI.statusBadge(sub.status);

    document.getElementById('review-proof-preview').textContent =
        sub.filename ? '📎 ' + sub.filename : '📝 Reflection / notes';

    document.getElementById('review-proof-meta').textContent =
        `Proof type: ${c?.proofType || '—'} · Verification: ${c?.verification || '—'}`;

    document.getElementById('review-reflection').textContent =
        sub.reflection || 'No reflection provided';

    document.getElementById('review-extra').textContent = sub.extra || '—';

    document.getElementById('review-criteria').innerHTML = `
        <div class="criteria-row">
            <span class="check">✓</span>
            <span>${LevelUpUI.escapeHTML(c?.criteria || 'No criteria provided')}</span>
        </div>
        ${(c?.tasks || []).map(t => `
            <div class="criteria-row">
                <span class="check">✓</span>
                <span>${LevelUpUI.escapeHTML(t)}</span>
            </div>
        `).join('')}
    `;

    document.getElementById('review-method').innerHTML = `
        <span class="badge lavender">${LevelUpUI.escapeHTML(c?.verification || 'Not set')}</span>
        <p class="small" style="margin-top:9px">
            Review proof against the criteria. Automated indicators are not a final violation decision.
        </p>
    `;

    document.getElementById('review-reason').value = sub.reviewReason || '';

    document.getElementById('review-detail-history').innerHTML =
        LevelUpData.getReviewHistory()
            .filter(h => h.submissionId === sub.id)
            .map(h => `
                <div class="activity-row">
                    <div class="activity-icon">${h.decision === 'approved' ? '✓' : '↻'}</div>
                    <div>
                        <strong>${h.decision}</strong>
                        <p>${LevelUpUI.escapeHTML(h.reason)}</p>
                        <p>${LevelUpUI.formatDate(h.at)}</p>
                    </div>
                </div>
            `)
            .join('') || '<p class="small muted">No previous decisions.</p>';

    if (sub.status === 'approved' || sub.status === 'rejected') {
        document.getElementById('admin-review-form').innerHTML = `
            <span class="eyebrow">FINAL DECISION</span>
            <h2>Decision already recorded</h2>
            <p>This submission already has a final decision. For corrections, follow the product's appeal or resubmission process.</p>
            <div class="notice">${LevelUpUI.escapeHTML(sub.reviewReason || 'No additional notes.')}</div>
            <a href="submissions.html" class="btn btn-secondary" style="margin-top:14px">Back to Queue</a>
        `;
    } else {
        document.getElementById('admin-review-form').addEventListener('submit', e => {
            e.preventDefault();

            const decision = document.getElementById('review-decision').value,
                reason = document.getElementById('review-reason').value.trim();

            if (decision === 'rejected' && !reason) {
                LevelUpUI.toast('A reason is required when rejecting a submission.', 'error');
                return;
            }

            if (
                ['approved', 'rejected'].includes(sub.status) &&
                !confirm('This submission already has a decision. Save the change?')
            ) {
                return;
            }

            if (decision === 'approved') {
                if (!LevelUpProgression.approveSubmission(sub.id)) {
                    LevelUpUI.toast('The decision could not be saved.', 'error');
                    return;
                }
            } else {
                if (!LevelUpProgression.rejectSubmission(sub.id, reason)) {
                    LevelUpUI.toast('The decision could not be saved.', 'error');
                    return;
                }
            }

            LevelUpUI.toast('Decision saved.');

            setTimeout(() => location.href = 'submissions.html', 500);
        });
    }
});
