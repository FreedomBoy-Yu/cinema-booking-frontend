<template>
    <div class="edit-container">
      <h1>修改個人資訊</h1>
      <form @submit.prevent="updateUserInfo">
        <div class="input-group">
          <label for="name">姓名</label>
          <input type="text" id="name" v-model="user.name" required />
        </div>
  
        <div class="input-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="user.email" required />
        </div>
  
        <div class="input-group">
          <label for="phone">電話</label>
          <input type="text" id="phone" v-model="user.phone" required />
        </div>
  
  
        <button type="submit">確認修改</button>
        <button type="button" class="cancel-btn" @click="cancelEdit">取消</button>
      </form>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import axios from 'axios';
  
  const router = useRouter();
  const user = ref({
    name: '',
    email: '',
    phone: '',
  });
  const token = localStorage.getItem('token'); // 取得 JWT Token
  const errorMessage = ref('');
  
  // **載入目前的使用者資訊**
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
  
  // **發送更新請求**
  const updateUserInfo = async () => {
    try {
      await axios.put('http://localhost:8080/api/users/update', user.value, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      alert('資訊更新成功！');
      router.push('/userinfo'); // 修改完成後返回個人資訊頁面
    } catch (error) {
      console.error('更新資訊失敗', error);
      errorMessage.value = error.response?.data?.message || '更新失敗，請檢查輸入內容';
    }
  };
  
  // **取消修改，返回個人資訊頁面**
  const cancelEdit = () => {
    router.push('/userinfo');
  };
  
  onMounted(fetchUserInfo);
  </script>
  
  <style scoped>
  .edit-container {
    max-width: 500px;
    margin: 20px auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
    text-align: left;
    background-color: #f9f9f9;
  }
  .input-group {
    margin-bottom: 15px;
  }
  input {
    width: 100%;
    padding: 8px;
    margin-top: 5px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  button {
    margin-top: 10px;
    padding: 8px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  button:hover {
    background-color: #0056b3;
  }
  .cancel-btn {
    background-color: #ccc;
    margin-left: 10px;
  }
  .cancel-btn:hover {
    background-color: #999;
  }
  .error {
    color: red;
  }
  </style>
  