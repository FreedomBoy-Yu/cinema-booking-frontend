<template>
  <div class="container">
    <!-- 選擇報表類型 -->
    <div class="left-links">
      <p>選擇查看的報表:</p>
      <div class="link-list">
        <span v-for="report in reports" :key="report.id" class="report-link" @click="selectReport(report)">
          {{ report.name }}
        </span>
      </div>
    </div>




    <!-- 報表相關 -->
    <div>
      <span class="left-links" v-if="selectedReport"><!--報表控制面板-->
        <div class="report-controller" v-if="![1, 4].includes(selectedReportId)"><!--如果不是這些值則不顯示-->
          報表控制選項:<br>
          <div class="controller-item" v-if="[2, 5].includes(selectedReportId)"><!--有無付款-->

            <div>
              <label class="option-style">
                <input type="radio" :value="0" v-model="selectStatus" />
                未付款
              </label>
              <label class="option-style">
                <input type="radio" :value="1" v-model="selectStatus" />
                已付款
              </label>
              <label class="option-style">
                <input type="radio" :value="2" v-model="selectStatus" />
                取消訂位
              </label>
            </div>



          </div>
          <div class="controller-item" v-if="[2, 5].includes(selectedReportId)"><!--期間內-->
            開始日期：
            <input type="date" v-model="startDate" />
            結束日期：
            <input type="date" v-model="endDate" />
          </div>
          <div v-if="[3].includes(selectedReportId)">
            <p class="left-links">選擇電影:</p>
            <select class="controller-item" v-model="selectedMovieId">
              <option v-for="movie in movieOptions" :key="movie.value" :value="movie.value">
                {{ movie.label }}
              </option>
            </select>
          </div>
          <div v-if="[2, 5].includes(selectedReportId)">
            <p style="color: red;">不輸入將會撈出全部資料</p>
          </div>
          <button class="submit-button" @click="submit">確認</button>
        </div>

        <!--這是為沒有需要輸入值設置得選項---->
        <div class="report-container">
          <div v-if="selectedReportId === 1">
            <table>
              <thead>
                <tr>
                  <th>使用者 ID</th>
                  <th>電影名稱</th>
                  <th>訂位狀態</th>
                  <th>訂位時間</th>
                  <th>付款時間</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="book in bookList" :key="book.id">
                  <td>{{ book.userId }}</td>
                  <td>{{ movieMap[book.movieId]?.movieName || '未知電影' }}</td>
                  <td>{{ getStatusText(book.status) }}</td>
                  <td>{{ formatDate(book.bookTime) }}</td>
                  <td>{{ formatDate(book.payTime) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="selectedReportId === 2">
            <table>
              <thead>
                <tr>
                  <th>電影名稱</th>
                  <th>訂單數量</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="book in bookList" :key="book.id">
                  <td>{{ movieMap[book.movieId]?.movieName || '未知電影' }}</td>
                  <td>{{ book.orderCount }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="selectedReportId === 3">
            <table>
              <thead>
                <tr>
                  <th>訂單編號</th>
                  <th>訂位狀態</th>
                  <th>訂位時間</th>
                  <th>付款時間</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="book in bookList" :key="book.id">
                  <td>{{ book.id }}</td>
                  <td>{{ getStatusText(book.status) }}</td>
                  <td>{{ formatDate(book.bookTime) }}</td>
                  <td>{{ formatDate(book.payTime) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="selectedReportId === 4">
            <table>
              <thead>
                <tr>
                  <th>電影名稱</th>
                  <th>訂單數量</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="book in bookList" :key="book.id">
                  <td>{{ movieMap[book.movieId]?.movieName || '未知電影' }}</td>
                  <td>{{ book.orderCount }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <!--這是為沒有需要輸入值設置得選項---->


      </span>

      <!-- <p>{{ selectedReport.content }}</p> -->
    </div>

    <!-- 下載按鈕 (右下角) -->
    <button v-if="selectedReport" class="download-btn" @click="downloadReport">
      下載
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { watch, onMounted } from 'vue'
const name = ref('')
const selectedReport = ref(null);
const selectedReportId = ref(null)
const movieMap = ref({})
const startDate = ref('')
const endDate = ref('')
const selectStatus = ref('')
const movieOptions = ref([])
const selectedMovieId = ref('')
const bookList = ref([])
let url = ''
/***定義一些變數名稱start */
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
function getTime() {//檔案下載時需要用到
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
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
const reports = ref([
  { id: 1, name: '查看所有訂位' },//done
  { id: 2, name: '訂位狀態時間段查詢訂單' },//done
  { id: 3, name: '電影名稱查詢訂單' },//done
  { id: 4, name: '電影訂位數量排序' },//done


]);
// 選擇報表
const selectReport = (report) => {
  console.log("剛剛點選" + report.id);
  selectedReport.value = report
  selectedReportId.value = report.id
};
/***定義一些變數名稱end*/


//監聽selectedReportId
watch(() => selectedReportId.value, (newVal) => {
  if (newVal === 1) AllBooks();
  if (newVal === 4) MovieOderCount();
})



//report1
const AllBooks = async () => {
  const res = await fetch('http://localhost:8080/api/manager/findAllBook')
  const data = await res.json()
  bookList.value = data
}
//report2
const PopularMoviesRank = async () => {
  const status = selectStatus.value ?? ''
  const start = startDate.value?.trim()
  const end = endDate.value?.trim()
  const allowedStatus = [0, 1, 2]
  if (!allowedStatus.includes(selectStatus.value)) {
    alert("請選擇訂單狀態!")
    return
  }
  let url = `http://localhost:8080/api/manager/paiddaterange?paid=${selectStatus.value}`
  if (start) url += `&startDate=${start}`
  if (end) url += `&endDate=${end}`
  console.log(`GET: ${url}`)
  const res = await fetch(url)
  const data = await res.json()
  bookList.value = data
}
//report3
const MovieNameToReport = async () => {
  if (!selectedMovieId.value) {
    alert("請選擇一部電影")
    return
  }
  let url = `http://localhost:8080/api/manager/movieId?movieid=${selectedMovieId.value}`
  console.log(`GET: ${url}`)
  const res = await fetch(url)
  const data = await res.json()
  bookList.value = data
}
//report4
const MovieOderCount = async () => {
  const res = await fetch('http://localhost:8080/api/manager/movieorder')
  const data = await res.json()
  bookList.value = data
}

const submit = async () => {

  switch (selectedReportId.value) {
    case 2:
      await PopularMoviesRank()
      break
    case 3:
      await MovieNameToReport()
      break
    default:
    alert('未知模式')
    console.warn('未知模式')
  }
}
const downloadReport1 = async () => {
const res = await fetch('http://localhost:8080/reports/download/allbook', {
        method: 'GET',
      })
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `全報表_下載時間_${getTime()}.pdf` // ← 可自訂檔名
      a.click()
      window.URL.revokeObjectURL(url)
    }
const downloadReport2 = async () => {
  const status = selectStatus.value ?? '';
  const start = startDate.value?.trim();
  const end = endDate.value?.trim();

  let url = `http://localhost:8080/reports/download/findMovieOrderPaidCountTimeRange?status=${status}`;
  if (start) url += `&startDate=${start}`;
  if (end) url += `&endDate=${end}`;

  const res = await fetch(url, { method: 'GET' });
  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  const filename = `狀態時間段查詢訂位_${status || 'all'}_${start || '起始'}~${end || '現在'}.pdf`;

  a.href = downloadUrl;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(downloadUrl);
}
const downloadReport3 = async () => {
  if (!selectedMovieId.value) {
    alert('請先選擇電影')
    return
  }

  const res = await fetch(`http://localhost:8080/reports/download/findBookBymovieId?movieId=${selectedMovieId.value}`, {
    method: 'GET',
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`下載失敗：${err}`)
  }

  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)

  const movie = movieOptions.value.find(m => m.value === selectedMovieId.value)
  const movieName = movie?.label || '未知電影'

  const a = document.createElement('a')
  a.href = url
  a.download = `${movieName}_下載時間${getTime()}.pdf`
  a.click()
  window.URL.revokeObjectURL(url)
}
const downloadReport4 = async () => {
const res = await fetch('http://localhost:8080/reports/download/MovieOrderCount', {
        method: 'GET',
      })
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `電影訂位數量排序_${getTime()}.pdf` // ← 可自訂檔名
      a.click()
      window.URL.revokeObjectURL(url)
    }



const downloadReport = async () => {
  console.log(selectedReportId.value)
  switch (selectedReportId.value) {
    case 1:
      await downloadReport1()
      break
    case 2://done
      await downloadReport2()
      break
    case 3://done
      await downloadReport3()
      break
    case 4:
      await downloadReport4()
      break
    default:
      console.warn('未知模式')
  }
}



onMounted(() => {
  fetchMovieList()
})

</script>

<style scoped>
.container {
  padding: 20px;
  max-width: 100%;
}

.left-links {
  font-size: 16px;
  margin-bottom: 20px;
}

.link-list {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.report-link {
  color: #007bff;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.report-link:hover {
  background-color: #f0f0f0;
  text-decoration: underline;
}

.report-container {
  text-align: center;
  width: 80%;
  margin: 20px auto;
  /* ← 修改這行 */
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.report-controller {
  text-align: center;
  margin-top: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
  padding: 20px;
  width: 10%;
}

.download-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 10px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.controller-item {
  width: 80%;

  text-align: left;
}

.download-btn:hover {
  background: #0056b3;
}

.submit-button {
  float: right;
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

.controller-traget {
  color: rgb(54, 206, 226);
  text-align: left;
}

.option-style {
  width: 100%;
  white-space: nowrap;
  display: flex;
  align-items: center;
  /* 垂直置中 input 和文字 */
  gap: 0.5rem;
  /* input 與文字的間距 */
  padding: 0.5rem 0;
  color: #000;
  cursor: pointer;
}
</style>
