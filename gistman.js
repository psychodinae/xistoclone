const axios = require("axios");

module.exports = GistMan = function (token) {
  this.axiosGit = axios.create({
    baseURL: "https://api.github.com/gists",
    maxRedirects: 0,
    headers: {
      "Authorization": `token ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36",
    },
  });
};

GistMan.prototype.create = function (file_name, content = "place holder", public = "false") {
  let data = JSON.parse(`{"public": "${public}","files": {"${file_name}": {"content": "${content}"}}}`)
  return this.axiosGit
  .post('', data)
  .then((res) => res.data);
};

GistMan.prototype.read = function (file_id, file_name) {
  return this.axiosGit
    .get(`/${file_id}`)
    .then((res) => res.data.files[file_name].content);
};

GistMan.prototype.update = function (file_id, file_name, content) {
  let data = JSON.parse(`{"files": {"${file_name}": {"content": "${content}"}}}`)
  return this.axiosGit
    .patch(`/${file_id}`, data)
    .then((res) => res.data);
};

GistMan.prototype.delete = function (file_id) {
  this.axiosGit
    .delete(`/${file_id}`)
    .then((res) => res.data);
    return true
};
