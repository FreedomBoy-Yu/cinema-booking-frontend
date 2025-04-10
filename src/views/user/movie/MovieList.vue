<template>
    <div class="movie-list-container">
      <h1>最近有什麼好電影!</h1>
  
      <!-- 搜尋框 -->
      <div class="search-bar">
        <input v-model="searchQuery" placeholder="輸入電影名稱..." />
        <button @click="searchMovie">🔍</button>
      </div>
  
      <!-- 電影列表 -->
      <table>
        <thead>
          <tr>
            <th>電影名稱</th>
            <th>播放方式</th>
            <th>訂票</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="movie in movies" :key="movie.id">
            <td>{{ movie.movieName }}</td>
            <td>{{ movie.roomWay }}</td>
            <td>
              <button 
                v-if="movie.bookAble" 
                class="book-btn available" 
                @click="goToBooking(movie.id)">
                訂票
              </button>
              <span v-else class="unavailable">不可訂票</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  
  const movies = ref([]);
  const searchQuery = ref('');
  const router = useRouter();
  
  // 獲取所有電影
  const fetchMovies = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/users/movielist');
      movies.value = await response.json();
    } catch (error) {
      console.error('無法獲取電影列表:', error);
    }
  };
  
  // 搜尋電影
  const searchMovie = async () => {
    if (!searchQuery.value.trim()) {
      fetchMovies();
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:8080/api/users/movie/findbyname?name=${searchQuery.value}`);
      const data = await response.json();
      movies.value = data ? [data] : [];
    } catch (error) {
      console.error('搜尋失敗:', error);
    }
  };
  
  // 點擊"可訂票"按鈕，跳轉到訂票畫面
  const goToBooking = (movieId) => {
    router.push(`SeatStatus/${movieId}`);
  };
  
  // 頁面載入時獲取電影列表
  onMounted(fetchMovies);
  </script>
  
  <style scoped>
  .movie-list-container {
    max-width: 700px;
    margin: auto;
    text-align: center;
  }
  
  .search-bar {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .search-bar input {
    padding: 8px;
    width: 250px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  .search-bar button {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    margin-left: 5px;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  
  th, td {
    padding: 12px;
    border-bottom: 1px solid #ddd;
  }
  
  th {
    background-color: #f4f4f4;
  }
  
  .book-btn {
    padding: 8px 12px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .available {
    background-color: green;
    color: white;
  }
  
  .unavailable {
    color: red;
    font-weight: bold;
  }
  </style>
  