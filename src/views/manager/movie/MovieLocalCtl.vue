<template>
  <div class="theater-container">
    <div v-for="floor in theaterData" :key="floor.level" class="floor">
      <div class="floor-label">{{ floor.level }}</div>
      <div class="theater-grid">
        <div class="row" v-for="(row, rowIndex) in floor.splitRooms" :key="rowIndex">
          <button 
            v-for="room in row" 
            :key="room"
            class="bt"
            @click="handleClick(room)" 
            :style="getButtonStyle(room)"
          >
            {{ getButtonText(room) }}
          </button>
        </div>
      </div>
      <hr />
    </div>
  </div>

  <!-- 彈出式視窗 -->
  <div v-if="showModal" class="modal">
    <div class="modal-content">
      <h3 v-if="selectedMovie">管理電影：</h3>
      <h3 v-else>新增電影：</h3>

      <div v-if="selectedMovie">
        <label>更新電影名稱：</label>
        <input v-model="updateName" type="text" placeholder="請輸入新的電影名稱" />

        <label>更換影廳位置:</label>
        <select v-model="updateRoomWay">
          <option v-for="room in availableRooms" :key="room" :value="room">
            {{ room }}
          </option>
        </select>

        <div class="modal-buttons">
          <button @click="updatedMovie">確定</button>
          <button @click="closeModal">取消</button>
        </div>
      </div>

      <div v-else>
        <label>電影名稱：</label>
        <input v-model="newMovieName" type="text" placeholder="輸入電影名稱" />

        <label>可否被訂位：</label>
        <select v-model="newMovieBookable">
          <option :value="true">可訂位</option>
          <option :value="false">不可訂位</option>
        </select>

        <div class="modal-buttons">
          <button @click="addMovie">確定</button>
          <button @click="closeModal">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const splitArray = (array, size1, size2) => {
  return [array.slice(0, size1), array.slice(size1, size1 + size2)];
};

const theaterData = ref([
  { level: "3F", splitRooms: splitArray(["3A", "3B", "3C", "3D", "3E", "3F", "3G", "3H", "3I", "3J", "3K", "3L", "3M", "3N", "3O"], 8, 7), btnWidth: 3, btnHeight: 2.5 },
  { level: "2F", splitRooms: splitArray(["2A", "2B", "2C", "2D", "2E", "2F", "2G", "2H", "2I", "2J"], 5, 5), btnWidth: 3.5, btnHeight: 3 },
  { level: "1F", splitRooms: [["1A", "1B", "1C", "1D", "1E", "1F"]], btnWidth: 4.5, btnHeight: 4 },
]);

const movieMap = ref({});
const showModal = ref(false);
const newMovieName = ref("");
const newMovieBookable = ref(true);
const newRoomWay = ref("");
const updateName = ref("");
const updateRoomWay = ref("");
const selectedRoom = ref("");
const selectedMovie = ref(null);

const availableRooms = computed(() => {
  if (!selectedRoom.value) return [];
  const currentFloorPrefix = selectedRoom.value.charAt(0);
  return theaterData.value
    .flatMap(f => f.splitRooms.flat())
    .filter(room =>
      room.charAt(0) === currentFloorPrefix &&
      (!movieMap.value[room]?.name || room === selectedRoom.value)
    );
});

const fetchMovies = async () => {
  try {
    const response = await fetch("http://localhost:8080/api/manager/movies/allmovies");
    const movies = await response.json();

    movieMap.value = movies.reduce((acc, movie) => {
      acc[movie.roomWay] = {
        id: movie.id,
        name: movie.movieName || null,
        bookable: movie.bookAble ?? true,
      };
      return acc;
    }, {});
  } catch (error) {
    console.error("獲取電影列表失敗", error);
  }
};

onMounted(fetchMovies);

const handleClick = (room) => {
  selectedRoom.value = room;
  selectedMovie.value = movieMap.value[room] || null;
  newMovieName.value = selectedMovie.value?.name || "";
  newRoomWay.value = selectedRoom.value;
  // 不預設填入電影名稱
  updateName.value = "";
  updateRoomWay.value = selectedRoom.value;
  showModal.value = true;
};

const updatedMovie = async () => {
  const nameToSend = updateName.value.trim() || selectedMovie.value.name;
  const isNameChanged = nameToSend !== selectedMovie.value.name;
  const isRoomChanged = updateRoomWay.value !== selectedRoom.value;

  if (!isNameChanged && !isRoomChanged) {
    closeModal();
    return; // 沒有變更就不呼叫 API
  }

  if (!updateRoomWay.value) {
    alert("請選擇新的影廳位置");
    return;
  }

  const updatedMovie = {
    id: selectedMovie.value.id,
    movieName: nameToSend,
    bookAble: selectedMovie.value.bookable,
    roomWay: updateRoomWay.value,
  };

  try {
    await fetch("http://localhost:8080/api/manager/movies/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedMovie),
    });
    closeModal();
    fetchMovies();
  } catch (error) {
    console.error("更新電影失敗", error);
  }
};

const addMovie = async () => {
  if (!newMovieName.value.trim()) {
    alert("請輸入電影名稱");
    return;
  }

  const newMovie = {
    movieName: newMovieName.value,
    bookAble: newMovieBookable.value,
    roomWay: selectedRoom.value,
  };

  try {
    await fetch("http://localhost:8080/api/manager/movies/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMovie),
    });
    closeModal();
    fetchMovies();
  } catch (error) {
    console.error("新增電影失敗", error);
  }
};

const getButtonText = (room) => {
  return movieMap.value[room]?.name || "";
};

const getButtonStyle = (room) => {
  const movie = movieMap.value[room] || {};
  let backgroundColor = "#d3d3d3";
  if (movie.name) {
    backgroundColor = "#1e5edb";
    if (movie.bookable === false) {
      backgroundColor = "#f4c2c2";
    }
  }
  return { backgroundColor };
};

const closeModal = () => {
  showModal.value = false;
  newMovieName.value = "";
  newMovieBookable.value = true;
  newRoomWay.value = "";
  updateName.value = "";
  updateRoomWay.value = "";
  selectedMovie.value = null;
};
</script>

<style scoped>
.row {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
}

.bt {
  border: 1px solid black;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  cursor: pointer;
  transition: 0.3s;
  border-radius: 8px;
  font-size: 1.2em;
  min-width: 120px;
  width: 140px;
  height: 60px;
}

.modal-buttons {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
}
</style>
