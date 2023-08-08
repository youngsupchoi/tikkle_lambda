"use strict";
const api = require("lambda-api")();
const { authtoken } = require("authtoken.js");

//-------- require modules ------------------------------------------------//
//
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
  post_tikkling_receivedTikkle,
} = require("./tikkle_tikkling/post_tikkling_receivedTikkle/index.js");
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
const { post_user_friend } = require("./tikkle_user/post_user_friend/index.js");
const {
  post_user_wishlist,
} = require("./tikkle_user/post_user_wishlist/index.js");

//-------- API's ------------------------------------------------//

//------- auth
api.get("/get_auth_checkToken", get_auth_checkToken);

api.post("/post_auth_IdDuplicationCheck", post_auth_IdDuplicationCheck);

api.post("/post_auth_phoneCheck", post_auth_phoneCheck);

api.post("/post_auth_registerUser", post_auth_registerUser);

api.post("/post_auth_tokenGenerate", post_auth_tokenGenerate);

//

//------- friend

api.get("/get_friend_data/:mode", get_friend_data);

api.get("/get_friend_event", get_friend_event);

api.get("/get_friend_search/:nick", get_friend_search);

api.post("/post_friend_phonecheck", post_friend_phonecheck);

api.put("/put_friend_block", put_friend_block);

//

//------- image

api.get("/get_image_deleteProfile", authtoken, get_image_deleteProfile);

api.get("/get_image_profileSaveUrl", authtoken, get_image_profileSaveUrl);

api.post("/post_image_profileUrl", authtoken, post_image_profileUrl);

//------- notification

api.get("/get_notification_list", authtoken, get_notification_list);

api.post("/post_notification_send", authtoken, post_notification_send);

api.put("/put_notification_delete", authtoken, put_notification_delete);

//------- product
api.post("/post_product_images", authtoken, post_product_images);

api.post("/post_product_info", authtoken, post_product_info);

api.post("/post_product_list", authtoken, post_product_list);

api.put("/put_product_viewIncrease", authtoken, put_product_viewIncrease);

//

//------- tikkling
api.get("/get_tikkling_friendinfo", get_tikkling_friendinfo);

api.get("/get_tikkling_info/:tikkling_id", get_tikkling_info);

api.post("/post_tikkling_receivedTikkle", post_tikkling_receivedTikkle);

api.post("/post_tikkling_create", post_tikkling_create);

api.put("/put_tikkling_end", put_tikkling_end);

//

//------- user
api.delete("/delete_user_wishlist", authtoken, delete_user_wishlist);

api.get("/get_user_checkTikkling", authtoken, get_user_checkTikkling);

api.get("/get_user_endTikklings", authtoken, get_user_endTikklings);

api.get("/get_user_info", authtoken, get_user_info);

api.get("/get_user_myWishlist", authtoken, get_user_myWishlist);

api.get("/get_user_paymentHistory", authtoken, get_user_paymentHistory);

api.post("/post_user_friend", authtoken, post_user_friend);

api.post("/post_user_wishlist", authtoken, post_user_wishlist);

//

//-------- handler ------------------------------------------------//

exports.handler = async (req, context) => {
  return await api.run(req, context);
};
