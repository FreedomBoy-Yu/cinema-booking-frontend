<template>
    <div class="login-container">
        <h1>登入頁面</h1>
        <form @submit.prevent="handleLogin">
            <div class="input-group">
                <label for="account">帳號</label>
                <input type="text" id="account" v-model="account" placeholder="請輸入帳號">
            </div>
            <div class="input-group">
                <label for="password">密碼</label>
                <input type="password" id="password" v-model="password" placeholder="請輸入密碼">
            </div>
            <button type="submit">登入</button>
            <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </form>
    </div>
</template>
<script>
import axios from 'axios';

export default {
    data() {
        return {
            account: '',
            password: '',
            errorMessage: ''
        };
    },
    methods: {
        async handleLogin() {
            try {
                const response = await axios.post('http://localhost:8080/api/users/login', {
                    account: this.account,
                    password: this.password
                });

                const token = response.data;
                localStorage.setItem('token', token); // 儲存 JWT Token
                alert('登入成功！');

                this.$router.push('/');

// 延遲 100 毫秒再刷新，確保 `router.push` 先執行
setTimeout(() => {
    window.location.reload();
}, 100);


            } catch (error) {
                this.errorMessage = error.response?.data?.message || '登入失敗，請檢查帳號或密碼';
            }
        }
    }
};
</script>