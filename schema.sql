CREATE DATABASE tikkle_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_general_ci;

use tikkle_db;

CREATE TABLE bank (
    bank_code INT PRIMARY KEY,
    bank_name VARCHAR(255),
    UNIQUE (`bank_name`)
);

INSERT INTO bank (bank_code, bank_name) VALUES
(2,'산업은행'),
(3,'기업은행'),
(92,'토스뱅크'),
(4,'국민은행'),
(5,'외환은행'),
(7,'수협은행/수협중앙회'),
(11,'NH농협'),
(12,'농협중앙회'),
(20,'우리은행'),
(23,'SC 제일은행'),
(27,'한국씨티은행'),
(31,'대구은행'),
(32,'부산은행'),
(34,'광주은행'),
(35,'제주은행'),
(37,'전북은행'),
(39,'경남은행'),
(45,'새마을금고중앙회'),
(48,'신협중앙회'),
(50,'상호저축은행'),
(54,'HSBC 은행'),
(55,'도이치은행'),
(57,'제이피모간체이스은행'),
(60,'BOA은행'),
(62,'중국공상은행'),
(64,'산림조합중앙회'),
(71,'우체국'),
(81,'KEB 하나은행'),
(88,'신한은행'),
(89,'K뱅크'),
(271,'토스증권'),
(90,'카카오뱅크'),
(209,'유안타증권'),
(218,'KB증권'),
(238,'미래에셋증권'),
(240,'삼성증권'),
(243,'한국투자증권'),
(247,'NH 투자증권'),
(261,'교보증권'),
(262,'하이투자증권'),
(263,'현대차투자증권'),
(264,'키움증권'),
(265,'이베스트투자증권'),
(266,'SK 증권'),
(267,'대신증권'),
(269,'한화투자증권'),
(270,'하나금융투자'),
(278,'신한금융투자'),
(279,'동부증권'),
(280,'유진투자증권'),
(287,'메리츠종합금융증권'),
(290,'부국증권'),
(291,'신영증권'),
(292,'케이프투자증권'),
(103,'SBI 저축은행');


CREATE TABLE `users` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(30) NOT NULL,
	`birthday` DATE NOT NULL,
	`nick` VARCHAR(30) NOT NULL,
	`phone` VARCHAR(30) NOT NULL,
	`is_deleted` BOOLEAN NOT NULL DEFAULT false,
	`gender` ENUM('male', 'female', 'other') NOT NULL,
	`image` TEXT,
	`zonecode` VARCHAR(255),
	`address` VARCHAR(255),
	`detail_address` VARCHAR(255),
	`created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_tikkling` BOOL NOT NULL DEFAULT false,
	`device_token` VARCHAR(255),
	`tikkling_ticket` INT NOT NULL DEFAULT 0,
    `account` VARCHAR(255) DEFAULT NULL,
    `bank_code` INT,
	PRIMARY KEY (`id`),
    FOREIGN KEY (`bank_code`) REFERENCES `bank`(`bank_code`),
	UNIQUE (`nick`),
	UNIQUE (`phone`)
);


CREATE TABLE `phones` (
    `phone` VARCHAR(11) NOT NULL,
    `user_id` INT NOT NULL,
    PRIMARY KEY (`phone`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=MEMORY;

DELIMITER //
-- 새로운 사용자가 추가되면, phones 테이블에 해당 사용자의 id와 phone을 추가
CREATE TRIGGER `after_insert_user`
AFTER INSERT ON `users`
FOR EACH ROW
BEGIN
    INSERT INTO `phones` (`phone`, `user_id`)
    VALUES (NEW.`phone`, NEW.`id`);
END;
//
-- 사용자의 전화번호가 변경되면, phones 테이블에서 기존의 전화번호를 삭제하고, 새 전화번호와 id를 추가
CREATE TRIGGER `after_update_user`
AFTER UPDATE ON `users`
FOR EACH ROW
BEGIN
    IF OLD.`phone` <> NEW.`phone` THEN
        DELETE FROM `phones`
        WHERE `phone` = OLD.`phone`;

        INSERT INTO `phones` (`phone`, `user_id`)
        VALUES (NEW.`phone`, NEW.`id`);
    END IF;
END;
//
-- 사용자가 삭제되면, phones 테이블에서 해당 사용자의 전화번호를 삭제
CREATE TRIGGER `after_delete_user`
AFTER DELETE ON `users`
FOR EACH ROW
BEGIN
    DELETE FROM `phones`
    WHERE `phone` = OLD.`phone`;
END;
//

DELIMITER ;

CREATE TABLE `brands` ( 
	`id` INT NOT NULL AUTO_INCREMENT,
	`brand_name` VARCHAR(30) NOT NULL,
	`is_deleted` BOOL NOT NULL DEFAULT false,
	PRIMARY KEY (`id`)
);


-- instance 추가 요함
CREATE TABLE `product_category` ( 
	`id` INT NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(30) NOT NULL,
  	PRIMARY KEY (`id`)
);

CREATE TABLE `products` ( 
	`id` INT NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(255) NOT NULL,
	`price` INT NOT NULL,
	`description` TEXT NOT NULL,
	`category_id` INT NOT NULL,
	`brand_id` INT NOT NULL,
	`created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`views` INT NOT NULL DEFAULT 0,
	`is_deleted` BOOL NOT NULL DEFAULT false,
	`wishlist_count` INT NOT NULL DEFAULT 0,
	`thumbnail_image` TEXT NOT NULL,
	`images` TEXT,
    `sales_volume` INT NOT NULL DEFAULT 0,
	PRIMARY KEY (`id`),
	FOREIGN KEY (`category_id`) REFERENCES `product_category`(`id`),
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`)
);

CREATE TABLE `user_wish_list` ( 
	`user_id` INT NOT NULL,
	`product_id` INT NOT NULL,
	`created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`user_id`, `product_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
);



-- 1: 친구의가입, 2: 친구의생일, 3: 친구티끌링시작, 4: 내생일다가옴, 5:띠끌수령, 6: 마지막티끌수령, 7: 티끌링기간마감, 8: 받은티끌환불
CREATE TABLE `notification_type` ( 
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`)
);
INSERT INTO notification_type (name) values ('새로운 친구');
INSERT INTO notification_type (name) values ('친구의 생일');
INSERT INTO notification_type (name) values ('티클링 시작');
INSERT INTO notification_type (name) values ('다가오는 나의 생일');
INSERT INTO notification_type (name) values ('티클 도착');
INSERT INTO notification_type (name) values ('티클링 완료');
INSERT INTO notification_type (name) values ('티클링 종료');
INSERT INTO notification_type (name) values ('받은 티클 환불');
INSERT INTO notification_type (name) values ('결제 취소');

CREATE TABLE `notification` ( 
    `id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `message` TEXT NOT NULL,
    `is_deleted` BOOL NOT NULL DEFAULT false,
    `is_read` BOOL NOT NULL DEFAULT false,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `notification_type_id` INT NOT NULL,
	`deep_link` VARCHAR(255),
	`link` VARCHAR(255),
	`meta_data` TEXT,
    `source_user_id` INT,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
    FOREIGN KEY (`notification_type_id`) REFERENCES `notification_type`(`id`),
    FOREIGN KEY (`source_user_id`) REFERENCES `users`(`id`)
);

CREATE TABLE `product_option` ( 
	`id` INT NOT NULL AUTO_INCREMENT,
    `product_id` INT NOT NULL,
    `category` VARCHAR(255),
    `option` VARCHAR(255),
	`additional_amount` INT NOT NULL DEFAULT 0,
	`is_deleted` BOOL NOT NULL DEFAULT false,
	PRIMARY KEY (`id`),
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
);



CREATE TABLE `option_combination` (
	`id` INT NOT NULL AUTO_INCREMENT,
    `product_id` INT NOT NULL,
    `sales_volume` INT NOT NULL DEFAULT 0,
	`quantity` INT NOT NULL DEFAULT 100000,
    PRIMARY KEY (`id`),
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
);

CREATE TABLE `option_combination_detail` (
    `combination_id` INT NOT NULL,
    `option_id` INT NOT NULL,
    FOREIGN KEY (`combination_id`) REFERENCES `option_combination`(`id`),
	FOREIGN KEY (`option_id`) REFERENCES `product_option`(`id`)
);



-- 1: 진행중, 2: 시작 이전 종료, 3: 완료되기 전 종료, 4: 조각을 모두 모은 후 종료
CREATE TABLE `tikkling_state` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`)
);
INSERT INTO tikkling_state (id, name) values (1, '진행중');
INSERT INTO tikkling_state (id, name) values (2, '시작 이전 종료');
INSERT INTO tikkling_state (id, name) values (3, '완료되기 전 종료');
INSERT INTO tikkling_state (id, name) values (4, '조각을 모두 모은 후 종료');
INSERT INTO tikkling_state (id, name) values (5, '기간 종료');


CREATE TABLE `tikkling` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `funding_limit` DATE NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `tikkle_quantity` INT NOT NULL,
    `product_id` INT NOT NULL,
    `terminated_at` TIMESTAMP NULL,
    `state_id` INT NOT NULL DEFAULT 1,
    `type` VARCHAR(255) NOT NULL,
    `resolution_type` ENUM('goods', 'refund', 'cancel') NULL,
    `option_combination_id` INT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`),
    FOREIGN KEY (`state_id`) REFERENCES `tikkling_state`(`id`) ON UPDATE CASCADE,
    FOREIGN KEY (`option_combination_id`) REFERENCES `option_combination`(`id`),
    UNIQUE (`id`)
);


DELIMITER //
-- 티클링이 하나 추가될 때 해당 유저의 is_tikkling을 true로 바꿈
CREATE TRIGGER `after_insert_tikkling`
AFTER INSERT ON `tikkling`
FOR EACH ROW
BEGIN
    UPDATE `users`
    SET `is_tikkling` = true
    WHERE `id` = NEW.`user_id`;
END;
//

CREATE TABLE `courier_company` (
    `name` VARCHAR(255) NOT NULL,
    `code` VARCHAR(10) NOT NULL,
    PRIMARY KEY (`code`)
);

INSERT INTO `courier_company` (name, code) VALUES ('CJ대한통운', '04');
INSERT INTO `courier_company` (name, code) VALUES ('한진택배', '05');
INSERT INTO `courier_company` (name, code) VALUES ('롯데택배', '08');
INSERT INTO `courier_company` (name, code) VALUES ('우체국택배', '01');
INSERT INTO `courier_company` (name, code) VALUES ('로젠택배', '06');
INSERT INTO `courier_company` (name, code) VALUES ('일양로지스', '11');
INSERT INTO `courier_company` (name, code) VALUES ('한덱스', '20');
INSERT INTO `courier_company` (name, code) VALUES ('대신택배', '22');
INSERT INTO `courier_company` (name, code) VALUES ('경동택배', '23');
INSERT INTO `courier_company` (name, code) VALUES ('합동택배', '32');
INSERT INTO `courier_company` (name, code) VALUES ('CU 편의점택배', '46');
INSERT INTO `courier_company` (name, code) VALUES ('GS Postbox 택배', '24');
INSERT INTO `courier_company` (name, code) VALUES ('한의사랑택배', '16');
INSERT INTO `courier_company` (name, code) VALUES ('천일택배', '17');
INSERT INTO `courier_company` (name, code) VALUES ('건영택배', '18');
INSERT INTO `courier_company` (name, code) VALUES ('굿투럭', '40');
INSERT INTO `courier_company` (name, code) VALUES ('애니트랙', '43');
INSERT INTO `courier_company` (name, code) VALUES ('SLX택배', '44');
INSERT INTO `courier_company` (name, code) VALUES ('우리택배(구호남택배)', '45');
INSERT INTO `courier_company` (name, code) VALUES ('우리한방택배', '47');
INSERT INTO `courier_company` (name, code) VALUES ('농협택배', '53');
INSERT INTO `courier_company` (name, code) VALUES ('홈픽택배', '54');
INSERT INTO `courier_company` (name, code) VALUES ('IK물류', '71');
INSERT INTO `courier_company` (name, code) VALUES ('성훈물류', '72');
INSERT INTO `courier_company` (name, code) VALUES ('용마로지스', '74');
INSERT INTO `courier_company` (name, code) VALUES ('원더스퀵', '75');
INSERT INTO `courier_company` (name, code) VALUES ('로지스밸리택배', '79');
INSERT INTO `courier_company` (name, code) VALUES ('컬리넥스트마일', '82');
INSERT INTO `courier_company` (name, code) VALUES ('풀앳홈', '85');
INSERT INTO `courier_company` (name, code) VALUES ('삼성전자물류', '86');
INSERT INTO `courier_company` (name, code) VALUES ('큐런택배', '88');
INSERT INTO `courier_company` (name, code) VALUES ('두발히어로', '89');
INSERT INTO `courier_company` (name, code) VALUES ('위니아딤채', '90');
INSERT INTO `courier_company` (name, code) VALUES ('지니고 당일배송', '92');
INSERT INTO `courier_company` (name, code) VALUES ('오늘의픽업', '94');
INSERT INTO `courier_company` (name, code) VALUES ('로지스밸리', '96');
INSERT INTO `courier_company` (name, code) VALUES ('한샘서비스원 택배', '101');
INSERT INTO `courier_company` (name, code) VALUES ('NDEX KOREA', '103');
INSERT INTO `courier_company` (name, code) VALUES ('도도플렉스(dodoflex)', '104');
INSERT INTO `courier_company` (name, code) VALUES ('LG전자(판토스)', '107');
INSERT INTO `courier_company` (name, code) VALUES ('부릉', '110');
INSERT INTO `courier_company` (name, code) VALUES ('1004홈', '112');
INSERT INTO `courier_company` (name, code) VALUES ('썬더히어로', '113');
INSERT INTO `courier_company` (name, code) VALUES ('(주)팀프레시', '116');
INSERT INTO `courier_company` (name, code) VALUES ('롯데칠성', '118');
INSERT INTO `courier_company` (name, code) VALUES ('핑퐁', '119');
INSERT INTO `courier_company` (name, code) VALUES ('발렉스 특수물류', '120');
INSERT INTO `courier_company` (name, code) VALUES ('엔티엘피스', '123');
INSERT INTO `courier_company` (name, code) VALUES ('GTS로지스', '125');
INSERT INTO `courier_company` (name, code) VALUES ('로지스팟', '127');
INSERT INTO `courier_company` (name, code) VALUES ('홈픽 오늘도착', '129');
INSERT INTO `courier_company` (name, code) VALUES ('로지스파트너', '130');
INSERT INTO `courier_company` (name, code) VALUES ('딜리래빗', '131');
INSERT INTO `courier_company` (name, code) VALUES ('지오피', '132');
INSERT INTO `courier_company` (name, code) VALUES ('에이치케이홀딩스', '134');
INSERT INTO `courier_company` (name, code) VALUES ('HTNS', '135');
INSERT INTO `courier_company` (name, code) VALUES ('케이제이티', '136');
INSERT INTO `courier_company` (name, code) VALUES ('더바오', '137');
INSERT INTO `courier_company` (name, code) VALUES ('라스트마일', '138');
INSERT INTO `courier_company` (name, code) VALUES ('오늘회 러쉬', '139');
INSERT INTO `courier_company` (name, code) VALUES ('탱고앤고', '142');
INSERT INTO `courier_company` (name, code) VALUES ('투데이', '143');
INSERT INTO `courier_company` (name, code) VALUES ('현대글로비스', '145');
INSERT INTO `courier_company` (name, code) VALUES ('ARGO', '148');
INSERT INTO `courier_company` (name, code) VALUES ('자이언트', '151');
INSERT INTO `courier_company` (name, code) VALUES ('HY', '155');
INSERT INTO `courier_company` (name, code) VALUES ('유피로지스', '156');
INSERT INTO `courier_company` (name, code) VALUES ('우진인터로지스', '157');
INSERT INTO `courier_company` (name, code) VALUES ('삼다수 가정배송', '159');
INSERT INTO `courier_company` (name, code) VALUES ('와이드테크', '160');
INSERT INTO `courier_company` (name, code) VALUES ('위니온로지스', '163');
INSERT INTO `courier_company` (name, code) VALUES ('딜리박스', '167');
INSERT INTO `courier_company` (name, code) VALUES ('이스트라', '168');



-- 1: 배송 준비, 2: 출발, 3: 도착, 4: 수령
CREATE TABLE `delivery_state` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`)
);

INSERT INTO delivery_state (name) values ('배송 준비');
INSERT INTO delivery_state (name) values ('출발');
INSERT INTO delivery_state (name) values ('도착');
INSERT INTO delivery_state (name) values ('수령');

drop table if exists delivery_info;
CREATE TABLE `delivery_info` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `invoice_number` VARCHAR(255) NULL,
    `courier_company_code` VARCHAR(10) NULL,
    `tikkling_id` INT NOT NULL,
    `state_id` INT NOT NULL DEFAULT 1,
    `zonecode` VARCHAR(255),
    `address` VARCHAR(255) NOT NULL,
    `detail_address` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `start_delivery_date` DATE NULL,
    `expected_delivery_date` DATE NULL,
    `actual_delivery_date` DATE NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`tikkling_id`) REFERENCES `tikkling`(`id`),
    FOREIGN KEY (`state_id`) REFERENCES `delivery_state`(`id`),
    FOREIGN KEY (`courier_company_code`) REFERENCES `courier_company`(`code`)
);


CREATE TABLE `refund_state` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`)
);

INSERT INTO refund_state (name) values ('환불 요청');
INSERT INTO refund_state (name) values ('환불 완료');


CREATE TABLE `refund` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `tikkling_id` INT NOT NULL,
    `bank_code` INT NOT NULL,
    `account` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `state_id` INT NOT NULL DEFAULT 1,
    `expected_refund_amount` INT NOT NULL,
    `actual_refund_amount` INT NULL,
    `refund_date` DATE NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`tikkling_id`) REFERENCES `tikkling`(`id`),
    FOREIGN KEY (`state_id`) REFERENCES `refund_state`(`id`),
    FOREIGN KEY (`bank_code`) REFERENCES `bank`(`bank_code`)
);

-- 1: 친구, 2: 친구 대기, 3: 차단
CREATE TABLE `relation_state` ( 
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(30) NOT NULL,
    PRIMARY KEY (`id`)
);

INSERT INTO relation_state (name) values ('친구');
INSERT INTO relation_state (name) values ('친구 대기');
INSERT INTO relation_state (name) values ('차단');

CREATE TABLE `friends_relation` (
    `id` INT NOT NULL AUTO_INCREMENT COMMENT 'AUTO_INCREMENT',
    `central_user_id` INT NOT NULL,
    `friend_user_id` INT NOT NULL,
    `relation_state_id` INT NOT NULL,   
    PRIMARY KEY (`id`),
		UNIQUE (`central_user_id`, `friend_user_id`),
    FOREIGN KEY (`central_user_id`) REFERENCES `users`(`id`),
    FOREIGN KEY (`friend_user_id`) REFERENCES `users`(`id`),
    FOREIGN KEY (`relation_state_id`) REFERENCES `relation_state`(`id`)
);



CREATE TABLE sending_tikkle_state (
    id INT(11) PRIMARY KEY,
    name VARCHAR(255)
);
INSERT INTO sending_tikkle_state (id, name)
VALUES
    (1, '미사용'),
    (2, '사용'),
    (3, '환불'),
    (4, '환급'),
    (5, '결제 대기'),
    (6, '결제 실패');


CREATE TABLE `sending_tikkle` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `tikkling_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `message` TEXT NULL,
    `quantity` INT NOT NULL,
	`state_id` INT NOT NULL DEFAULT 1,
    `merchant_uid` VARCHAR(64) NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`tikkling_id`) REFERENCES `tikkling`(`id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
    FOREIGN KEY (`state_id`) REFERENCES `sending_tikkle_state`(`id`)
);

-- tikkling_id에 index 추가
ALTER TABLE `sending_tikkle` ADD INDEX `idx_tikkling_id` (`tikkling_id`);

-- central_user_id에 index 추가
ALTER TABLE `friends_relation` ADD INDEX `idx_central_user_id` (`central_user_id`);

-- tikkling에 index 추가
ALTER TABLE tikkling ADD INDEX idx_user_id (user_id);

-- 진행중인 티클에 상품이름, 브랜드, 티클 개수를 함께 볼 수 있음
DROP VIEW IF EXISTS active_tikkling_view;
CREATE VIEW active_tikkling_view AS 
SELECT 
    tikkling.id as tikkling_id, 
    tikkling.user_id,
    tikkling.funding_limit,
    tikkling.created_at,
    tikkling.tikkle_quantity,
    tikkling.product_id,
    tikkling.terminated_at,
    tikkling.state_id,
    tikkling.type,
    tikkling.option_combination_id,
    COALESCE(SUM(sending_tikkle.quantity), 0) as tikkle_count, 
    products.name as product_name, 
    products.thumbnail_image, 
    brands.brand_name,
    products.category_id
FROM tikkling
LEFT JOIN sending_tikkle ON tikkling.id = sending_tikkle.tikkling_id and sending_tikkle.state_id = 1
INNER JOIN products ON tikkling.product_id = products.id
INNER JOIN brands ON products.brand_id = brands.id
WHERE tikkling.terminated_at IS NULL
GROUP BY tikkling.id;



--tikkling의 terminated_at이 변경시 이를 user의 is_tikkling을 0으로 변경
DELIMITER //
CREATE TRIGGER after_update_tikkling AFTER UPDATE ON tikkling
FOR EACH ROW
BEGIN
    IF NEW.`terminated_at` IS NOT NULL AND OLD.`terminated_at` IS NULL THEN
        UPDATE `users`
        SET `is_tikkling` = false
        WHERE `id` = NEW.`user_id`;
    END IF;
END//
DELIMITER ;


-- 기존의 create_tikkling 저장 프로시저 삭제
DROP PROCEDURE IF EXISTS `create_tikkling`;

-- 새로운 create_tikkling 저장 프로시저 추가
DELIMITER //

CREATE PROCEDURE `create_tikkling`(
    IN input_user_id INT,
    IN funding_limit VARCHAR(255),
    IN tikkle_quantity INT,
    IN input_product_id INT,
    IN type VARCHAR(255),
    OUT out_result BOOLEAN
)
BEGIN
    DECLARE product_quantity INT;
    DECLARE user_tikkling_ticket INT;
    DECLARE user_is_tikkling BOOL;

    -- 오류 핸들러 정의: 어떠한 오류가 발생하면 ROLLBACK 후 종료
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET out_result = FALSE;
    END;

    START TRANSACTION;

    SELECT quantity INTO product_quantity FROM products WHERE id = input_product_id FOR UPDATE;
    SELECT tikkling_ticket, is_tikkling INTO user_tikkling_ticket, user_is_tikkling FROM users WHERE id = input_user_id FOR UPDATE;

    IF product_quantity > 0 AND user_tikkling_ticket > 0 AND user_is_tikkling <> true THEN
        INSERT INTO `tikkling` (`user_id`, `funding_limit`, `tikkle_quantity`, `product_id`, `type`) 
        VALUES (input_user_id, funding_limit, tikkle_quantity, input_product_id, type);
        UPDATE products SET quantity = quantity-1 WHERE id = input_product_id;
        UPDATE users SET tikkling_ticket = tikkling_ticket-1 WHERE id = input_user_id;
        DELETE FROM user_wish_list WHERE user_id = input_user_id AND product_id = input_product_id;
        SET out_result = TRUE;
    ELSE
        SET out_result = FALSE;
    END IF;

    COMMIT;
END //

DELIMITER ;




