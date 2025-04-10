<template>
  <div class="booking-list-container">
    <h1>我的訂單</h1>

    <table v-if="bookings.length > 0">
      <thead>
        <tr>
          <th>電影名稱</th>
          <th>座位號碼</th>
          <th>訂單狀態</th>
          <th>訂位時間</th>
          <th>付款/取消訂位 時間</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="booking in bookings" :key="booking.id">
          <td>{{ booking.movieName }}</td>
          <td>{{ booking.seatId }}</td>

          <!-- 讓訂單狀態可以被點擊 -->
          <td @click="booking.status !== 2 ? cancelBooking(booking.id) : null"
            :class="{ clickable: booking.status !== 2 }">
            {{ getStatusText(booking.status) }}
          </td>


          <td>{{ formatDate(booking.bookTime) }}</td>
          <td>
            <span v-if="booking.payTime">{{ formatDate(booking.payTime) }}</span>
            <span v-else class="clickable" @click="createPayment(booking.id)">尚未付款</span>
        </td>


        </tr>
      </tbody>
    </table>

    <p v-else>您目前沒有訂單。</p>

    <!-- 分頁控制 -->
    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 0">上一頁</button>
      <span> 第 {{ currentPage + 1 }} / {{ totalPages }} 頁 </span>
      <button @click="nextPage" :disabled="currentPage >= totalPages - 1">下一頁</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const bookings = ref([]); // 存放訂單資料
const currentPage = ref(0); // 當前頁碼，預設為第 0 頁
const totalPages = ref(1); // 預設總頁數為 1
const router = useRouter();

// 取得使用者訂單列表
const fetchUserBookings = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push('/login');
    alert("請先登入");
    return;
  }

  try {
    const response = await fetch(`http://localhost:8080/api/users/userbooklist2?page=${currentPage.value}`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await response.json();

    bookings.value = await Promise.all(data.content.map(async (booking) => {
      const movieName = await fetchMovieName(booking.movieId);
      return { ...booking, movieName };
    }));

    // 設定總頁數，避免無限請求超過範圍
    totalPages.value = data.totalPages;
  } catch (error) {
    console.error("無法取得訂單列表:", error);
  }
};

// 根據 movieId 取得電影名稱
const fetchMovieName = async (movieId) => {
  try {
    const response = await fetch(`http://localhost:8080/api/users/movies/name/${movieId}`);
    const movieData = await response.json();
    return movieData.name; // 假設後端回傳 { name: "電影名稱" }
  } catch (error) {
    console.error("無法取得電影名稱:", error);
    return "未知電影";
  }
};

// 訂單狀態轉換為文字
const getStatusText = (status) => {
  const statusMap = {
    0: "未付款",
    1: "已付款",
    2: "已取消"
  };
  return statusMap[status] || "未知狀態";
};

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString(); // 轉換為當地時間格式
};

// 切換到上一頁
const prevPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--;
    fetchUserBookings();
  }
};

// 切換到下一頁
const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++;
    fetchUserBookings();
  }
};

/****取消訂單相關的功能****/
const cancelBooking = async (bookingId) => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("請先登入");
    return;
  }

  if (!confirm("確定要取消這筆訂位嗎？\n取消訂位後將無法回覆該訂位")) {
    return;
  }

  try {
    const response = await fetch(`http://localhost:8080/api/users/cancelupdate`, {
      method: "PUT",  // 使用 PUT 方法
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id: bookingId, status: 2 }) // 傳遞 JSON 格式的訂單 ID & 狀態
    });

    if (!response.ok) {
      throw new Error(await response.text()); // 取得錯誤訊息
    }

    alert("訂單已取消");
    fetchUserBookings(); // 重新載入訂單列表
  } catch (error) {
    console.error("取消訂單失敗:", error);
    alert("取消失敗：" + error.message);
  }

  
};
const createPayment = (bookingId) => {//支付相關功能
  router.push(`/checkpage/${bookingId}`);
};


/****************************** */

// 初始化請求
onMounted(fetchUserBookings);
</script>

<style scoped>
.booking-list-container {
  text-align: center;
}

table {
  width: 80%;
  margin: 20px auto;
  border-collapse: collapse;
}

th, td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: center;
}

th {
  background-color: #007bff;
  color: white;
}

p {
  font-size: 18px;
  margin-top: 20px;
}

.pagination {
  margin-top: 20px;
}

button {
  padding: 8px 12px;
  margin: 5px;
  border: none;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  border-radius: 5px;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}


.clickable {
  color: rgb(43, 63, 145);
  text-decoration: underline;
  cursor: pointer;
}
</style>