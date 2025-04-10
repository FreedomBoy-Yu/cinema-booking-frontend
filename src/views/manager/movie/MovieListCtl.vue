<template>
    <div class="movie-list-container">
      <h1>電影清單管理</h1>
  
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
            <th>影廳位置</th>
            <th>訂票狀態</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="movie in movies" :key="movie.id">
            <td>{{ movie.movieName }}</td>
            <td>{{ movie.roomWay }}</td>
            <td>
              <button 
                class="toggle-btn"
                :class="movie.bookAble ? 'open' : 'closed'"
                @click="toggleBooking(movie)">
                {{ movie.bookAble ? "開放訂票" : "關閉訂票" }}
              </button>
            </td>
            <td @click="editMovieInfo(movie)" class="clickable">✏️</td>

          </tr>
        </tbody>

      </table>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  
  const movies = ref([]);
  const searchQuery = ref('');
  
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
  
  // 切換訂票狀態
  const toggleBooking = async (movie) => {
    const statusText = movie.bookAble ? "可以訂票" : "不可訂票";

// 顯示確認訊息
    const confirmChange = confirm(`電影 ID: ${movie.id}\n目前狀態: ${statusText}\n確定要更改嗎?`);

    if (!confirmChange) return;
    const updatedMovie = { 
      id: movie.id,
      bookAble: !movie.bookAble // 反轉狀態
    };
  
    try {
      const response = await fetch('http://localhost:8080/api/manager/movies/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMovie)
      });
  
      if (response.ok) {
        movie.bookAble = !movie.bookAble; // 更新前端狀態
      } else {
        console.error('更新失敗:', await response.text());
      }
    } catch (error) {
      console.error('請求錯誤:', error);
    }
  };
  const editMovieInfo = async (movie) => {
  // 顯示彈出式輸入框，讓使用者輸入新電影名稱
  const newMovieName = window.prompt("請輸入新的電影名稱：", movie.movieName);

  // 如果使用者取消輸入（點擊取消或輸入空值），就不執行更新
  if (newMovieName === null || newMovieName.trim() === "") {
    return;
  }

  // 建立要更新的資料
  const updatedMovie = { 
    id: movie.id,
    movieName: newMovieName,  // 使用新的電影名稱
  };
    try {
      const response = await fetch('http://localhost:8080/api/manager/movies/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMovie)
      });
  
      if (response.ok) {
      // 更新前端顯示的電影名稱
      movie.movieName = newMovieName;
      alert("電影名稱更新成功！");
    } else {
      console.error("更新失敗:", await response.text());
    }
  } catch (error) {
    console.error("請求錯誤:", error);
  }
  }
  
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
  
  .toggle-btn {
    padding: 8px 12px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
  }
  
  .open {
    background-color: green;
    color: white;
  }
  
  .closed {
    background-color: red;
    color: white;
  }
  .clickable {
  cursor: pointer; /* 變成手型 */
  color: blue; /* 讓它看起來像連結 */
}
.clickable:hover {
  color: darkblue; /* 滑鼠懸停時變深色 */
}
  </style>
  