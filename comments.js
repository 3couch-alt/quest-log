(function () {
  var SUPABASE_URL = 'https://elyyampkgidwwaiiexso.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_YXGT8AzCObG1bf0viv4wuw_IWLO7pEn';
  var REST_URL = SUPABASE_URL + '/rest/v1/blog_comments';

  var container = document.getElementById('comments-section');
  if (!container) return;
  var slug = container.getAttribute('data-slug');

  container.innerHTML =
    '<div class="log-header" style="margin-top:48px;">Comments</div>' +
    '<div id="commentList" class="comment-status">Loading comments…</div>' +
    '<form id="commentForm" class="comment-form">' +
      '<input type="text" id="commentName" class="search-input" placeholder="Name" maxlength="60" required style="margin-bottom:8px;">' +
      '<textarea id="commentBody" class="search-input" placeholder="Say something about this one…" maxlength="2000" rows="3" required style="resize:vertical; font-family: var(--font-body);"></textarea>' +
      '<button type="submit" class="tag-filter" style="margin-top:10px; cursor:pointer;">Post comment</button>' +
      '<span id="commentMsg" class="comment-status" style="display:inline-block; margin-left:10px;"></span>' +
    '</form>';

  var listEl = document.getElementById('commentList');
  var form = document.getElementById('commentForm');
  var msgEl = document.getElementById('commentMsg');

  function timeAgo(iso) {
    var diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
  }

  function escapeHtml(s) {
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function loadComments() {
    fetch(REST_URL + '?post_slug=eq.' + encodeURIComponent(slug) + '&order=created_at.desc', {
      headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY }
    })
      .then(function (res) { return res.json(); })
      .then(function (rows) {
        if (!rows || rows.length === 0) {
          listEl.textContent = 'No comments yet — be the first.';
          return;
        }
        listEl.innerHTML = rows.map(function (c) {
          return '<div class="comment-item">' +
            '<div class="comment-meta"><b>' + escapeHtml(c.name) + '</b> · ' + timeAgo(c.created_at) + '</div>' +
            '<div class="comment-body">' + escapeHtml(c.comment) + '</div>' +
          '</div>';
        }).join('');
      })
      .catch(function () { listEl.textContent = "Couldn't load comments right now."; });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('commentName').value.trim();
    var body = document.getElementById('commentBody').value.trim();
    if (!name || !body) return;

    msgEl.textContent = 'Posting…';
    fetch(REST_URL, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({ post_slug: slug, name: name, comment: body })
    })
      .then(function (res) {
        if (!res.ok) throw new Error('failed');
        form.reset();
        msgEl.textContent = 'Posted.';
        loadComments();
        setTimeout(function () { msgEl.textContent = ''; }, 2000);
      })
      .catch(function () { msgEl.textContent = "Couldn't post — try again."; });
  });

  loadComments();
})();
