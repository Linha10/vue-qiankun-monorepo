<script setup lang="ts">
import { hostContext } from "@/shared/host-context";
</script>

<template>
  <!-- 先用來驗證掛載是否成功、props 是否正確傳入，
       之後搭入真實 view 時會把這裡換成實際的權限管理頁面 -->
  <div style="padding: 24px">
    <h2>系統設定（system-settings 子應用）</h2>
    <p>如果你看得到這段文字，代表主應用已經成功掛載本子應用。</p>
    <el-descriptions title="收到的 host context" border :column="1">
      <el-descriptions-item label="baseURL">{{
        hostContext.baseURL || "（尚未收到）"
      }}</el-descriptions-item>
      <el-descriptions-item label="currentUser">{{
        hostContext.currentUser ?? "（尚未收到）"
      }}</el-descriptions-item>
      <el-descriptions-item label="role">{{
        hostContext.role
      }}</el-descriptions-item>
      <el-descriptions-item label="locale">{{
        hostContext.locale
      }}</el-descriptions-item>
      <el-descriptions-item label="accountMenus 數量">{{
        hostContext.accountMenus.length
      }}</el-descriptions-item>
    </el-descriptions>

    <!-- 手動 QA 用的導覽連結，之後接上 layout-template 的側邊選單就可以移除 -->
    <div style="margin-top: 16px; display: flex; gap: 12px">
      <router-link to="/account-management">帳號管理</router-link>
      <router-link to="/account-management/login-logs">登入日誌</router-link>
      <router-link to="/account-management/action-logs">操作日誌</router-link>
      <router-link to="/role-management">角色管理</router-link>
    </div>
  </div>
</template>
