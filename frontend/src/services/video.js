import axios from 'axios';
const BASE_URL = "";

// function sendVideo(url) {
//   return axios.post(`${BASE_URL}/video`, { url });
// }

function sendVideo(url) {
  return Promise.resolve({ videoUrl: "https://www.youtube.com/embed/ckiaNqOrG5U" })
}

export default sendVideo;