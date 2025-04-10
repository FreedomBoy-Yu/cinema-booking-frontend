<template>
    <div class="userinfo-container">
      <h1>我的資訊</h1>
      <div v-if="user">
        <p><strong>帳號：</strong> {{ user.account }}</p>
        <p><strong>姓名：</strong> {{ user.name }}</p>
        <p><strong>Email：</strong> {{ user.email }}</p>
        <p><strong>電話：</strong> {{ user.phone }}</p>
        <p><strong>角色：</strong> {{ roleText }}</p>
        <button @click="editUserInfo">修改資訊</button>
        <button @click="changePW">修改密碼</button>
      </div>
      
      <p v-else class="error-message">正在載入使用者資訊...</p>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import axios from 'axios';
  
  const router = useRouter();
  const user = ref(null); // 存使用者資訊
  const token = localStorage.getItem('token'); // 取得 JWT Token
  
  // 角色對應表
  const roleMap = {
    0: '最高權限管理員',
    1: '一般使用者',
    2: 'VIP',
    3: '一般管理員'
  };
  
  // 計算角色名稱
  const roleText = computed(() => {
    if (!user.value) return '';
    return roleMap[user.value.role] || '未知角色';
  });
  
  // 取得使用者資訊
  const fetchUserInfo = async () => {
    if (!token) {
      alert('未登入，請先登入！');
      router.push('/login');
      return;
    }
  
    try {
      const response = await axios.get('http://localhost:8080/api/users/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      user.value = response.data; // 設定使用者資訊
    } catch (error) {
      console.error('取得使用者資訊失敗', error);
      alert('請重新登入');
      localStorage.removeItem('token');
      router.push('/login');
    }
  };
  
  // 修改資訊按鈕點擊時，導向「修改使用者資訊」頁面
  const editUserInfo = () => {
    router.push('/edit'); // 修改這裡的路由，確保與你的 Vue Router 設計相符
  };
  const changePW      = ()=>{
    router.push('/changepassword');
  };
  
  onMounted(fetchUserInfo); // 當元件載入時執行
  </script>
  
  <style scoped>
  .userinfo-container {
    max-width: 500px;
    margin: 20px auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
    text-align: left;
    background-color: #f9f9f9;
  }
  button {
    margin-top: 10px;
    padding: 8px 15px;
    margin-right: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  button:hover {
    background-color: #0056b3;
  }
  button:not(:last-child) {
  margin-right: 10px;
}

  .error-message {
    color: red;
  }
  </style>
  