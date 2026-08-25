(function () {
  var SUPABASE_URL = 'https://elyyampkgidwwaiiexso.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_YXGT8AzCObG1bf0viv4wuw_IWLO7pEn';
  var REST_URL = SUPABASE_URL + '/rest/v1/blog_comments';
  var THREADS_URL = SUPABASE_URL + '/rest/v1/forum_threads';

  var lockScreen = document.getElementById('lockScreen');
  var adminPanel = document.getElementById('adminPanel');
  var listEl = document.getElementById('adminList');
  var threadsEl = document.getElementById('adminThreads');
  var unlockForm = document.getElementById('unlockForm');

  var adminKey = sessionStorage.getItem('ql_admin_key');

  function escapeHtml(s) {
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function timeAgo(iso) {
    var diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
  }

  function loadComments() {
    listEl.textContent = 'Loading comments…';
    fetch(REST_URL + '?order=created_at.desc', {
      headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY }
    })
      .then(function (res) { return res.json(); })
      .then(function (rows) {
        if (!rows || rows.length === 0) {
          listEl.textContent = 'No comments yet.';
          return;
        }
        listEl.innerHTML = rows.map(function (c) {
          var where = String(c.post_slug).indexOf('forum:') === 0 ? 'forum thread' : c.post_slug;
          return '<div class="comment-item" data-id="' + c.id + '">' +
            '<div class="comment-meta"><b>' + escapeHtml(c.name) + '</b> · ' + escapeHtml(where) + ' · ' + timeAgo(c.created_at) + '</div>' +
            '<div class="comment-body">' + escapeHtml(c.comment) + '</div>' +
            '<button class="tag-filter delete-btn" data-id="' + c.id + '" style="margin-top:8px; cursor:pointer;">Delete</button>' +
          '</div>';
        }).join('');
      })
      .catch(function () { listEl.textContent = "Couldn't load comments right now."; });
  }

  function loadThreads() {
    if (!threadsEl) return;
    threadsEl.textContent = 'Loading threads…';
    fetch(THREADS_URL + '?select=*&order=created_at.desc', {
      headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY }
    })
      .then(function (res) { return res.json(); })
      .then(function (rows) {
        if (!Array.isArray(rows) || rows.length === 0) {
          threadsEl.textContent = 'No threads yet.';
          return;
        }
        threadsEl.innerHTML = rows.map(function (t) {
          return '<div class="comment-item" data-id="' + t.id + '">' +
            '<div class="comment-meta"><b>' + escapeHtml(t.author) + '</b> · ' + timeAgo(t.created_at) + '</div>' +
            '<div class="comment-body"><b>' + escapeHtml(t.title) + '</b><br>' + escapeHtml(t.body) + '</div>' +
            '<button class="tag-filter delete-thread-btn" data-id="' + t.id + '" style="margin-top:8px; cursor:pointer;">Delete thread</button>' +
          '</div>';
        }).join('');
      })
      .catch(function () { threadsEl.textContent = "Couldn't load threads right now."; });
  }

  function deleteThread(id, btn) {
    if (!window.confirm('Delete this thread? Its replies stay in the comments list below and can be removed separately.')) return;
    btn.disabled = true;
    btn.textContent = 'Deleting…';
    fetch(THREADS_URL + '?id=eq.' + encodeURIComponent(id), {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: 'Bearer ' + SUPABASE_KEY,
        'x-admin-key': adminKey || '',
        Prefer: 'return=representation'
      }
    })
      .then(function (res) { return res.json().then(function (rows) { return { ok: res.ok, rows: rows }; }); })
      .then(function (result) {
        if (result.ok && result.rows && result.rows.length > 0) {
          var item = btn.closest('.comment-item');
          if (item) item.remove();
        } else {
          alert('Delete failed — wrong password, or the thread was already removed.');
          btn.disabled = false;
          btn.textContent = 'Delete thread';
        }
      })
      .catch(function () {
        alert("Couldn't reach the server — try again.");
        btn.disabled = false;
        btn.textContent = 'Delete thread';
      });
  }

  function deleteComment(id, btn) {
    btn.disabled = true;
    btn.textContent = 'Deleting…';
    fetch(REST_URL + '?id=eq.' + encodeURIComponent(id), {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: 'Bearer ' + SUPABASE_KEY,
        'x-admin-key': adminKey || '',
        Prefer: 'return=representation'
      }
    })
      .then(function (res) {
        return res.json().then(function (rows) { return { ok: res.ok, rows: rows }; });
      })
      .then(function (result) {
        if (result.ok && result.rows && result.rows.length > 0) {
          var item = btn.closest('.comment-item');
          if (item) item.remove();
        } else {
          alert('Delete failed — wrong password, or the comment was already removed.');
          btn.disabled = false;
          btn.textContent = 'Delete';
        }
      })
      .catch(function () {
        alert("Couldn't reach the server — try again.");
        btn.disabled = false;
        btn.textContent = 'Delete';
      });
  }

  listEl.addEventListener('click', function (e) {
    if (e.target.classList.contains('delete-btn')) {
      deleteComment(e.target.getAttribute('data-id'), e.target);
    }
  });

  if (threadsEl) {
    threadsEl.addEventListener('click', function (e) {
      if (e.target.classList.contains('delete-thread-btn')) {
        deleteThread(e.target.getAttribute('data-id'), e.target);
      }
    });
  }

  function unlock() {
    lockScreen.style.display = 'none';
    adminPanel.style.display = 'block';
    loadThreads();
    loadComments();
  }

  unlockForm.addEventListener('submit', function (e) {
    e.preventDefault();
    adminKey = document.getElementById('adminPassword').value;
    sessionStorage.setItem('ql_admin_key', adminKey);
    unlock();
  });

  if (adminKey) unlock();
})();
