<template>
    <div class="admin-container">
      <h2>管理員後台</h2>
      <router-link to="/manager/movie/movielistctl">電影清單管理</router-link><br>
      <router-link to="/manager/movie/movielocalctl">電影位置管理</router-link><br>
      <router-link to="/manager/reports/reportspage">排行&報表相關</router-link><br>
      <router-link to="/manager/costom/costomservice">客服訂單查詢</router-link>
    </div>
  </template>
  
  <style scoped>
  .admin-container {
    width: 100%;  /* 讓內容占滿整個畫面 */
    padding-left: 20px;  /* 可選：讓文字不緊貼左邊 */
  }
  
  h2 {
    margin-bottom: 10px;
  }
  </style>
  