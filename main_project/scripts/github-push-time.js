// github-push-time.js


$(document).ready(function () {
  const owner = "Andy-GlobalUniData";
  const repo = "Andy-GlobalUniData.github.io";
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits`;

  // 顯示最後一次 commit 時間
  $.get(apiUrl, function (data) {
    const lastCommitTime = data[0].commit.committer.date;
    const formattedTime = new Date(lastCommitTime).toLocaleString();
    $('#github-push-time').text(`${formattedTime}`);
  });

  // 彈窗開關
  $("#show-changelog").on("click", function () {
    $("#changelog-modal").fadeIn(150);
    loadChangelog();
  });
  $(document).on("click", ".changelog-close", function () {
    $("#changelog-modal").fadeOut(120);
  });
  // 點擊彈窗外部也可關閉
  $(window).on("click", function (e) {
    if (e.target === document.getElementById("changelog-modal")) {
      $("#changelog-modal").fadeOut(120);
    }
  });

  // 載入多筆 commit 資訊
  function loadChangelog() {
    $("#changelog-list").html("Loading...");
    $.get(apiUrl + '?per_page=10', function (data) {
      let html = '<ul style="padding-left:18px;">';
      data.forEach(function (commit) {
        const date = new Date(commit.commit.committer.date).toLocaleString();
        const msg = commit.commit.message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const author = commit.commit.committer.name;
        html += `<li style='margin-bottom:12px;'><b>${date}</b><br><span style='color:#555;'>${msg}</span><br><span style='font-size:13px;color:#888;'>by ${author}</span></li>`;
      });
      html += '</ul>';
      $("#changelog-list").html(html);
    }).fail(function () {
      $("#changelog-list").html("無法取得更新日誌，請稍後再試。");
    });
  }
});
