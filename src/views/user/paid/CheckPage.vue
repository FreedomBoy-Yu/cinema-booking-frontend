<template>
  <div class="payment-container">
    <h1>請確認所支付的訂位資訊:</h1>

    <div v-if="book" class="card">
      <h2>訂位詳情</h2>
      <div class="info-row">
        <span class="label">🎬 電影名稱：</span>
        <span class="value">{{ movieName }}</span>
      </div>
      <div class="info-row">
        <span class="label">💺 座位號碼：</span>
        <span class="value">{{ book.seatId }}</span>
      </div>
      <div class="info-row">
        <span class="label">📅 訂位時間：</span>
        <span class="value">{{ formatDate(book.bookTime) }}</span>
      </div>

      <!-- 按鈕區域 -->
      <div class="button-group">
        <button @click="confirmPayment">確認付款</button>
        <button class="cancel-btn" @click="cancelPayment">取消付款</button>
      </div>
    </div>

    <p v-if="loading">正在載入訂單資訊...</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const bookId = route.params.bookingId;
const book = ref(null);
const movieName = ref("載入中..."); // 預設顯示載入中
const loading = ref(true);
const errorMessage = ref("");

// **取得電影名稱**
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

// **獲取訂單資訊**
const fetchBookingDetails = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert('未登入，請先登入！');
      router.push('/login');
      return;
    }

    const response = await fetch(`http://localhost:8080/api/users/paidBookCheck/${bookId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const bookingData = await response.json();
    book.value = bookingData;

    // 取得電影名稱
    movieName.value = await fetchMovieName(bookingData.movieId);
  } catch (error) {
    console.error("訂單載入失敗:", error);
    errorMessage.value = "無法獲取訂單資訊：" + error.message;
  } finally {
    loading.value = false;
  }
};

// **確認付款**
const confirmPayment = () => {
  console.log("確認付款的 bookId:", bookId);
  if (bookId) {
    router.push(`/paidpage/${bookId}`);
  } else {
    console.error("無法取得 bookId，請檢查 route.params");
  }
};




// **取消付款**
const cancelPayment = () => {
  router.push("/userbooklist"); // 取消後返回訂單列表
};

// **日期格式化**
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

// **初始化請求**
onMounted(fetchBookingDetails);
</script>

<style scoped>
.card {
  background: #ffffff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: 20px auto;
  text-align: left;
}

h2 {
  text-align: center;
  margin-bottom: 15px;
  color: #333;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.label {
  font-weight: bold;
  color: #555;
}

.value {
  color: #222;
}

/* 按鈕區域 */
.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

button {
  flex: 1;
  padding: 10px;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  border-radius: 5px;
  margin: 0 5px;
}

button:hover {
  background-color: #0056b3;
}

.cancel-btn {
  background-color: #dc3545;
}

.cancel-btn:hover {
  background-color: #b52a3b;
}

.error {
  color: red;
}
</style>
