<template>
    <div>
      <h1>付款頁面</h1>
      <p>預約 ID: {{ bookId }}</p>
  
      <div class="button-group">
        <button @click="handlePayment">付款</button>
        <button class="cancel-btn" @click="cancelPayment">取消付款</button>
        <button class="error-btn" @click="simulatePaymentError">付款錯誤</button>
      </div>
  
      <p v-if="message" class="message">{{ message }}</p>
    </div>
  </template>
  
  <script setup>
  import { ref } from "vue";
  import { useRoute, useRouter } from "vue-router";
  
  const route = useRoute();
  const router = useRouter();
  const bookId = route.params.bookingId; // 獲取預約 ID
  const message = ref(""); // 存儲回應訊息
  
  const handlePayment = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/pay/fake-payment?orderId=${bookId}`, {
        method: "GET",
      });
  
      if (!response.ok) throw new Error("支付請求失敗");
  
      const result = await response.text();
    //   message.value = "支付成功：" + result;
      alert("支付成功!"+ result)
      router.push('/userbooklist')
    } catch (error) {
      console.error("支付失敗:", error);
      message.value = "支付失敗：" + error.message;
    }
  };
  
  const cancelPayment = () => {
    router.push("/userbooklist"); // 返回訂單列表
  };
  
  const simulatePaymentError = () => {
    message.value = "模擬付款錯誤，請稍後再試";
  };
  </script>
  
  <style scoped>
  .button-group {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }
  
  button {
    padding: 10px 15px;
    border: none;
    cursor: pointer;
    border-radius: 5px;
  }
  
  button:hover {
    opacity: 0.8;
  }
  
  .cancel-btn {
    background-color: #dc3545;
    color: white;
  }
  
  .error-btn {
    background-color: #ff9800;
    color: white;
  }
  
  .message {
    margin-top: 20px;
    font-weight: bold;
  }
  </style>
  