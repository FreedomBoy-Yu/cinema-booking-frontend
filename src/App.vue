<template>
  <div id="app">
    <nav>
      <div class="left-links">
        <router-link to="/">首頁</router-link>
        <router-link to="/movielist">最近有什麼好電影!</router-link>
        <router-link to="/userbooklist">我的訂位</router-link>
        <router-link to="/userinfo">我的資訊</router-link>
        <router-link v-if="isAdmin" to="/manager/managerpage">進入管理頁面</router-link>
      </div>
      <div class="right-link">
        <router-link v-if="!isLoggedIn" to="/login">登入</router-link>
        <button v-else @click="logout">登出</button>
      </div>
    </nav>
    <router-view />
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { jwtDecode } from 'jwt-decode';

const router = useRouter();
const token = ref(localStorage.getItem('token')); // 讀取 Token
const userRole = ref(null); // 存使用者角色

// ✅ 計算是否為管理員 (角色 0 或 3)
const isAdmin = computed(() => userRole.value === 0 || userRole.value === 3);


// 使用 computed 計算是否已登入
const isLoggedIn = computed(() => !!token.value);

const logout = () => {
  localStorage.removeItem('token'); // 清除 Token
  token.value = null; // 更新變數，讓畫面刷新
  router.push('/'); // 登出後跳轉到首頁
};

// 監聽 localStorage，防止頁面重新整理時狀態不同步
onMounted(() => {
  token.value = localStorage.getItem('token');
  if (token.value) {
    try {
      const decoded = jwtDecode(token.value);
      userRole.value = decoded.role; // 取得角色
    } catch (error) {
      console.error("JWT 解析失敗:", error);
      localStorage.removeItem('token'); // 清除無效 Token
      token.value = null;
    }
  }
});
</script>
