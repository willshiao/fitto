import axios from 'axios';
const BASE_URL = "";

// function sendVideo(url) {
//   return axios.post(`${BASE_URL}/video`, { url });
// }

function sendVideo(url) {
  return Promise.resolve({ videoUrl: url })
}

export default sendVideo;