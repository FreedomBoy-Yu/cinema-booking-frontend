<template>
    <div class="change-password-container">
      <h1>變更密碼</h1>
      <form @submit.prevent="updatePassword">
        <div class="input-group">
          <label for="current-password">當前密碼</label>
          <input 
            type="password" 
            id="current-password" 
            v-model="currentPassword" 
            placeholder="請輸入當前密碼" 
            required
          />
        </div>
  
        <div class="input-group">
          <label for="new-password">新密碼</label>
          <input 
            type="password" 
            id="new-password" 
            v-model="newPassword" 
            placeholder="請輸入新密碼" 
            required
          />
        </div>
  
        <div class="input-group">
          <label for="confirm-password">確認新密碼</label>
          <input 
            type="password" 
            id="confirm-password" 
            v-model="confirmPassword" 
            placeholder="請再次輸入新密碼" 
            required
          />
        </div>
  
        <button type="submit">確認變更</button>
        <button type="button" class="cancel-btn" @click="cancelChange">取消</button>
      </form>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import axios from 'axios';
  
  const router = useRouter();
  const currentPassword = ref('');
  const newPassword = ref('');
  const confirmPassword = ref('');
  const token = localStorage.getItem('token');
  const errorMessage = ref('');
  
  // **發送變更密碼請求**
  const updatePassword = async () => {
    if (!token) {
        alert('未登入，請先登入！');
        router.push('/login');
        return;
    }

    if (newPassword.value !== confirmPassword.value) {
        errorMessage.value = '新密碼與確認密碼不一致';
        return;
    }
    
    if (currentPassword.value === newPassword.value) {
        errorMessage.value = '密碼變更需要變更密碼'; // 顯示錯誤訊息
        return;
    }


    try {
        const response = await axios.put('http://localhost:8080/api/users/changepd', 
            { oldPD: currentPassword.value, newPD: newPassword.value },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        alert(response.data); // 這裡會收到 "密碼變更成功!" 或 "舊密碼錯誤"
        router.push('/userinfo');
    } catch (error) {
        console.error('變更密碼失敗', error);
        errorMessage.value = error.response?.data || '變更失敗，請檢查輸入內容';
    }
};

  
  // **取消變更，返回個人資訊頁面**
  const cancelChange = () => {
    router.push('/userinfo');
  };
  </script>
  
  <style scoped>
  .change-password-container {
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
  