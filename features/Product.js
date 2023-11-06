const { ExpectedError } = require("./ExpectedError.js");

class OptionCombination {
  constructor({ id, product_id, sales_volume, quantity, db }) {
    this.id = id || null;
    this.product_id = product_id || null;
    this.sales_volume = sales_volume || null;
    this.quantity = quantity || null;
    this.db = db || null;
  }
  /**
   * 재고를 감소시키는 함수
   * @memberof OptionCombination
   * @instance
   * @async
   * @example
   * const option_combination = new OptionCombination({id: 1, db});
   * await option_combination.decreaseQuantity();
   * // => option_combination = {
   * //  id: 1,
   * //  product_id: 1,
   * //  sales_volume: 0,
   * //  quantity: 99,
   * // }
   * @returns {Promise<void>} - A promise that resolves with nothing.
   * @throws {ExpectedError} Throws an ExpectedError with status 500 if the database query fails.
   * @throws {ExpectedError} Throws an ExpectedError with status 400 if the option combination is not valid.
   */

  async decreaseQuantity() {
    try {
      if (this.quantity) {
        this.quantity -= 1;
      }
      const result = this.db.executeQuery(`UPDATE option_combination SET quantity = quantity - 1 WHERE id = ?`, [this.id]);
      if (result.affectedRows === 0) {
        throw error;
      }
    } catch (error) {
      console.error(`🚨error -> decreaseQuantity : 🐞${error}`);
      throw error;
    }
  }
  /**
   * 재고를 증가시키는 함수
   * @memberof OptionCombination
   * @instance
   * @async
   * @example
   * const option_combination = new OptionCombination({id: 1, db});
   * await option_combination.increaseQuantity();
   * // => option_combination = {
   * //  id: 1,
   * //  product_id: 1,
   * //  sales_volume: 0,
   * //  quantity: 101,
   * // }
   * @returns {Promise<void>} - A promise that resolves with nothing.
   * @throws {ExpectedError} Throws an ExpectedError with status 500 if the database query fails.
   * @throws {ExpectedError} Throws an ExpectedError with status 400 if the option combination is not valid.
   */
  async increaseQuantity() {
    try {
      if (this.quantity) {
        this.quantity += 1;
      }
      const result = this.db.executeQuery(`UPDATE option_combination SET quantity = quantity + 1 WHERE id = ?`, [this.id]);
      if (result.affectedRows === 0) {
        throw error;
      }
    } catch (error) {
      console.error(`🚨error -> decreaseQuantity : 🐞${error}`);
      throw error;
    }
  }
}

class ProductOption {
  constructor({ id, category, option, additional_amount, isDeleted }) {
    this.id = id;
    this.category = category;
    this.option = option;
    this.additional_amount = additional_amount;
    this.isDeleted = isDeleted;
  }
}

class Brand {
  constructor({ id, brand_name, is_deleted, db }) {
    this.id = id;
    this.brand_name = brand_name;
    this.is_deleted = is_deleted;
    this.db = db;
  }
  toJSON() {
    return {
      id: this.id,
      brand_name: this.brand_name,
      is_deleted: this.is_deleted,
      // 다른 프로퍼티들도 포함시킵니다.
    };
  }

  static async checkBrandNameList(brand_name_list, db) {
    try {
      //기존에 존재하는 브랜드인지 확인
      const placeholders = brand_name_list.map(() => "?").join(", ");
      // 쿼리를 실행할 때 placeholders를 사용하고 배열의 요소들을 전달합니다.
      const result = await db.executeQuery(`SELECT * FROM brands WHERE brand_name IN (${placeholders})`, [...brand_name_list]);
      //존재하지 않는브랜드는 새로 생성
      console.log("🚀 ~ file: Product.js:103 ~ Brand ~ checkBrandNameList ~ result:", result[0]);
      let brand_obj_list = [];

      for (const brand_name of brand_name_list) {
        const brandExists = result.some((brand) => brand.brand_name === brand_name);
        if (!brandExists) {
          const temp_result = await db.executeQuery(`INSERT INTO brands (brand_name) VALUES (?)`, [brand_name]);
          const newBrand = new Brand({ id: temp_result.insertId, brand_name: brand_name, db });
          const newBrandObj = newBrand.toJSON();
          brand_obj_list.push(newBrandObj);
        } else {
          const brand = result.find((brand) => brand.brand_name === brand_name);
          const existingBrand = new Brand({ id: brand.id, brand_name: brand_name, db });
          const existingBrandObj = existingBrand.toJSON();
          console.log("🚀 ~ file: Product.js:123 ~ Brand ~ checkBrandNameList ~ existingBrand:", existingBrandObj);
          brand_obj_list.push(existingBrandObj);
        }
      }

      console.log("🚀 ~ file: Product.js:105 ~ Brand ~ checkBrandNameList ~ brand_obj_list:", brand_obj_list);
      return brand_obj_list;
    } catch (error) {
      console.log(`🚨error -> checkBrandNameList : 🐞${error}`);
      throw error;
    }
  }
}

class Product {
  constructor({ id, name, price, description = null, category_id, thumbnail_image, brand_id, created_at, views, is_deleted, wishlist_count, images, db }) {
    this.id = id || null;
    this.name = name || null;
    this.price = price || null;
    this.description = description || null;
    this.category_id = category_id || null;
    this.brand_id = brand_id || null;
    this.created_at = created_at || null;
    this.views = views || null;
    this.is_deleted = is_deleted || null;
    this.wishlist_count = wishlist_count || null;
    this.thumbnail_image = thumbnail_image || null;
    this.images = images || null;
    this.product_options = [];
    this.selected_options = null;
    this.selected_option_combination = null;
    this.db = db;
  }

  /**
   * 상품이 갖고있는 모든 옵션을 로드하고 해당 옵션을 product_options에 저장한다.
   * @memberof Product
   * @instance
   * @async
   * @example
   * const product = await Product.createById(1);
   * await product.loadAllProduct_options();
   * // => product.product_options = {
   * //  "색상": ["빨강", "파랑", "노랑"],
   * //  "사이즈": ["S", "M", "L"]
   * // }
   * @throws {ExpectedError} Throws an ExpectedError with status 500 if the database query fails.
   * @returns {Promise<void>} - A promise that resolves with nothing.
   */
  async loadAllProductOptions() {
    try {
      const query = `SELECT * FROM product_option WHERE product_id = ?`;
      const product_options = await this.db.executeQuery(query, [this.id]);
      product_options.forEach(async (productOption) => {
        const product_option = new ProductOption(productOption);
        this.addProductOption(product_option);
      });
    } catch (error) {
      console.error(`🚨error -> loadAllProductOptions : 🐞${error}`);
      throw new ExpectedError({
        status: "500",
        message: `서버에러`,
        detail_code: "00",
      });
    }
  }

  //selected option이 실제 존재하는 option인지 검증하는 함수
  validateProductOption(selectedOption) {
    try {
      for (const [category, option] of Object.entries(selectedOption)) {
        // 선택된 옵션의 카테고리와 일치하는 제품 옵션을 찾는다.
        const matchingOptions = this.product_options.filter((productOption) => productOption.category === category);
        // 일치하는 카테고리가 없으면, 선택된 옵션은 유효하지 않다.
        if (matchingOptions.length === 0) {
          throw new ExpectedError({
            status: "400",
            message: `해당 옵션은 존재하지 않습니다.`,
            detail_code: "01",
          });
        }
        // 일치하는 카테고리가 있다면, 선택된 옵션이 유효한지 확인한다.
        if (!matchingOptions.some((productOption) => productOption.option === option)) {
          throw new ExpectedError({
            status: "400",
            message: `해당 옵션은 존재하지 않습니다.`,
            detail_code: "01",
          });
        }
      }
    } catch (error) {
      console.log(`🚨error -> validateProductOption : 🐞${error}`);
      if (error.status) {
        throw error;
      }
      throw new ExpectedError({
        status: "500",
        message: `서버에러`,
        detail_code: "00",
      });
    }
  }

  // 선택한 option_combination의 재고가 남아있는지 확인하는 함수
  /**
   * 선택한 옵션 조합의 재고가 남아있는지 확인하는 함수
   * @memberof Product
   * @instance
   * @async
   * @example
   * const product = await Product.createById(1);
   * await product.loadSelectedProductOptionCombination();
   * product.validateProductOptionCombination();
   * // => product.selected_option_combination = {
   * //  id: 1,
   * //  sales_volume: 0,
   * //  quantity: 100,

   * // }
   * @returns {Promise<void>} - A promise that resolves with nothing.
   * @throws {ExpectedError} Throws an ExpectedError with status 400 if the selected option combination is not valid.
   */
  validateProductOptionCombination() {
    if (this.selected_option_combination.quantity === 0) {
      throw new ExpectedError({
        status: "400",
        message: `해당 옵션 조합의 재고가 없습니다.`,
        detail_code: "01",
      });
    }
  }

  //TODO: 서브쿼리 사용하여 최적화 요함
  async loadSelectedProductOptionCombination() {
    try {
      const selected_option_values = Object.values(this.selected_options);
      const count = selected_option_values.length;
      const formattedValues = selected_option_values.map((val) => `'${val}'`).join(", ");
      const findCombinationQuery = `
          SELECT oc.*
          FROM option_combination AS oc
          INNER JOIN option_combination_detail AS ocd ON oc.id = ocd.combination_id
          INNER JOIN product_option AS po ON po.id = ocd.option_id
          WHERE po.option IN (${formattedValues}) AND oc.product_id = ?
          GROUP BY oc.id
          HAVING COUNT(*) = ?;
        `;

      const result = await this.db.executeQuery(findCombinationQuery, [this.id, count]);
      if (result.length === 0) {
        throw new ExpectedError({
          status: "400",
          message: `해당 옵션 조합이 존재하지 않습니다.`,
          detail_code: "01",
        });
      }

      const option_combination = new OptionCombination({ ...result[0], db: this.db });
      this.selected_option_combination = option_combination;
    } catch (error) {
      console.log(`🚨error -> loadSelectedProductOptionCombination : 🐞${error}`);
      throw new ExpectedError({
        status: "500",
        message: `서버에러`,
        detail_code: "00",
      });
    }
  }

  //product의 가격을 계산하고 해당 가격을 input값과 비교
  /**
   * 상품의 가격을 계산하고 해당 가격을 input값과 비교하는 함수
   * @memberof Product
   * @instance
   * @async
   * @example
   * const product = await Product.createById(1);
   * await product.loadSelectedProductOptionCombination();
   * product.validateProductOptionCombination();
   * product.validateProductPrice(10000);
   * // => product.selected_option_combination = {
   * //  id: 1,
   * //  product_id: 1,
   * //  sales_volume: 0,
   * //  quantity: 100,
   * // }
   * @returns {Promise<void>} - A promise that resolves with nothing.
   * @throws {ExpectedError} Throws an ExpectedError with status 400 if the product price is not valid.
   * @param {number} input_price - The price of the product to validate.
   */
  async validateProductPrice(input_price) {
    try {
      const totalPrice = this.calculateTotalPrice();
      if (totalPrice !== input_price) {
        throw new ExpectedError({
          status: "400",
          message: `상품의 가격이 일치하지 않습니다.`,
          detail_code: "01",
        });
      }
    } catch (error) {
      console.log(`🚨error -> validateProductPrice : 🐞${error}`);
      if (error.status) {
        throw error;
      }
      throw new ExpectedError({
        status: "500",
        message: `서버에러`,
        detail_code: "00",
      });
    }
  }

  async lockProduct() {
    try {
      this.db.executeQuery(`SELECT * FROM products WHERE id = ? FOR UPDATE;`, [this.id]);
    } catch (err) {
      console.error(`🚨 error -> ⚡️ lockProductForStartTIkkling : 🐞 ${err}`);
      throw new ExpectedError({
        status: "500",
        message: `서버에러`,
        detail_code: "00",
      });
    }
  }

  async updateSelectedOption(product_option) {
    this.selected_options = product_option;
  }

  addProductOption(productOption) {
    this.product_options.push(productOption);
  }

  //product_option의 addition_amount와 selectedoption을 고려하여 product의 전체 가격을 계산하는 함수
  calculateTotalPrice() {
    try {
      let additionalAmount = 0;

      this.product_options.forEach(({ category, option, additional_amount }) => {
        if (this.selected_options[category] === option) {
          additionalAmount += additional_amount;
        }
      });
      return this.price + additionalAmount;
    } catch (error) {
      console.log(`🚨error -> calculateTotalPrice : 🐞${error}`);
      throw new ExpectedError({
        status: "500",
        message: `서버에러`,
        detail_code: "00",
      });
    }
  }

  selectProductOption(category, option) {
    // 유효한 카테고리인지 확인
    if (!this.product_options.hasOwnProperty(category)) {
      console.log(`Invalid category: ${category}`);
      return;
    }

    // 유효한 옵션인지 확인
    if (!this.product_options[category].includes(option)) {
      console.log(`Invalid option: ${option} for category: ${category}`);
      return;
    }

    // 이미 선택된 옵션이 있는지 확인하고, 있으면 업데이트
    if (this.selected_options.hasOwnProperty(category)) {
      console.log(`Updating option from ${this.selected_options[category]} to ${option}`);
    }

    // 선택된 옵션 저장
    this.selected_options[category] = option;
  }
  /**
   * id를 사용하여 Product 인스턴스를 생성한다.
   * @memberof Product
   * @static
   * @async
   * @example
   * const db = new DBManager();
   * await db.openTransaction();
   * const product = await Product.createById(1, db);
   * // => product = {
   * //  id: 1,
   * //  name: "티클링 상품",
   * //  price: 10000,
   * //  description: "티클링 상품입니다.",
   * //  category_id: 1,
   * //  brand_id: 1,
   * //  created_at: "2020-01-01 00:00:00",
   * //  views: 0,
   * //  is_deleted: 0,
   * //  wishlist_count: 0,
   * //  thumbnail_image: "https://tikkle-image.s3.ap-northeast-2.amazonaws.com/1.jpg",
   * //  images: [
   * //    "https://tikkle-image.s3.ap-northeast-2.amazonaws.com/1.jpg",
   * //    "https://tikkle-image.s3.ap-northeast-2.amazonaws.com/2.jpg",
   * //    "https://tikkle-image.s3.ap-northeast-2.amazonaws.com/3.jpg",
   * //  ],
   * //  product_options: [],
   * //  selected_options: null,
   * //  selected_option_combination: null,
   * // }
   * @throws {ExpectedError} Throws an ExpectedError with status 500 if the database query fails.
   * @param {number} id - The id of the product to create.
   * @returns {Promise<Product>} - A promise that resolves with a Product instance.
   */
  static createById = async ({ id, db }) => {
    try {
      const query = `SELECT * FROM products WHERE id = ?`;
      const rows = await db.executeQuery(query, [id]);
      return new Product({ ...rows[0], db });
    } catch (error) {
      console.error(`🚨error -> createById : 🐞${error}`);
      throw new ExpectedError({
        status: "500",
        message: `서버에러`,
        detail_code: "00",
      });
    }
  };

  async decreaseProductQuantity() {
    try {
      this.selected_option_combination.decreaseQuantity();
    } catch (error) {
      console.error(`🚨error -> decreaseProductQuantity : 🐞${error}`);
      throw error;
    }
  }
  async increaseProductSalesVolume() {
    try {
      if (this.sales_volume) {
        this.sales_volume += 1;
      }
      const result = this.db.executeQuery(`UPDATE products SET sales_volume = sales_volume + 1 WHERE id = ?`, [this.id]);
      if (result.affectedRows === 0) {
        throw ExpectedError({
          status: 500,
          detail_code: "00",
          message: "상품 판매량 증가 실패",
        });
      }
    } catch (error) {
      console.error(`🚨error -> increaseQuantity : 🐞${error}`);
      throw error;
    }
  }
}

module.exports = { Product, OptionCombination, Brand };
