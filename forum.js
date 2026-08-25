(function () {
  var SUPABASE_URL = 'https://elyyampkgidwwaiiexso.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_YXGT8AzCObG1bf0viv4wuw_IWLO7pEn';
  var THREADS_URL = SUPABASE_URL + '/rest/v1/forum_threads';
  var REPLIES_URL = SUPABASE_URL + '/rest/v1/blog_comments';

  var root = document.getElementById('forumRoot');
  if (!root) return;

  var headers = { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY };
  var writeHeaders = {
    apikey: SUPABASE_KEY,
    Authorization: 'Bearer ' + SUPABASE_KEY,
    'Content-Type': 'application/json',
    Prefer: 'return=minimal'
  };

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : s;
    return d.innerHTML;
  }

  function timeAgo(iso) {
    var diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
  }

  function threadId() {
    var m = window.location.search.match(/[?&]t=([0-9a-f-]{36})/i);
    return m ? m[1] : null;
  }

  function fail(msg) {
    root.innerHTML =
      '<div class="post-head"><h1>Forum</h1></div>' +
      '<div class="post-body"><p class="comment-status">' + esc(msg) + '</p></div>';
  }

  /* ---------- thread list ---------- */

  function renderList(threads, counts) {
    var items = threads.length
      ? threads.map(function (t) {
          var n = counts[t.id] || 0;
          return '<a class="quest" href="forum.html?t=' + encodeURIComponent(t.id) + '">' +
            '<div class="quest-meta">' +
              '<span>' + esc(t.author) + '</span><span>·</span>' +
              '<span>' + timeAgo(t.created_at) + '</span><span>·</span>' +
              '<span>' + n + (n === 1 ? ' reply' : ' replies') + '</span>' +
            '</div>' +
            '<h3>' + esc(t.title) + '</h3>' +
          '</a>';
        }).join('')
      : '<p class="comment-status">No threads yet — start the first one.</p>';

    root.innerHTML =
      '<div class="post-head">' +
        '<h1>Forum</h1>' +
        '<p style="color: var(--muted); font-size: 15px; margin-top: -14px;">Talk about whatever you are listening to. Recommendations, arguments, questions — all fair game. No account needed, just pick a name.</p>' +
      '</div>' +
      '<div class="post-body">' +
        '<div class="log-header">Threads</div>' +
        '<div id="threadList">' + items + '</div>' +
        '<div class="log-header" style="margin-top:40px;">Start a thread</div>' +
        '<form id="threadForm" class="comment-form">' +
          '<input type="text" id="tName" class="search-input" placeholder="Your name" maxlength="60" required style="margin-bottom:8px;">' +
          '<input type="text" id="tTitle" class="search-input" placeholder="Thread title" maxlength="140" required style="margin-bottom:8px;">' +
          '<textarea id="tBody" class="search-input" placeholder="Say something…" maxlength="4000" rows="4" required style="resize:vertical; font-family: var(--font-body);"></textarea>' +
          '<button type="submit" class="tag-filter" style="margin-top:10px; cursor:pointer;">Post thread</button>' +
          '<span id="tMsg" class="comment-status" style="display:inline-block; margin-left:10px;"></span>' +
        '</form>' +
      '</div>';

    document.getElementById('threadForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = document.getElementById('tMsg');
      var payload = {
        author: document.getElementById('tName').value.trim(),
        title: document.getElementById('tTitle').value.trim(),
        body: document.getElementById('tBody').value.trim()
      };
      if (!payload.author || !payload.title || !payload.body) return;

      msg.textContent = 'Posting…';
      fetch(THREADS_URL, { method: 'POST', headers: writeHeaders, body: JSON.stringify(payload) })
        .then(function (r) {
          if (!r.ok) throw new Error();
          msg.textContent = 'Posted.';
          loadList();
        })
        .catch(function () { msg.textContent = "Couldn't post — try again."; });
    });
  }

  function loadList() {
    Promise.all([
      fetch(THREADS_URL + '?select=*&order=created_at.desc', { headers: headers }).then(function (r) { return r.json(); }),
      fetch(REPLIES_URL + '?select=post_slug&post_slug=like.forum:*', { headers: headers }).then(function (r) { return r.json(); })
    ])
      .then(function (res) {
        var threads = res[0], replies = res[1];
        if (!Array.isArray(threads)) throw new Error();
        var counts = {};
        if (Array.isArray(replies)) {
          replies.forEach(function (r) {
            var id = String(r.post_slug).slice(6);
            counts[id] = (counts[id] || 0) + 1;
          });
        }
        renderList(threads, counts);
      })
      .catch(function () { fail("Couldn't load the forum right now."); });
  }

  /* ---------- single thread ---------- */

  function renderThread(t, replies) {
    var list = replies.length
      ? replies.map(function (c) {
          return '<div class="comment-item">' +
            '<div class="comment-meta"><b>' + esc(c.name) + '</b> · ' + timeAgo(c.created_at) + '</div>' +
            '<div class="comment-body">' + esc(c.comment) + '</div>' +
          '</div>';
        }).join('')
      : '<p class="comment-status">No replies yet.</p>';

    root.innerHTML =
      '<div class="post-head">' +
        '<div class="post-meta"><span>' + esc(t.author) + '</span><span>·</span><span>' + timeAgo(t.created_at) + '</span></div>' +
        '<h1>' + esc(t.title) + '</h1>' +
      '</div>' +
      '<div class="post-body">' +
        '<div class="comment-body" style="margin-bottom:32px;">' + esc(t.body) + '</div>' +
        '<div class="log-header">Replies</div>' +
        '<div id="replyList">' + list + '</div>' +
        '<form id="replyForm" class="comment-form">' +
          '<input type="text" id="rName" class="search-input" placeholder="Your name" maxlength="60" required style="margin-bottom:8px;">' +
          '<textarea id="rBody" class="search-input" placeholder="Reply…" maxlength="2000" rows="3" required style="resize:vertical; font-family: var(--font-body);"></textarea>' +
          '<button type="submit" class="tag-filter" style="margin-top:10px; cursor:pointer;">Post reply</button>' +
          '<span id="rMsg" class="comment-status" style="display:inline-block; margin-left:10px;"></span>' +
        '</form>' +
        '<p style="margin-top:32px;"><a class="back-link" href="forum.html">← all threads</a></p>' +
      '</div>';

    document.getElementById('replyForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = document.getElementById('rMsg');
      var name = document.getElementById('rName').value.trim();
      var body = document.getElementById('rBody').value.trim();
      if (!name || !body) return;

      msg.textContent = 'Posting…';
      fetch(REPLIES_URL, {
        method: 'POST',
        headers: writeHeaders,
        body: JSON.stringify({ post_slug: 'forum:' + t.id, name: name, comment: body })
      })
        .then(function (r) {
          if (!r.ok) throw new Error();
          msg.textContent = 'Posted.';
          loadThread(t.id);
        })
        .catch(function () { msg.textContent = "Couldn't post — try again."; });
    });
  }

  function loadThread(id) {
    Promise.all([
      fetch(THREADS_URL + '?select=*&id=eq.' + encodeURIComponent(id), { headers: headers }).then(function (r) { return r.json(); }),
      fetch(REPLIES_URL + '?select=*&post_slug=eq.' + encodeURIComponent('forum:' + id) + '&order=created_at.asc', { headers: headers }).then(function (r) { return r.json(); })
    ])
      .then(function (res) {
        var rows = res[0];
        if (!Array.isArray(rows) || !rows.length) return fail('That thread does not exist.');
        renderThread(rows[0], Array.isArray(res[1]) ? res[1] : []);
      })
      .catch(function () { fail("Couldn't load that thread right now."); });
  }

  var id = threadId();
  if (id) loadThread(id); else loadList();
})();
