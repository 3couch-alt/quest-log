(function () {
  var SUPABASE_URL = 'https://elyyampkgidwwaiiexso.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_YXGT8AzCObG1bf0viv4wuw_IWLO7pEn';
  var REST_URL = SUPABASE_URL + '/rest/v1/blog_comments';

  var lockScreen = document.getElementById('lockScreen');
  var adminPanel = document.getElementById('adminPanel');
  var listEl = document.getElementById('adminList');
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
          return '<div class="comment-item" data-id="' + c.id + '">' +
            '<div class="comment-meta"><b>' + escapeHtml(c.name) + '</b> · ' + escapeHtml(c.post_slug) + ' · ' + timeAgo(c.created_at) + '</div>' +
            '<div class="comment-body">' + escapeHtml(c.comment) + '</div>' +
            '<button class="tag-filter delete-btn" data-id="' + c.id + '" style="margin-top:8px; cursor:pointer;">Delete</button>' +
          '</div>';
        }).join('');
      })
      .catch(function () { listEl.textContent = "Couldn't load comments right now."; });
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

  unlockForm.addEventListener('submit', function (e) {
    e.preventDefault();
    adminKey = document.getElementById('adminPassword').value;
    sessionStorage.setItem('ql_admin_key', adminKey);
    lockScreen.style.display = 'none';
    adminPanel.style.display = 'block';
    loadComments();
  });

  if (adminKey) {
    lockScreen.style.display = 'none';
    adminPanel.style.display = 'block';
    loadComments();
  }
})();
