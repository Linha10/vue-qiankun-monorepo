// demo 帳號不再寫死放進這份 admin 白名單：改成指派「Demo」角色（見
// packages/mocks/src/data/roles.ts 的 DEMO_ROLE_ID），讓使用者可以自己到
// 角色管理調整 Demo 角色的權限，實際體驗頁面被擋 / 按鈕被 disable 的效果。
// 這份白名單保留給「真的需要略過所有選單/按鈕權限檢查」的帳號使用，demo 環境目前沒有這種帳號。
export const permission = {
  admin: [] as string[],
}
