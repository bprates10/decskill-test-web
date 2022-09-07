import axios from "axios"
// LOCAL
const URL = "http://127.0.0.1:8000/api/"

const api = axios.create({
  baseURL: URL
})

api.defaults.headers.get['Content-Type'] = 'application/json'
api.defaults.headers.post['Content-Type'] = 'application/json'
api.defaults.headers.patch['Content-Type'] = 'application/json'

api.defaults.headers.get['Access-Control-Allow-Origin'] = '*'
api.defaults.headers.post['Access-Control-Allow-Origin'] = '*'
api.defaults.headers.patch['Access-Control-Allow-Origin'] = '*'

export default api