import axios from 'axios';
import { BASE_URL } from '../constants';

function sendVideo(url) {
  return axios.post(`${BASE_URL}/video`, { url });
}

// function sendVideo(url) {
//   return Promise.resolve({ videoUrl: url })
// }

export default sendVideo;