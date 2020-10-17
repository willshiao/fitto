import axios from 'axios';
const BASE_URL = "";

function sendVideo(url) {
  return axios.post(`${BASE_URL}/video`, { url });
}

export default sendVideo;