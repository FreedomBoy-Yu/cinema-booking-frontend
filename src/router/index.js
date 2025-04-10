import { createRouter, createWebHistory } from "vue-router";
/** JWT */
import { jwtDecode } from "jwt-decode";


/** Views */
import Home from "../views/Home.vue";
/*************----使用者操作相關router----******************************/
import Login from "../views/user/userpage/Login.vue"; // 登入
import UserInfo from "../views/user/userpage/UserInfo.vue"; // 使用者資訊
import UserInfoEdit from "../views/user/userpage/UserInfoEdit.vue"; // 使用者資訊更改
import ChangePassWD from "../views/user/userpage/ChangePassWD.vue"; // 使用者更換密碼
import MovieList from "../views/user/movie/MovieList.vue"; // 查看電影列表
import SeatStatus from "../views/user/books/SeatStatus.vue"; // 座位列表
import UserBookList from "../views/user/userpage/UserBookList.vue"; // 使用者看自己的訂票紀錄
/**************支付相關 *****************************************/
import CheckPage from "../views/user/paid/CheckPage.vue";
import PaidPage from "../views/user/paid/PaidPage.vue";

/*************----管理員相關router----******************************/
import ManagerPage from "../views/manager/ManagerPage.vue";
import MovieListCtl from "../views/manager/movie/MovieListCtl.vue";
import MovieLocalCtl from "../views/manager/movie/MovieLocalCtl.vue";
import ReportsPage from "../views/manager/reports/ReportPage.vue";
import ConstomService from "../views/manager/costom/CostomService.vue";
/*************----設定路由----******************************/
const routes = [
  {
    path: "/", // 首頁
    name: "Home",
    component: Home,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/userinfo",
    name: "UserInfo",
    component: UserInfo,
  },
  {
    path: "/edit",
    name: "Edit",
    component: UserInfoEdit,
  },
  {
    path: "/changepassword",
    name: "ChangePassWD",
    component: ChangePassWD,
  },
  {
    path: "/movielist",
    name: "MovieList",
    component: MovieList,
  },
  /*************  booking相關 ************************************/
  {
    path: "/seatstatus/:movieId",
    name: "SeatStatus",
    component: SeatStatus,
  },
  {
    path: "/userbooklist",
    name: "UserBookList",
    component: UserBookList,
  },
  /*************  付款相關 ****************************************/
  {
    path: "/checkpage/:bookingId",
    name: "CheckPage",
    component: CheckPage,
  },
  {
    path: "/paidpage/:bookingId",
    name: "PaidPage",
    component: PaidPage,
  },
  /*************   管理員操作相關     ******************************/
  {
    path: "/manager",
    name: "Manager",
    meta: { requiresAuth: true, allowedRoles: [0, 3] }, // 這個父層的meta會套用到所有子路由
    children: [
      {
        path: "managerpage", // `/manager/managerpage`
        name: "ManagerPage",
        component: ManagerPage,
      },
      {
        path: "movie", // `/manager/movie`
        children: [
          {
            path: "movielistctl", // `/manager/movie/movielistctl`
            name: "MovieListCtl",
            component: MovieListCtl,
          },
          {
            path:"movielocalctl",
            name:"MovieLocalCtl",
            component:MovieLocalCtl
          }
        ]
      },
      {
        path:"reports",
        children:[
          {
            path:"reportspage",
            name:ReportsPage,
            component:ReportsPage
          }
        ]
      },
      {
        path:"costom",
        children:[
          {
            path:"costomservice",
            name:ConstomService,
            component:ConstomService
          }
        ]
      }

    ]
  }
  


];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

/*************   設定全域路由守衛     ******************************/
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem("token"); // 讀取 JWT Token
    let userRole = null;
  
    if (token) {
      try {
        const decoded = jwtDecode(token); // 解析 Token
        userRole = decoded.role; // 取得角色
      } catch (error) {
        console.error("無效的 JWT Token", error);
        localStorage.removeItem("token"); // 清除錯誤的 Token
        next("/login"); // 重新導向登入頁面
        return;
      }
    }
  
    // **如果路由有 requiresAuth，才檢查權限**
    if (to.meta.requiresAuth) {
      if (userRole !== null && to.meta.allowedRoles.includes(userRole)) {
        next(); // 角色符合，放行
      } else {
        alert("你沒有權限訪問此頁面");
        next("/"); // 權限不足，回首頁
      }
    } else {
      next(); // **對於不受保護的頁面，一律放行**
    }
  });
  

export default router;
