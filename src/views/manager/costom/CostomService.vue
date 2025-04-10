<template>
<div class="input-button-group">
  <input type="text" placeholder="請輸入使用者ID..." v-model="userId" />
  <button @click="SearshOder">搜尋 </button>
</div>

    <table class="listbox">
        <thead>
            <tr>
                <th>訂單ID</th>
                <th>電影名稱</th>
                <th>座位</th>
                <th>訂位時間</th>
                <th>變更時間</th>
                <th>訂票狀態</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="book in bookList" :key="book.id">
                <td>{{ book.id }}</td>
                  <td>{{ movieMap[book.movieId]?.movieName || '未知電影' }}</td>
                  <td>{{ book.seatId }}</td>
                  <td>{{ formatDate(book.bookTime) }}</td>
                  <td>{{ formatDate(book.payTime) }}</td>
                  <td>{{ getStatusText(book.status) }}</td>
                </tr>
        </tbody>

    </table>
</template>

<script setup>
import { ref } from 'vue'
import { watch, onMounted } from 'vue'
const userId=ref(null)
const movieMap = ref({})
const movieOptions = ref([])
const bookList = ref([])
const getStatusText = (status) => {//狀態定義
  if (status === 0) return '未付款'
  if (status === 1) return '已付款'
  if (status === 2) return '已取消訂位'
  return '未知狀態'
}
const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleString()
}
let url = ''
const SearshOder = async ()=>{
    if (!userId.value) {
    alert("請輸入UserID")
    return
  }
  let url = `http://localhost:8080/api/manager/findbookbyuserid?id=${userId.value}`
  console.log(`GET: ${url}`)
  const res = await fetch(url)
  const data = await res.json()
  bookList.value = data
}


const fetchMovieList = async () => {//因為一定會需要用到這個變數名稱，所以先讀取
  const res = await fetch('http://localhost:8080/api/users/movielist')
  const movies = await res.json()

  movieMap.value = movies.reduce((map, movie) => {
    map[movie.id] = movie
    return map
  }, {})
  movieOptions.value = movies.map(movie => ({
    value: movie.id,
    label: movie.movieName
  }))
}
onMounted(() => {
  fetchMovieList()
})
</script>

<style scoped>
.input-button-group {
  display: flex;
  gap: 10px;
  align-items: center;
  max-width: 600px; /* 或依你頁面寬度調整 */
  margin-bottom: 20px;
}

.input-button-group input {
  flex: 1;
  min-width: 0; /* 防止 input 把整行撐開 */
}

.input-button-group button {
  white-space: nowrap;
}

.listbox {
    text-align: center;
  width: 80%;
  margin: 20px auto;
  /* ← 修改這行 */
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
  font-size: 15px;
}

th,
td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: center;
}

thead th {
  background-color: #f2f2f2;
  font-weight: bold;
}

tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}
</style>