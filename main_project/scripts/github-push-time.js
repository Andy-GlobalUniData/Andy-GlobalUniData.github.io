// github-push-time.js

$(document).ready(function() {
    const owner = "Andy-GlobalUniData";  // 組織名稱
    const repo = "Andy-GlobalUniData.github.io";  // repository 名稱
  
    // GitHub API 的 URL
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits`;
  
    // 使用 jQuery 發送 GET 請求來獲取 commit 記錄
    $.get(apiUrl, function(data) {
      // 獲取最近一次 commit 的時間
      const lastCommitTime = data[0].commit.committer.date;
  
      // 格式化時間（可選）
      const formattedTime = new Date(lastCommitTime).toLocaleString();
  
      // 顯示在頁面上的指定元素中
      $('#github-push-time').text(`${formattedTime}`);
    });
  });
  