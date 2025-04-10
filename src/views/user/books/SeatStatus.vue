<template>
  <div class="booking-container">
    <h1>電影院訂位系統</h1>
    <div class="screen">銀幕</div>

    <div class="seating-area">
      <div v-for="row in 9" :key="row" class="seat-row">
        <div 
          v-for="(col, index) in seatColumns" 
          :key="index"
          class="seat"
          :class="{ 
            reserved: bookedSeats.includes(getSeatId(row, col)), 
            selected: selectedSeats.includes(getSeatId(row, col)),
            walkway: col === 'W' 
          }"
          @click="col !== 'W' && toggleSeat(row, col)">
          {{ col === 'W' ? '' : getSeatId(row, col) }}
        </div>
      </div>
    </div>

    <button class="confirm-btn" @click="confirmBooking">確認訂位</button>
    <p v-if="selectedSeats.length > 0">已選座位: {{ selectedSeats.join(', ') }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const movieId = route.params.movieId;

const roomSize = ref(null); // **不設預設值，等 API 回應**
const bookedSeats = ref([]); // 已預訂座位
const selectedSeats = ref([]); // 使用者選擇的座位
const seatColumns = ref([]); // 影廳座位排版

// 影廳座位排版設定
const seatLayouts = {
  15: ['A', 'B', 'C', 'D', 'W', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'W', 'L', 'M', 'N', 'O'], 
  10: ['A', 'B', 'C', 'W', 'D', 'E', 'F', 'G', 'W', 'H', 'I', 'J'], 
  7:  ['A', 'B', 'W', 'C', 'D', 'E', 'W', 'F', 'G']
};

// 取得電影座位資訊
const fetchSeatStatus = async () => {
  try {
    const response = await fetch(`http://localhost:8080/api/users/getseattatusformovie/${movieId}`);
    const data = await response.json();
    
    roomSize.value = data.roomSize;  // **確保 roomSize 來自 API**
    bookedSeats.value = data.seat;   // 設定已預訂座位
    seatColumns.value = seatLayouts[data.roomSize] || []; // **只在 API 回應後設定座位排版**
  } catch (error) {
    console.error('無法獲取座位狀態:', error);
  }
};

// 產生座位 ID，例如 "1A", "2B"
const getSeatId = (row, col) => col === 'W' ? '' : `${row}${col}`;

// 選擇座位
const toggleSeat = (row, col) => {
  if (col === 'W') return; // 走道不可點擊
  const seatId = getSeatId(row, col);
  if (bookedSeats.value.includes(seatId)) return; // 已預訂的座位不可選

  if (selectedSeats.value.includes(seatId)) {
    selectedSeats.value = selectedSeats.value.filter(s => s !== seatId);
  } else {
    selectedSeats.value.push(seatId);
  }
};

// 送出訂票請求（先檢查 token，避免不必要的 API 請求）
const confirmBooking = async () => {
  if (selectedSeats.value.length === 0) {
    alert("請選擇座位！");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    alert("請先登入"); // **沒有 token 就直接提醒，不發送請求**
    router.push(`/login`);
    return;
  }

  const requestBody = {
    movieId: movieId,
    seatId: selectedSeats.value[0], // 目前假設只選一個座位
  };

  try {
    const response = await fetch("http://localhost:8080/api/users/userInsertBook", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(requestBody),
    });

    alert(await response.text());
    router.push("/");
  } catch (error) {
    console.error("訂票失敗:", error);
  }
};

onMounted(fetchSeatStatus);
</script>

<style scoped>
.booking-container {
  text-align: center;
}

.screen {
  background-color: #333;
  color: white;
  width: 80%;
  margin: 20px auto;
  padding: 10px;
  text-align: center;
}

/* 讓座位數量根據房型動態變化 */
.seating-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.seat-row {
  display: flex;
  justify-content: center;
  gap: 8px;
}

/* 走道樣式 */
.walkway {
  background-color: #ddd !important; /* 走道變灰色 */
  pointer-events: none;
  box-shadow: none;
  cursor: default;
}

/* 座位樣式 */
.seat {
  width: 50px;
  height: 50px;
  background-color: #bbb;
  border-radius: 5px;
  cursor: pointer;
  text-align: center;
  line-height: 50px;
  font-size: 18px;
  font-weight: bold;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
}

.seat.selected {
  background-color: #6c9;
}

.seat.reserved {
  background-color: #f44;
  cursor: not-allowed;
}

/* 讓按鈕變大 */
.confirm-btn {
  margin-top: 20px;
  padding: 15px 30px;
  font-size: 18px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
}

.confirm-btn:hover {
  background-color: #0056b3;
}
</style>
