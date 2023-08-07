"use strict";
const api = require("lambda-api")();

//-------- require modules ------------------------------------------------//

//auth
const {
  get_auth_checkToken,
} = require("./tikkle_auth/get_auth_checkToken/index.js");
const {
  post_auth_IdDuplicationCheck,
} = require("./tikkle_auth/post_auth_IdDuplicationCheck/index.js");
const {
  post_auth_phoneCheck,
} = require("./tikkle_auth/post_auth_phoneCheck/index.js");
const {
  post_auth_registerUser,
} = require("./tikkle_auth/post_auth_registerUser/index.js");
const {
  post_auth_tokenGenerate,
} = require("./tikkle_auth/post_auth_tokenGenerate/index.js");

//friend
const { get_friend_data } = require("./tikkle_friend/get_friend_data/index.js");
const {
  get_friend_event,
} = require("./tikkle_friend/get_friend_event/index.js");
const {
  get_friend_search,
} = require("./tikkle_friend/get_friend_search/index.js");
const {
  post_friend_phonecheck,
} = require("./tikkle_friend/post_friend_phonecheck/index.js");
const {
  put_friend_block,
} = require("./tikkle_friend/put_friend_block/index.js");

//image
const {
  get_image_deleteProfile,
} = require("./tikkle_image/get_image_deleteProfile/index.js");
const {
  get_image_profileSaveUrl,
} = require("./tikkle_image/get_image_profileSaveUrl/index.js");
const {
  post_image_profileUrl,
} = require("./tikkle_image/post_image_profileUrl/index.js");

//notification
const {
  get_notification_list,
} = require("./tikkle_notification/get_notification_list/index.js");
const {
  post_notification_send,
} = require("./tikkle_notification/post_notification_send/index.js");
const {
  put_notification_delete,
} = require("./tikkle_notification/put_notification_delete/index.js");

//post
const {
  post_product_images,
} = require("./tikkle_product/post_product_images/index.js");
const {
  post_product_info,
} = require("./tikkle_product/post_product_info/index.js");
const {
  post_product_list,
} = require("./tikkle_product/post_product_list/index.js");
const {
  put_product_viewIncrease,
} = require("./tikkle_product/put_product_viewIncrease/index.js");

//tikkling
const {
  get_tikkling_friendinfo,
} = require("./tikkle_tikkling/get_tikkling_friendinfo/index.js");
const {
  get_tikkling_info,
} = require("./tikkle_tikkling/get_tikkling_info/index.js");
const {
  get_tikkling_recivedTikkle,
} = require("./tikkle_tikkling/get_tikkling_recivedTikkle/index.js");
const {
  post_tikkling_create,
} = require("./tikkle_tikkling/post_tikkling_create/index.js");
const {
  put_tikkling_end,
} = require("./tikkle_tikkling/put_tikkling_end/index.js");

//user
const {
  delete_user_wishlist,
} = require("./tikkle_user/delete_user_wishlist/index.js");
const {
  get_user_checkTikkling,
} = require("./tikkle_user/get_user_checkTikkling/index.js");
const {
  get_user_endTikklings,
} = require("./tikkle_user/get_user_endTikklings/index.js");
const { get_user_info } = require("./tikkle_user/get_user_info/index.js");
const {
  get_user_myWishlist,
} = require("./tikkle_user/get_user_myWishlist/index.js");
const {
  get_user_paymentHistory,
} = require("./tikkle_user/get_user_paymentHistory/index.js");
const { post_user_email } = require("./tikkle_user/post_user_email/index.js");
const { post_user_friend } = require("./tikkle_user/post_user_friend/index.js");
const {
  post_user_wishlist,
} = require("./tikkle_user/post_user_wishlist/index.js");

//-------- API's ------------------------------------------------//

//------- auth
api.get("/get_auth_checkToken", async (req, res) => {
  // console.log("id : ", req.query);
  const ret = await get_auth_checkToken(req);
  return ret;
});

api.post("/post_auth_IdDuplicationCheck", async (req, res) => {
  const ret = await post_auth_IdDuplicationCheck(req);
  return ret;
});

api.post("/post_auth_phoneCheck", async (req, res) => {
  const ret = await post_auth_phoneCheck(req);
  return ret;
});

api.post("/post_auth_registerUser", async (req, res) => {
  const ret = await post_auth_registerUser(req);
  return ret;
});

api.post("/post_auth_tokenGenerate", async (req, res) => {
  const ret = await post_auth_tokenGenerate(req);
  return ret;
});

//

//------- friend
api.get("/get_friend_data", async (req, res) => {
  const ret = await get_friend_data(req);
  return ret;
});

api.get("/get_friend_event", async (req, res) => {
  const ret = await get_friend_event(req);
  return ret;
});

api.get("/get_friend_search", async (req, res) => {
  const ret = await get_friend_search(req);
  return ret;
});

api.post("/post_friend_phonecheck", async (req, res) => {
  const ret = await post_friend_phonecheck(req);
  return ret;
});

api.put("/put_friend_block", async (req, res) => {
  const ret = await put_friend_block(req);
  return ret;
});

//

//------- image
api.get("/get_image_deleteProfile", async (req, res) => {
  const ret = await get_image_deleteProfile(req);
  return ret;
});

api.get("/get_image_profileSaveUrl", async (req, res) => {
  const ret = await get_image_profileSaveUrl(req);
  return ret;
});

api.post("/post_image_profileUrl", async (req, res) => {
  const ret = await post_image_profileUrl(req);
  return ret;
});

//

//------- notification
api.get("/get_notification_list", async (req, res) => {
  const ret = await get_notification_list(req);
  return ret;
});

api.post("/post_notification_send", async (req, res) => {
  const ret = await post_notification_send(req);
  return ret;
});

api.put("/put_notification_delete", async (req, res) => {
  const ret = await put_notification_delete(req);
  return ret;
});

//

//------- product
api.post("/post_product_images", async (req, res) => {
  const ret = await post_product_images(req);
  return ret;
});

api.post("/post_product_info", async (req, res) => {
  const ret = await post_product_info(req);
  return ret;
});

api.post("/post_product_list", async (req, res) => {
  const ret = await post_product_list(req);
  return ret;
});

api.put("/put_product_viewIncrease", async (req, res) => {
  const ret = await put_product_viewIncrease(req);
  return ret;
});

//

//------- tikkling
api.get("/get_tikkling_friendinfo", async (req, res) => {
  const ret = await get_tikkling_friendinfo(req);
  return ret;
});

api.get("/get_tikkling_info", async (req, res) => {
  const ret = await get_tikkling_info(req);
  return ret;
});

api.get("/get_tikkling_recivedTikkle", async (req, res) => {
  const ret = await get_tikkling_recivedTikkle(req);
  return ret;
});

api.post("/post_tikkling_create", async (req, res) => {
  const ret = await post_tikkling_create(req);
  return ret;
});

api.put("/put_tikkling_end", async (req, res) => {
  const ret = await put_tikkling_end(req);
  return ret;
});

//

//------- user
api.delete("/delete_user_wishlist", async (req, res) => {
  const ret = await delete_user_wishlist(req);
  return ret;
});

api.get("/get_user_checkTikkling", async (req, res) => {
  const ret = await get_user_checkTikkling(req);
  return ret;
});

api.get("/get_user_endTikklings", async (req, res) => {
  const ret = await get_user_endTikklings(req);
  return ret;
});

api.get("/get_user_info", async (req, res) => {
  const ret = await get_user_info(req);
  return ret;
});

api.get("/get_user_myWishlist", async (req, res) => {
  const ret = await get_user_myWishlist(req);
  return ret;
});

api.get("/get_user_paymentHistory", async (req, res) => {
  const ret = await get_user_paymentHistory(req);
  return ret;
});

api.post("/post_user_email", async (req, res) => {
  const ret = await post_user_email(req);
  return ret;
});

api.post("/post_user_friend", async (req, res) => {
  const ret = await post_user_friend(req);
  return ret;
});

api.post("/post_user_wishlist", async (req, res) => {
  const ret = await post_user_wishlist(req);
  return ret;
});

//

//-------- handler ------------------------------------------------//

exports.handler = async (event, context) => {
  return await api.run(event, context);
};
