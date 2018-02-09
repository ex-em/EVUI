function Validate() {
}

// 이메일 유효성 검사
Validate.prototype = {
  email(email) {
    const regex = new RegExp(/^[0-9a-zA-Z]([-_\]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i);
    return regex.test(email);
  },
};


module.exports = Validate;
