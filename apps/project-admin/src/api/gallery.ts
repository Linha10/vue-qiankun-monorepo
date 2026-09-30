// gallery module 的圖片 API 分散在各自的資源模組中，請從以下位置引入：
//
//   飯店圖片：import { hotelApi } from '@/api/hotel'
//             hotelApi.uploadHotelImage / updateHotelImage / deleteHotelImage
//
//   房型圖片：import { roomTypeApi } from '@/api/roomType'
//             roomTypeApi.createRoomImage / updateRoomImage / deleteRoomImage
//
// 若未來有獨立的圖片管理 API（如批次查詢、排序），可在此新增。
